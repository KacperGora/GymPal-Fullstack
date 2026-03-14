import { Injectable, Logger } from '@nestjs/common';
import type {
  MealSuggestionRequest,
  MealSuggestionsResponse,
  MealSuggestionItem,
} from '@gympal/shared';
import { mealSuggestionsResponseSchema } from '@gympal/shared';

import { NutritionService } from '../nutrition/nutrition.service';
import { OpenAiService } from './openai.service';
import { PromptBuilderV2Service } from './prompt-builder-v2.service';
import { TemplateService } from './template.service';
import { AiRetryService } from './ai-retry.service';
import { CacheService } from '../../shared/services/cache.service';
import { MacroCalculatorService } from '../../shared/services/macro-calculator.service';
import { MealValidatorService } from '../../shared/services/meal-validator.service';

interface AiSelectionResponse {
  templateIndices: number[];
  scalingFactors: number[];
  reasoning?: string;
}

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  constructor(
    private nutrition: NutritionService,
    private templates: TemplateService,
    private macros: MacroCalculatorService,
    private validator: MealValidatorService,
    private openai: OpenAiService,
    private promptBuilder: PromptBuilderV2Service,
    private retry: AiRetryService,
    private cache: CacheService,
  ) {}

  async generateMealSuggestions(
    userId: number,
    dto: MealSuggestionRequest,
  ): Promise<MealSuggestionsResponse> {
    const language = dto.language || 'en';

    // 1. Get TDEE
    const tdee = await this.nutrition.getTDEE(userId);
    this.logger.debug(`TDEE calculated: ${tdee.targetCalories} kcal`);

    // 2. Get daily stats
    const date = dto.date ? new Date(dto.date) : new Date();
    const dailyStats = await this.nutrition.calculateDailyStats(userId, date);

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

    // 3. Get templates matching category + remaining calories
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
      this.logger.warn(
        `No templates found for category=${dto.category}, calories=${remaining.calories}`,
      );
      templateList = await this.templates.getPopularTemplates(dto.category, 5);
    }

    // 4. Build minimal prompt
    const promptContext = {
      category: dto.category,
      targetCalories: tdee.targetCalories,
      remaining,
      language,
      count: dto.count ?? 3,
      templates: templateList,
    };

    const { system, user, metadata } =
      this.promptBuilder.buildPrompt(promptContext);
    this.logger.debug(
      `Prompt built: ~${metadata.tokenEstimate} tokens, ${metadata.templateCount} templates`,
    );

    // 5. Get cache key
    const cacheKey = this.promptBuilder.buildCacheKey(promptContext);

    // 6. Call OpenAI with retry
    const aiResponse = await this.retry.executeWithRetry(
      () =>
        this.openai.chat(system, user, {
          cacheKey,
          temperature: 0.2,
          model: 'gpt-4o-mini',
        }),
      (response) => this.validateAiResponse(response, templateList.length),
      { maxRetries: 3, backoffMs: 100 },
    );

    // 7. Parse AI response
    const aiSelection = JSON.parse(aiResponse) as AiSelectionResponse;
    this.logger.debug(
      `AI selected templates: ${aiSelection.templateIndices.join(', ')}`,
    );

    // 8. Scale templates & calculate macros
    const meals: MealSuggestionItem[] = [];
    for (let i = 0; i < aiSelection.templateIndices.length; i++) {
      const templateIndex = aiSelection.templateIndices[i];
      const scaleFactor = aiSelection.scalingFactors[i];

      const template = templateList[templateIndex];
      const scaledMacros = await this.templates.getTemplateWithScaledMacros(
        template.id,
        scaleFactor,
      );

      // Get template name (with translation if available)
      let mealName = template.name;
      if (template.translations && language !== 'en') {
        const translations = template.translations as Record<string, any>;
        if (translations[language]?.name) {
          mealName = translations[language].name;
        }
      }

      // Get steps (with translation if available)
      let steps: string[] | undefined = undefined;
      if (template.translations && language !== 'en') {
        const translations = template.translations as Record<string, any>;
        if (translations[language]?.steps) {
          steps = translations[language].steps;
        }
      }

      meals.push({
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
      });
    }

    // 9. Validate all meals
    for (const meal of meals) {
      const validation = this.validator.validate(meal);
      if (!validation.isValid) {
        const errorMessages = validation.errors
          .map((e) => e.message)
          .join(', ');
        this.logger.error(
          `Meal validation failed for "${meal.name}": ${errorMessages}`,
        );
        throw new Error(`Validation failed: ${errorMessages}`);
      }
    }

    // 10. Add context & return
    const response: MealSuggestionsResponse = {
      suggestions: meals,
      context: {
        targetCalories: tdee.targetCalories,
        consumed,
        remaining,
      },
    };

    const validated = mealSuggestionsResponseSchema.parse(response);
    return validated;
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
