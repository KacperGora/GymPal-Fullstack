import { Test, TestingModule } from '@nestjs/testing';
import { MealValidatorService, MealToValidate } from './meal-validator.service';
import { MacroCalculatorService } from './macro-calculator.service';

describe('MealValidatorService', () => {
  let service: MealValidatorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MealValidatorService, MacroCalculatorService],
    }).compile();

    service = module.get<MealValidatorService>(MealValidatorService);
  });

  describe('validate', () => {
    it('should validate a correct meal', () => {
      const meal: MealToValidate = {
        name: 'Grilled Chicken Salad',
        calories: 500,
        proteins: 40,
        carbs: 50,
        fats: 15,
      };

      const result = service.validate(meal);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject meal with too few calories', () => {
      const meal: MealToValidate = {
        name: 'Tiny Meal',
        calories: 30,
        proteins: 5,
        carbs: 5,
        fats: 0,
      };

      const result = service.validate(meal);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          field: 'calories',
          message: 'Calories must be at least 50',
        }),
      );
    });

    it('should reject meal with too many calories', () => {
      const meal: MealToValidate = {
        name: 'Huge Meal',
        calories: 2500,
        proteins: 100,
        carbs: 200,
        fats: 80,
      };

      const result = service.validate(meal);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          field: 'calories',
          message: 'Calories must not exceed 2000',
        }),
      );
    });

    it('should reject meal with empty name', () => {
      const meal: MealToValidate = {
        name: '',
        calories: 500,
        proteins: 40,
        carbs: 50,
        fats: 15,
      };

      const result = service.validate(meal);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          field: 'name',
          message: 'Meal name is required',
        }),
      );
    });

    it('should reject meal with name too short', () => {
      const meal: MealToValidate = {
        name: 'AB',
        calories: 500,
        proteins: 40,
        carbs: 50,
        fats: 15,
      };

      const result = service.validate(meal);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          field: 'name',
          message: 'Meal name must be at least 3 characters',
        }),
      );
    });

    it('should reject meal with name too long', () => {
      const meal: MealToValidate = {
        name: 'A'.repeat(101),
        calories: 500,
        proteins: 40,
        carbs: 50,
        fats: 15,
      };

      const result = service.validate(meal);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          field: 'name',
          message: 'Meal name must not exceed 100 characters',
        }),
      );
    });

    it('should reject meal with negative proteins', () => {
      const meal: MealToValidate = {
        name: 'Invalid Meal',
        calories: 500,
        proteins: -10,
        carbs: 50,
        fats: 15,
      };

      const result = service.validate(meal);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          field: 'proteins',
          message: 'Proteins cannot be negative',
        }),
      );
    });

    it('should reject meal with excessive proteins', () => {
      const meal: MealToValidate = {
        name: 'Protein Overload',
        calories: 1000,
        proteins: 250,
        carbs: 50,
        fats: 15,
      };

      const result = service.validate(meal);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          field: 'proteins',
          message: 'Proteins must not exceed 200g',
        }),
      );
    });

    it('should reject meal with negative carbs', () => {
      const meal: MealToValidate = {
        name: 'Invalid Meal',
        calories: 500,
        proteins: 40,
        carbs: -10,
        fats: 15,
      };

      const result = service.validate(meal);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          field: 'carbs',
          message: 'Carbs cannot be negative',
        }),
      );
    });

    it('should reject meal with excessive carbs', () => {
      const meal: MealToValidate = {
        name: 'Carb Overload',
        calories: 1500,
        proteins: 40,
        carbs: 350,
        fats: 15,
      };

      const result = service.validate(meal);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          field: 'carbs',
          message: 'Carbs must not exceed 300g',
        }),
      );
    });

    it('should reject meal with negative fats', () => {
      const meal: MealToValidate = {
        name: 'Invalid Meal',
        calories: 500,
        proteins: 40,
        carbs: 50,
        fats: -5,
      };

      const result = service.validate(meal);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          field: 'fats',
          message: 'Fats cannot be negative',
        }),
      );
    });

    it('should reject meal with excessive fats', () => {
      const meal: MealToValidate = {
        name: 'Fat Overload',
        calories: 1500,
        proteins: 40,
        carbs: 50,
        fats: 200,
      };

      const result = service.validate(meal);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          field: 'fats',
          message: 'Fats must not exceed 150g',
        }),
      );
    });

    it('should reject meal with macro integrity issues', () => {
      const meal: MealToValidate = {
        name: 'Inconsistent Macros',
        calories: 1000,
        proteins: 40,
        carbs: 50,
        fats: 15,
      };

      const result = service.validate(meal);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          field: 'macros',
        }),
      );
    });

    it('should warn about low calories', () => {
      const meal: MealToValidate = {
        name: 'Light Snack',
        calories: 80,
        proteins: 8,
        carbs: 8,
        fats: 2,
      };

      const result = service.validate(meal);

      expect(result.isValid).toBe(true);
      expect(result.warnings).toContainEqual(
        expect.objectContaining({
          field: 'calories',
          message: expect.stringContaining('Low calorie meal'),
        }),
      );
    });

    it('should warn about high calories', () => {
      const meal: MealToValidate = {
        name: 'Large Meal',
        calories: 1600,
        proteins: 100,
        carbs: 150,
        fats: 60,
      };

      const result = service.validate(meal);

      expect(result.isValid).toBe(true);
      expect(result.warnings).toContainEqual(
        expect.objectContaining({
          field: 'calories',
          message: expect.stringContaining('High calorie meal'),
        }),
      );
    });

    it('should warn about very high proteins', () => {
      const meal: MealToValidate = {
        name: 'Protein Shake',
        calories: 565,
        proteins: 120,
        carbs: 10,
        fats: 5,
      };

      const result = service.validate(meal);

      expect(result.isValid).toBe(true);
      expect(result.warnings).toContainEqual(
        expect.objectContaining({
          field: 'proteins',
          message: expect.stringContaining('Very high protein content'),
        }),
      );
    });

    it('should warn about very high carbs', () => {
      const meal: MealToValidate = {
        name: 'Pasta Feast',
        calories: 1090,
        proteins: 40,
        carbs: 220,
        fats: 10,
      };

      const result = service.validate(meal);

      expect(result.isValid).toBe(true);
      expect(result.warnings).toContainEqual(
        expect.objectContaining({
          field: 'carbs',
          message: expect.stringContaining('Very high carb content'),
        }),
      );
    });

    it('should warn about very high fats', () => {
      const meal: MealToValidate = {
        name: 'Fatty Meal',
        calories: 930,
        proteins: 20,
        carbs: 20,
        fats: 90,
      };

      const result = service.validate(meal);

      expect(result.isValid).toBe(true);
      expect(result.warnings).toContainEqual(
        expect.objectContaining({
          field: 'fats',
          message: expect.stringContaining('Very high fat content'),
        }),
      );
    });

    it('should handle multiple errors', () => {
      const meal: MealToValidate = {
        name: 'A',
        calories: 3000,
        proteins: -10,
        carbs: 400,
        fats: 200,
      };

      const result = service.validate(meal);

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(3);
    });

    it('should handle multiple warnings', () => {
      const meal: MealToValidate = {
        name: 'Edge Case Meal',
        calories: 1700,
        proteins: 110,
        carbs: 210,
        fats: 85,
      };

      const result = service.validate(meal);

      expect(result.warnings.length).toBeGreaterThan(2);
    });

    it('should trim whitespace from meal name', () => {
      const meal: MealToValidate = {
        name: '  Valid Meal  ',
        calories: 500,
        proteins: 40,
        carbs: 50,
        fats: 15,
      };

      const result = service.validate(meal);

      expect(result.isValid).toBe(true);
    });
  });
});
