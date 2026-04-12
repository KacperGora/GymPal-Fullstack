import { Injectable, Logger } from '@nestjs/common';
import type {
  MealSuggestionRequest,
  MealSuggestionsResponse,
  MealSuggestionItem,
  MealCategory,
} from '@gympal/shared';
import { mealSuggestionsResponseSchema } from '@gympal/shared';
import { IngredientCategory } from '../../generated/prisma/client';

import { NutritionService } from '../nutrition/nutrition.service';
import { OpenAiService } from './openai.service';
import { PromptBuilderV2Service } from './prompt-builder-v2.service';
import { TemplateService } from './template.service';
import { AiRetryService } from './ai-retry.service';
import { CacheService } from '../../shared/services/cache.service';
import { IngredientLookupService } from '../../shared/services/ingredient-lookup.service';
import { MealValidatorService } from '../../shared/services/meal-validator.service';

interface AiSelectionResponse {
  templateIndices: number[];
  scalingFactors: number[];
  reasoning?: string;
}

interface DirectSuggestionItem {
  name: string;
  calories: number;
  proteins: number;
  carbs: number;
  fats: number;
  ingredients: { name: string; grams: number }[];
  steps: string[];
  reasoning?: string;
}

interface DirectSuggestionsResponse {
  suggestions: DirectSuggestionItem[];
}

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  constructor(
    private nutrition: NutritionService,
    private templates: TemplateService,
    private validator: MealValidatorService,
    private openai: OpenAiService,
    private promptBuilder: PromptBuilderV2Service,
    private retry: AiRetryService,
    private cache: CacheService,
    private ingredientLookup: IngredientLookupService,
  ) {}

  async generateMealSuggestions(
    userId: number,
    dto: MealSuggestionRequest,
  ): Promise<MealSuggestionsResponse> {
    const language = dto.language || 'en';
    const count = dto.count ?? 3;

    // 1. Get TDEE and daily stats in parallel
    const date = dto.date ? new Date(dto.date) : new Date();
    const [tdee, dailyStats] = await Promise.all([
      this.nutrition.getTDEE(userId),
      this.nutrition.calculateDailyStats(userId, date),
    ]);
    this.logger.debug(`TDEE calculated: ${tdee.targetCalories} kcal`);

    const consumed = {
      calories: dailyStats.calories ?? 0,
      proteins: dailyStats.proteins ?? 0,
      carbs: dailyStats.carbs ?? 0,
      fats: dailyStats.fats ?? 0,
    };

    const remaining = {
      calories: tdee.targetCalories - consumed.calories,
      proteins: tdee.targetProteins - consumed.proteins,
      carbs: tdee.targetCarbs - consumed.carbs,
      fats: tdee.targetFats - consumed.fats,
    };

    this.logger.debug(`Remaining: ${remaining.calories} kcal`);

    // 3. Get templates
    const cachedTemplates = await this.cache.getTemplates(
      language,
      dto.category,
      remaining.calories,
    );

    let templateList;
    if (cachedTemplates) {
      this.logger.debug(`Using cached templates (${cachedTemplates.length})`);
      templateList = cachedTemplates;
    } else {
      templateList = await this.templates.getTemplatesByCategory(
        dto.category,
        remaining.calories,
        language,
      );
      await this.cache.setTemplates(
        language,
        dto.category,
        remaining.calories,
        templateList,
      );
    }

    if (templateList.length === 0) {
      templateList = await this.templates.getPopularTemplates(dto.category, 5);
    }

    // 4. If not enough unique templates, generate directly with AI
    if (templateList.length < count) {
      this.logger.debug(
        `Only ${templateList.length} templates available for ${dto.category}, using direct AI generation`,
      );
      return this.generateDirectly(
        userId,
        dto.category,
        count,
        language,
        tdee.targetCalories,
        consumed,
        remaining,
      );
    }

    // 5. Template-based flow: build prompt
    const promptContext = {
      category: dto.category,
      targetCalories: tdee.targetCalories,
      remaining,
      language,
      count,
      templates: templateList,
    };

    const { system, user, metadata } =
      this.promptBuilder.buildPrompt(promptContext);
    this.logger.debug(
      `Prompt built: ~${metadata.tokenEstimate} tokens, ${metadata.templateCount} templates`,
    );

    const cacheKey = this.promptBuilder.buildCacheKey(promptContext);

    const aiResponse = await this.retry.executeWithRetry(
      () =>
        this.openai.chat(system, user, {
          cacheKey,
          temperature: 0.7,
          model: 'gpt-4o-mini',
        }),
      (response) => this.validateAiResponse(response, templateList.length),
      { maxRetries: 3, backoffMs: 100 },
    );

    const aiSelection = JSON.parse(aiResponse) as AiSelectionResponse;

    // Deduplicate indices
    const seenIndices = new Set<number>();
    const deduplicatedPairs: Array<{ index: number; factor: number }> = [];
    for (let i = 0; i < aiSelection.templateIndices.length; i++) {
      const index = aiSelection.templateIndices[i];
      if (!seenIndices.has(index)) {
        seenIndices.add(index);
        deduplicatedPairs.push({
          index,
          factor: aiSelection.scalingFactors[i],
        });
      }
    }
    if (deduplicatedPairs.length < count) {
      for (
        let i = 0;
        i < templateList.length && deduplicatedPairs.length < count;
        i++
      ) {
        if (!seenIndices.has(i)) {
          seenIndices.add(i);
          deduplicatedPairs.push({ index: i, factor: 1.0 });
        }
      }
    }

    this.logger.debug(
      `AI selected templates: ${deduplicatedPairs.map((p) => p.index).join(', ')}`,
    );

    type TranslationEntry = { name?: string; steps?: string[] };
    type TranslationsMap = Record<string, TranslationEntry>;

    const meals: MealSuggestionItem[] = deduplicatedPairs.map(
      ({ index: templateIndex, factor: scaleFactor }) => {
        const template = templateList[templateIndex];
        const scaledMacros = this.templates.scaleLoadedTemplate(
          template,
          scaleFactor,
        );

        let mealName = template.name;
        let steps: string[] | undefined;
        if (template.translations && language !== 'en') {
          const translations = template.translations as TranslationsMap;
          const translationName = translations[language]?.name;
          if (translationName) mealName = translationName;
          const translationSteps = translations[language]?.steps;
          if (translationSteps) steps = translationSteps;
        }

        return {
          name: mealName,
          calories: scaledMacros.calories,
          proteins: scaledMacros.proteins,
          carbs: scaledMacros.carbs,
          fats: scaledMacros.fats,
          ingredients: scaledMacros.ingredients.map((ing) => ({
            name: ing.name,
            grams: ing.grams,
          })),
          steps,
          reasoning: aiSelection.reasoning,
        };
      },
    );

    return this.buildResponse(meals, tdee.targetCalories, consumed, remaining);
  }

  private static readonly CATEGORY_INGREDIENT_MAP: Record<
    MealCategory,
    IngredientCategory[]
  > = {
    BREAKFAST: [
      IngredientCategory.GRAINS,
      IngredientCategory.DAIRY,
      IngredientCategory.FRUITS,
      IngredientCategory.NUTS_SEEDS,
      IngredientCategory.PROTEIN,
    ],
    LUNCH: [
      IngredientCategory.PROTEIN,
      IngredientCategory.GRAINS,
      IngredientCategory.VEGETABLES,
      IngredientCategory.LEGUMES,
      IngredientCategory.FATS_OILS,
      IngredientCategory.DAIRY,
    ],
    DINNER: [
      IngredientCategory.PROTEIN,
      IngredientCategory.GRAINS,
      IngredientCategory.VEGETABLES,
      IngredientCategory.LEGUMES,
      IngredientCategory.FATS_OILS,
      IngredientCategory.DAIRY,
    ],
    SNACK: [
      IngredientCategory.FRUITS,
      IngredientCategory.NUTS_SEEDS,
      IngredientCategory.DAIRY,
      IngredientCategory.CONDIMENTS,
    ],
  };

  private async generateDirectly(
    _userId: number,
    category: MealCategory,
    count: number,
    language: string,
    targetCalories: number,
    consumed: {
      calories: number;
      proteins: number;
      carbs: number;
      fats: number;
    },
    remaining: {
      calories: number;
      proteins: number;
      carbs: number;
      fats: number;
    },
  ): Promise<MealSuggestionsResponse> {
    const mealCalTarget = this.getMealCalorieTarget(
      category,
      remaining.calories,
      count,
    );

    const allowedCategories = AiService.CATEGORY_INGREDIENT_MAP[category];
    const availableIngredients =
      await this.ingredientLookup.getNamesByCategories(allowedCategories);

    if (availableIngredients.length === 0) {
      this.logger.error(
        `No seeded ingredients found for category ${category}. Run: npm run seed:ingredients`,
      );
      throw new Error(
        'Ingredient database is empty. Run "npm run seed:ingredients" before using AI suggestions.',
      );
    }

    const ingredientList = availableIngredients.join(', ');

    const systemPrompt =
      language === 'pl'
        ? `Jesteś dietetykiem. Generuj realistyczne propozycje posiłków ze składnikami i krokami przygotowania. NIE obliczaj makroskładników — wpisz 0 jako placeholder. Odpowiedz TYLKO w JSON.
Format: {"suggestions":[{"name":"...","calories":0,"proteins":0,"carbs":0,"fats":0,"ingredients":[{"name":"<polska_nazwa>","grams":<int>}],"steps":["..."]}]}
WAŻNE: Używaj TYLKO składników z poniższej listy (dokładne nazwy): ${ingredientList}`
        : `You are a nutritionist. Generate realistic meal suggestions with ingredients and preparation steps. Do NOT calculate macros — use 0 as placeholder. Respond ONLY in JSON.
Format: {"suggestions":[{"name":"...","calories":0,"proteins":0,"carbs":0,"fats":0,"ingredients":[{"name":"<ingredient_name>","grams":<int>}],"steps":["..."]}]}
IMPORTANT: Use ONLY ingredients from this list (exact names): ${ingredientList}`;

    const userPrompt =
      language === 'pl'
        ? `Zaproponuj ${count} RÓŻNYCH posiłków na ${category.toLowerCase()} (${count} różne nazwy!).
Cel dzienny: ${targetCalories} kcal | Spożyte: ${consumed.calories} kcal | Pozostało: ${remaining.calories} kcal
Cel na posiłek: ~${mealCalTarget} kcal
Makra pozostałe: białko ${remaining.proteins.toFixed(0)}g, węgle ${remaining.carbs.toFixed(0)}g, tłuszcze ${remaining.fats.toFixed(0)}g`
        : `Suggest ${count} DIFFERENT meals for ${category.toLowerCase()} (${count} different names!).
Daily target: ${targetCalories} kcal | Consumed: ${consumed.calories} kcal | Remaining: ${remaining.calories} kcal
Per-meal target: ~${mealCalTarget} kcal
Remaining macros: protein ${remaining.proteins.toFixed(0)}g, carbs ${remaining.carbs.toFixed(0)}g, fats ${remaining.fats.toFixed(0)}g`;

    const cacheKey = `ai:direct:${language}:${category}:${count}:${Math.round(remaining.calories / 100) * 100}`;

    const aiResponse = await this.retry.executeWithRetry(
      () =>
        this.openai.chat(systemPrompt, userPrompt, {
          cacheKey,
          temperature: 0.9,
          model: 'gpt-4o-mini',
          maxTokens: 1200,
        }),
      (response) => this.validateDirectResponse(response, count),
      { maxRetries: 3, backoffMs: 100 },
    );

    const parsed = JSON.parse(aiResponse) as DirectSuggestionsResponse;

    const meals: MealSuggestionItem[] = await Promise.all(
      parsed.suggestions.slice(0, count).map(async (s) => {
        const ingredients = Array.isArray(s.ingredients) ? s.ingredients : [];
        const looked = await this.ingredientLookup.calculateMacros(ingredients);

        if (looked.coverage < 0.5) {
          this.logger.warn(
            `Low ingredient coverage (${Math.round(looked.coverage * 100)}%) for "${s.name}" — using partial DB macros`,
          );
        }

        return {
          name: s.name,
          calories: looked.calories,
          proteins: looked.proteins,
          carbs: looked.carbs,
          fats: looked.fats,
          ingredients,
          steps: Array.isArray(s.steps) ? s.steps : [],
          reasoning: s.reasoning,
        };
      }),
    );

    return this.buildResponse(meals, targetCalories, consumed, remaining);
  }

  private buildResponse(
    meals: MealSuggestionItem[],
    targetCalories: number,
    consumed: {
      calories: number;
      proteins: number;
      carbs: number;
      fats: number;
    },
    remaining: {
      calories: number;
      proteins: number;
      carbs: number;
      fats: number;
    },
  ): MealSuggestionsResponse {
    for (const meal of meals) {
      const validation = this.validator.validate(meal);
      if (!validation.isValid) {
        const msgs = validation.errors.map((e) => e.message).join(', ');
        this.logger.error(`Meal validation failed for "${meal.name}": ${msgs}`);
        throw new Error(`Validation failed: ${msgs}`);
      }
    }

    const response: MealSuggestionsResponse = {
      suggestions: meals,
      context: { targetCalories, consumed, remaining },
    };
    return mealSuggestionsResponseSchema.parse(response);
  }

  private getMealCalorieTarget(
    category: MealCategory,
    remainingCalories: number,
    count: number,
  ): number {
    const defaults: Record<MealCategory, number> = {
      BREAKFAST: 450,
      LUNCH: 600,
      DINNER: 650,
      SNACK: 250,
    };
    const divisor = count > 0 ? count : 1;
    const target =
      remainingCalories > 0 ? remainingCalories / divisor : defaults[category];
    return Math.round(target);
  }

  private validateDirectResponse(
    response: string,
    expectedCount: number,
  ): boolean {
    try {
      const parsed = JSON.parse(response) as DirectSuggestionsResponse;
      if (
        !Array.isArray(parsed.suggestions) ||
        parsed.suggestions.length < expectedCount
      ) {
        this.logger.warn(
          `Direct response has ${parsed.suggestions?.length ?? 0} suggestions, expected ${expectedCount}`,
        );
        return false;
      }
      for (const s of parsed.suggestions) {
        if (
          !s.name ||
          typeof s.calories !== 'number' ||
          typeof s.proteins !== 'number' ||
          typeof s.carbs !== 'number' ||
          typeof s.fats !== 'number' ||
          s.proteins < 0 ||
          s.carbs < 0 ||
          s.fats < 0
        ) {
          this.logger.warn('Direct response has malformed suggestion');
          return false;
        }
      }
      return true;
    } catch {
      return false;
    }
  }

  private validateAiResponse(response: string, maxIndex: number): boolean {
    try {
      const parsed = JSON.parse(response) as AiSelectionResponse;

      if (!parsed.templateIndices || !Array.isArray(parsed.templateIndices)) {
        this.logger.warn('AI response missing templateIndices array');
        return false;
      }

      if (!parsed.scalingFactors || !Array.isArray(parsed.scalingFactors)) {
        this.logger.warn('AI response missing scalingFactors array');
        return false;
      }

      if (parsed.templateIndices.length !== parsed.scalingFactors.length) {
        this.logger.warn('AI response arrays have different lengths');
        return false;
      }

      for (const index of parsed.templateIndices) {
        if (index < 0 || index >= maxIndex) {
          this.logger.warn(`AI response has invalid index: ${index}`);
          return false;
        }
      }

      for (const factor of parsed.scalingFactors) {
        if (factor < 0.7 || factor > 1.3) {
          this.logger.warn(`AI response has invalid scaling factor: ${factor}`);
          return false;
        }
      }

      return true;
    } catch (error) {
      this.logger.error('Failed to parse AI response as JSON', error);
      return false;
    }
  }
}
