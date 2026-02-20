import { Injectable, Logger } from '@nestjs/common';

export interface IngredientWithGrams {
  ingredientId?: string;
  name: string;
  grams: number;
  calories?: number;
  proteins?: number;
  carbs?: number;
  fats?: number;
}

export interface MacroCalcResult {
  calories: number;
  proteins: number;
  carbs: number;
  fats: number;
  ingredients: IngredientWithGrams[];
}

export interface MealTemplateForScaling {
  totalCalories: number;
  totalProteins: number;
  totalCarbs: number;
  totalFats: number;
  scaleableIngredients: string[];
  baseRecipe: {
    ingredients: Array<{ name: string; grams: number }>;
  };
}

export interface MacroIntegrityResult {
  isValid: boolean;
  deviation: number;
  expectedCalories: number;
  actualCalories: number;
}

const CALORIES_PER_GRAM_PROTEIN = 4;
const CALORIES_PER_GRAM_CARBS = 4;
const CALORIES_PER_GRAM_FATS = 9;
const MAX_ACCEPTABLE_DEVIATION = 0.08; // 8% tolerance (accounting for rounding)

@Injectable()
export class MacroCalculatorService {
  private readonly logger = new Logger(MacroCalculatorService.name);

  calculateFromIngredients(
    ingredients: IngredientWithGrams[],
  ): MacroCalcResult {
    const result: MacroCalcResult = {
      calories: 0,
      proteins: 0,
      carbs: 0,
      fats: 0,
      ingredients: [...ingredients],
    };

    for (const ingredient of ingredients) {
      if (!ingredient.calories || ingredient.calories === undefined) {
        this.logger.warn(
          `Missing macros for ingredient: ${ingredient.name}. Skipping.`,
        );
        continue;
      }

      result.calories += ingredient.calories;
      result.proteins += ingredient.proteins || 0;
      result.carbs += ingredient.carbs || 0;
      result.fats += ingredient.fats || 0;
    }

    return {
      calories: Math.round(result.calories),
      proteins: Math.round(result.proteins * 10) / 10,
      carbs: Math.round(result.carbs * 10) / 10,
      fats: Math.round(result.fats * 10) / 10,
      ingredients: result.ingredients,
    };
  }

  scaleTemplate(
    template: MealTemplateForScaling,
    scaleFactor: number,
  ): MacroCalcResult {
    if (scaleFactor <= 0) {
      throw new Error('Scale factor must be greater than 0');
    }

    const scaledIngredients: IngredientWithGrams[] = [];

    for (const ingredient of template.baseRecipe.ingredients) {
      const isScaleable = template.scaleableIngredients.includes(
        ingredient.name,
      );

      const multiplier = isScaleable ? scaleFactor : 1;

      scaledIngredients.push({
        name: ingredient.name,
        grams: Math.round(ingredient.grams * multiplier * 10) / 10,
      });
    }

    const proteins = Math.round(template.totalProteins * scaleFactor * 10) / 10;
    const carbs = Math.round(template.totalCarbs * scaleFactor * 10) / 10;
    const fats = Math.round(template.totalFats * scaleFactor * 10) / 10;

    // Calculate calories from macros to ensure consistency
    const calories = this.calculateCaloriesFromMacros(proteins, carbs, fats);

    return {
      calories,
      proteins,
      carbs,
      fats,
      ingredients: scaledIngredients,
    };
  }

  validateMacroIntegrity(
    calories: number,
    proteins: number,
    carbs: number,
    fats: number,
  ): MacroIntegrityResult {
    const expectedCalories =
      proteins * CALORIES_PER_GRAM_PROTEIN +
      carbs * CALORIES_PER_GRAM_CARBS +
      fats * CALORIES_PER_GRAM_FATS;

    if (expectedCalories === 0 && calories === 0) {
      return {
        isValid: true,
        deviation: 0,
        expectedCalories: 0,
        actualCalories: 0,
      };
    }

    const deviation = Math.abs(expectedCalories - calories) / expectedCalories;
    const isValid = deviation <= MAX_ACCEPTABLE_DEVIATION;

    if (!isValid) {
      this.logger.warn(
        `Macro integrity check failed. Expected: ${Math.round(expectedCalories)}kcal, Actual: ${calories}kcal, Deviation: ${(deviation * 100).toFixed(2)}%`,
      );
    }

    return {
      isValid,
      deviation,
      expectedCalories: Math.round(expectedCalories),
      actualCalories: calories,
    };
  }

  calculateCaloriesFromMacros(
    proteins: number,
    carbs: number,
    fats: number,
  ): number {
    return Math.round(
      proteins * CALORIES_PER_GRAM_PROTEIN +
        carbs * CALORIES_PER_GRAM_CARBS +
        fats * CALORIES_PER_GRAM_FATS,
    );
  }
}
