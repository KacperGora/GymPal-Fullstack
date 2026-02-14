import { Injectable, Logger } from '@nestjs/common';
import type {
  MealSuggestionRequest,
  MealSuggestionsResponse,
} from '@gympal/shared';
import { mealSuggestionsResponseSchema } from '@gympal/shared';

import { PrismaService } from '../../shared/db/prisma.service';
import { NutritionService } from '../nutrition/nutrition.service';
import { OpenAiService } from './openai.service';
import { PromptBuilder } from './prompt.builder';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  constructor(
    private prisma: PrismaService,
    private nutrition: NutritionService,
    private openai: OpenAiService,
    private promptBuilder: PromptBuilder,
  ) {}

  async generateMealSuggestions(
    userId: number,
    dto: MealSuggestionRequest,
  ): Promise<MealSuggestionsResponse> {
    // Get user targets and consumed meals
    const tdee = await this.nutrition.getTDEE(userId);
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

    // Build prompts
    const context = {
      targetCalories: tdee.targetCalories,
      targetProteins: tdee.targetProteins,
      targetCarbs: tdee.targetCarbs,
      targetFats: tdee.targetFats,
      goal: tdee.goal,
      consumedCalories: consumed.calories,
      consumedProteins: consumed.proteins,
      consumedCarbs: consumed.carbs,
      consumedFats: consumed.fats,
      category: dto.category,
      count: dto.count ?? 3,
    };

    const systemPrompt = this.promptBuilder.buildSystemPrompt();
    const userPrompt = this.promptBuilder.buildUserPrompt(context);
    const cacheKey = this.promptBuilder.buildCacheKey(context);

    // Call OpenAI
    const rawResponse = await this.openai.chat(
      systemPrompt,
      userPrompt,
      cacheKey,
    );

    // Parse and validate
    let parsed;
    try {
      parsed = JSON.parse(rawResponse);
    } catch (error) {
      this.logger.error('Failed to parse AI response', error);
      throw new Error('Invalid AI response format');
    }

    const validated = mealSuggestionsResponseSchema.parse({
      suggestions: parsed.suggestions,
      context: {
        targetCalories: tdee.targetCalories,
        consumed,
        remaining,
      },
    });

    return validated;
  }
}
