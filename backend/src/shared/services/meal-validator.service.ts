import { Injectable, Logger } from '@nestjs/common';
import { MacroCalculatorService } from './macro-calculator.service';

export interface ValidationError {
  field: string;
  message: string;
  value?: number | string;
}

export interface ValidationWarning {
  field: string;
  message: string;
  value?: number | string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface MealToValidate {
  name: string;
  calories: number;
  proteins: number;
  carbs: number;
  fats: number;
}

const MIN_CALORIES = 50;
const MAX_CALORIES = 2000;
const MIN_PROTEINS = 0;
const MAX_PROTEINS = 200;
const MIN_CARBS = 0;
const MAX_CARBS = 300;
const MIN_FATS = 0;
const MAX_FATS = 150;
const MIN_NAME_LENGTH = 3;
const MAX_NAME_LENGTH = 100;

const WARN_LOW_CALORIES = 100;
const WARN_HIGH_CALORIES = 1500;
const WARN_HIGH_PROTEINS = 100;
const WARN_HIGH_CARBS = 200;
const WARN_HIGH_FATS = 80;

@Injectable()
export class MealValidatorService {
  private readonly logger = new Logger(MealValidatorService.name);

  constructor(private macroCalculator: MacroCalculatorService) {}

  validate(meal: MealToValidate): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    this.validateName(meal.name, errors);

    this.validateCalorieRange(meal.calories, errors, warnings);

    this.validateMacroRanges(meal, errors, warnings);

    this.validateMacroIntegrity(meal, errors);

    const isValid = errors.length === 0;

    if (!isValid) {
      this.logger.warn(
        `Meal validation failed for "${meal.name}": ${errors.length} errors, ${warnings.length} warnings`,
      );
    }

    return {
      isValid,
      errors,
      warnings,
    };
  }

  private validateName(name: string, errors: ValidationError[]): void {
    if (!name || name.trim().length === 0) {
      errors.push({
        field: 'name',
        message: 'Meal name is required',
        value: name,
      });
      return;
    }

    if (name.trim().length < MIN_NAME_LENGTH) {
      errors.push({
        field: 'name',
        message: `Meal name must be at least ${MIN_NAME_LENGTH} characters`,
        value: name,
      });
    }

    if (name.length > MAX_NAME_LENGTH) {
      errors.push({
        field: 'name',
        message: `Meal name must not exceed ${MAX_NAME_LENGTH} characters`,
        value: name,
      });
    }
  }

  private validateCalorieRange(
    calories: number,
    errors: ValidationError[],
    warnings: ValidationWarning[],
  ): void {
    if (calories < MIN_CALORIES) {
      errors.push({
        field: 'calories',
        message: `Calories must be at least ${MIN_CALORIES}`,
        value: calories,
      });
    }

    if (calories > MAX_CALORIES) {
      errors.push({
        field: 'calories',
        message: `Calories must not exceed ${MAX_CALORIES}`,
        value: calories,
      });
    }

    if (calories >= MIN_CALORIES && calories < WARN_LOW_CALORIES) {
      warnings.push({
        field: 'calories',
        message: `Low calorie meal (${calories} kcal). Consider if this is intentional.`,
        value: calories,
      });
    }

    if (calories > WARN_HIGH_CALORIES && calories <= MAX_CALORIES) {
      warnings.push({
        field: 'calories',
        message: `High calorie meal (${calories} kcal). This is unusually large.`,
        value: calories,
      });
    }
  }

  private validateMacroRanges(
    meal: MealToValidate,
    errors: ValidationError[],
    warnings: ValidationWarning[],
  ): void {
    if (meal.proteins < MIN_PROTEINS) {
      errors.push({
        field: 'proteins',
        message: 'Proteins cannot be negative',
        value: meal.proteins,
      });
    }

    if (meal.proteins > MAX_PROTEINS) {
      errors.push({
        field: 'proteins',
        message: `Proteins must not exceed ${MAX_PROTEINS}g`,
        value: meal.proteins,
      });
    }

    if (meal.carbs < MIN_CARBS) {
      errors.push({
        field: 'carbs',
        message: 'Carbs cannot be negative',
        value: meal.carbs,
      });
    }

    if (meal.carbs > MAX_CARBS) {
      errors.push({
        field: 'carbs',
        message: `Carbs must not exceed ${MAX_CARBS}g`,
        value: meal.carbs,
      });
    }

    if (meal.fats < MIN_FATS) {
      errors.push({
        field: 'fats',
        message: 'Fats cannot be negative',
        value: meal.fats,
      });
    }

    if (meal.fats > MAX_FATS) {
      errors.push({
        field: 'fats',
        message: `Fats must not exceed ${MAX_FATS}g`,
        value: meal.fats,
      });
    }

    if (meal.proteins > WARN_HIGH_PROTEINS) {
      warnings.push({
        field: 'proteins',
        message: `Very high protein content (${meal.proteins}g)`,
        value: meal.proteins,
      });
    }

    if (meal.carbs > WARN_HIGH_CARBS) {
      warnings.push({
        field: 'carbs',
        message: `Very high carb content (${meal.carbs}g)`,
        value: meal.carbs,
      });
    }

    if (meal.fats > WARN_HIGH_FATS) {
      warnings.push({
        field: 'fats',
        message: `Very high fat content (${meal.fats}g)`,
        value: meal.fats,
      });
    }
  }

  private validateMacroIntegrity(
    meal: MealToValidate,
    errors: ValidationError[],
  ): void {
    const integrityResult = this.macroCalculator.validateMacroIntegrity(
      meal.calories,
      meal.proteins,
      meal.carbs,
      meal.fats,
    );

    if (!integrityResult.isValid) {
      errors.push({
        field: 'macros',
        message: `Macro integrity check failed. Expected ${integrityResult.expectedCalories} kcal from macros, but got ${integrityResult.actualCalories} kcal (deviation: ${(integrityResult.deviation * 100).toFixed(2)}%)`,
      });
    }
  }
}
