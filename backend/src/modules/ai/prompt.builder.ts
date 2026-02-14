import { Injectable } from '@nestjs/common';
import type { MealCategory } from '@gympal/shared';

interface NutritionContext {
  targetCalories: number;
  targetProteins: number;
  targetCarbs: number;
  targetFats: number;
  goal: string;
  consumedCalories: number;
  consumedProteins: number;
  consumedCarbs: number;
  consumedFats: number;
  category: MealCategory;
  count: number;
}

@Injectable()
export class PromptBuilder {
  buildSystemPrompt(): string {
    return `You are a professional nutritionist for GymPal fitness app. Generate realistic meal suggestions with accurate macros.

RULES:
1. Suggest only REAL, commonly available meals
2. Provide accurate macro estimates (standard portions)
3. Prioritize protein-rich meals for fitness goals
4. Match meal category (breakfast/lunch/dinner/snack)
5. Ensure macros are mathematically correct: calories ≈ (proteins×4 + carbs×4 + fats×9)

OUTPUT: JSON only
{
  "suggestions": [
    {
      "name": "Meal name",
      "calories": <integer>,
      "proteins": <float>,
      "carbs": <float>,
      "fats": <float>,
      "reasoning": "Why this fits user's goals"
    }
  ]
}`;
  }

  buildUserPrompt(context: NutritionContext): string {
    const remaining = {
      calories: context.targetCalories - context.consumedCalories,
      proteins: context.targetProteins - context.consumedProteins,
      carbs: context.targetCarbs - context.consumedCarbs,
      fats: context.targetFats - context.consumedFats,
    };

    const mealCalories = this.getMealCalorieTarget(
      context.category,
      remaining.calories,
    );

    return `User Profile:
- Daily Goal: ${context.targetCalories} kcal (${context.goal} weight)
- Target Macros: ${context.targetProteins}g protein, ${context.targetCarbs}g carbs, ${context.targetFats}g fat

Today's Progress:
- Consumed: ${context.consumedCalories} kcal (${context.consumedProteins}g P, ${context.consumedCarbs}g C, ${context.consumedFats}g F)
- Remaining: ${remaining.calories} kcal (${remaining.proteins}g P, ${remaining.carbs}g C, ${remaining.fats}g F)

Request: Suggest ${context.count} ${context.category} meals
Target per meal: ~${mealCalories} kcal
Prioritize: ${this.getMacroPriority(remaining)}`;
  }

  private getMealCalorieTarget(
    category: MealCategory,
    remainingCalories: number,
  ): number {
    const defaults = {
      BREAKFAST: 450,
      LUNCH: 600,
      DINNER: 650,
      SNACK: 250,
    };

    // Use remaining calories if it makes sense, otherwise default
    const target =
      remainingCalories > 0 ? remainingCalories / 3 : defaults[category];
    return Math.round(target);
  }

  private getMacroPriority(remaining: {
    proteins: number;
    carbs: number;
    fats: number;
  }): string {
    if (remaining.proteins > 40) return 'Protein (high remaining)';
    if (remaining.carbs > 50) return 'Carbs (high remaining)';
    if (remaining.fats > 30) return 'Healthy fats (high remaining)';
    return 'Balanced macros';
  }

  buildCacheKey(context: NutritionContext): string {
    // Round to reduce unique keys
    const roundedCal = Math.round(context.targetCalories / 50) * 50;
    const roundedP = Math.round(context.targetProteins / 10) * 10;
    const roundedC = Math.round(context.targetCarbs / 10) * 10;
    const roundedF = Math.round(context.targetFats / 10) * 10;

    return `ai:meals:${context.category}:${roundedCal}:${roundedP}:${roundedC}:${roundedF}`;
  }
}
