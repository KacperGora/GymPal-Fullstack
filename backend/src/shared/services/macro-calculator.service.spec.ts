import { Test, TestingModule } from '@nestjs/testing';
import {
  MacroCalculatorService,
  IngredientWithGrams,
  MealTemplateForScaling,
} from './macro-calculator.service';

describe('MacroCalculatorService', () => {
  let service: MacroCalculatorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MacroCalculatorService],
    }).compile();

    service = module.get<MacroCalculatorService>(MacroCalculatorService);
  });

  describe('calculateFromIngredients', () => {
    it('should calculate total macros from ingredients', () => {
      const ingredients: IngredientWithGrams[] = [
        {
          name: 'Chicken Breast',
          grams: 100,
          calories: 165,
          proteins: 31,
          carbs: 0,
          fats: 3.6,
        },
        {
          name: 'Brown Rice',
          grams: 100,
          calories: 123,
          proteins: 2.7,
          carbs: 25.6,
          fats: 1,
        },
      ];

      const result = service.calculateFromIngredients(ingredients);

      expect(result.calories).toBe(288);
      expect(result.proteins).toBe(33.7);
      expect(result.carbs).toBe(25.6);
      expect(result.fats).toBe(4.6);
      expect(result.ingredients).toEqual(ingredients);
    });

    it('should handle single ingredient', () => {
      const ingredients: IngredientWithGrams[] = [
        {
          name: 'Egg',
          grams: 50,
          calories: 72,
          proteins: 6.3,
          carbs: 0.4,
          fats: 4.8,
        },
      ];

      const result = service.calculateFromIngredients(ingredients);

      expect(result.calories).toBe(72);
      expect(result.proteins).toBe(6.3);
      expect(result.carbs).toBe(0.4);
      expect(result.fats).toBe(4.8);
    });

    it('should round results to appropriate precision', () => {
      const ingredients: IngredientWithGrams[] = [
        {
          name: 'Avocado',
          grams: 100,
          calories: 160.333,
          proteins: 2.001,
          carbs: 8.533,
          fats: 14.666,
        },
      ];

      const result = service.calculateFromIngredients(ingredients);

      expect(result.calories).toBe(160);
      expect(result.proteins).toBe(2.0);
      expect(result.carbs).toBe(8.5);
      expect(result.fats).toBe(14.7);
    });

    it('should handle empty ingredients array', () => {
      const ingredients: IngredientWithGrams[] = [];

      const result = service.calculateFromIngredients(ingredients);

      expect(result.calories).toBe(0);
      expect(result.proteins).toBe(0);
      expect(result.carbs).toBe(0);
      expect(result.fats).toBe(0);
      expect(result.ingredients).toEqual([]);
    });

    it('should skip ingredients with missing macros', () => {
      const ingredients: IngredientWithGrams[] = [
        {
          name: 'Valid Ingredient',
          grams: 100,
          calories: 100,
          proteins: 10,
          carbs: 10,
          fats: 5,
        },
        {
          name: 'Invalid Ingredient',
          grams: 100,
        },
      ];

      const result = service.calculateFromIngredients(ingredients);

      expect(result.calories).toBe(100);
      expect(result.proteins).toBe(10);
    });

    it('should handle zero values correctly', () => {
      const ingredients: IngredientWithGrams[] = [
        {
          name: 'Pure Protein',
          grams: 100,
          calories: 400,
          proteins: 100,
          carbs: 0,
          fats: 0,
        },
      ];

      const result = service.calculateFromIngredients(ingredients);

      expect(result.calories).toBe(400);
      expect(result.proteins).toBe(100);
      expect(result.carbs).toBe(0);
      expect(result.fats).toBe(0);
    });

    it('should calculate multiple ingredients with decimal values', () => {
      const ingredients: IngredientWithGrams[] = [
        {
          name: 'Ingredient 1',
          grams: 50,
          calories: 50.5,
          proteins: 5.5,
          carbs: 5.5,
          fats: 2.5,
        },
        {
          name: 'Ingredient 2',
          grams: 75,
          calories: 75.7,
          proteins: 7.7,
          carbs: 7.7,
          fats: 3.7,
        },
      ];

      const result = service.calculateFromIngredients(ingredients);

      expect(result.calories).toBe(126);
      expect(result.proteins).toBe(13.2);
      expect(result.carbs).toBe(13.2);
      expect(result.fats).toBe(6.2);
    });
  });

  describe('scaleTemplate', () => {
    const template: MealTemplateForScaling = {
      totalCalories: 500,
      totalProteins: 40,
      totalCarbs: 50,
      totalFats: 15,
      ingredients: [
        { name: 'Chicken Breast', grams: 150, scaleable: true },
        { name: 'Brown Rice', grams: 100, scaleable: true },
        { name: 'Olive Oil', grams: 10, scaleable: false },
      ],
    };

    it('should scale template by factor 1.5', () => {
      const result = service.scaleTemplate(template, 1.5);

      // Calories calculated from macros: 60*4 + 75*4 + 22.5*9 = 743
      expect(result.calories).toBe(743);
      expect(result.proteins).toBe(60);
      expect(result.carbs).toBe(75);
      expect(result.fats).toBe(22.5);
    });

    it('should scale template by factor 0.8', () => {
      const result = service.scaleTemplate(template, 0.8);

      // Calories calculated from macros: 32*4 + 40*4 + 12*9 = 396
      expect(result.calories).toBe(396);
      expect(result.proteins).toBe(32);
      expect(result.carbs).toBe(40);
      expect(result.fats).toBe(12);
    });

    it('should only scale designated scaleable ingredients', () => {
      const result = service.scaleTemplate(template, 2);

      const chickenIngredient = result.ingredients.find(
        (ing) => ing.name === 'Chicken Breast',
      );
      const riceIngredient = result.ingredients.find(
        (ing) => ing.name === 'Brown Rice',
      );
      const oilIngredient = result.ingredients.find(
        (ing) => ing.name === 'Olive Oil',
      );

      expect(chickenIngredient?.grams).toBe(300);
      expect(riceIngredient?.grams).toBe(200);
      expect(oilIngredient?.grams).toBe(10);
    });

    it('should throw error for zero scale factor', () => {
      expect(() => service.scaleTemplate(template, 0)).toThrow(
        'Scale factor must be greater than 0',
      );
    });

    it('should throw error for negative scale factor', () => {
      expect(() => service.scaleTemplate(template, -1)).toThrow(
        'Scale factor must be greater than 0',
      );
    });

    it('should scale template by factor 1 (no change)', () => {
      const result = service.scaleTemplate(template, 1);

      // Calories calculated from macros: 40*4 + 50*4 + 15*9 = 495
      expect(result.calories).toBe(495);
      expect(result.proteins).toBe(40);
      expect(result.carbs).toBe(50);
      expect(result.fats).toBe(15);
    });

    it('should round scaled ingredient grams to 1 decimal place', () => {
      const result = service.scaleTemplate(template, 1.33);

      const chickenIngredient = result.ingredients.find(
        (ing) => ing.name === 'Chicken Breast',
      );

      expect(chickenIngredient?.grams).toBe(199.5);
    });

    it('should handle template with no scaleable ingredients', () => {
      const templateNoScaleable: MealTemplateForScaling = {
        ...template,
        ingredients: template.ingredients.map((ing) => ({
          ...ing,
          scaleable: false,
        })),
      };

      const result = service.scaleTemplate(templateNoScaleable, 2);

      // Calories calculated from macros: 80*4 + 100*4 + 30*9 = 990
      expect(result.calories).toBe(990);
      result.ingredients.forEach((ing) => {
        const original = template.ingredients.find((i) => i.name === ing.name);
        expect(ing.grams).toBe(original?.grams);
      });
    });
  });

  describe('validateMacroIntegrity', () => {
    it('should validate correct macros (proteins only)', () => {
      const result = service.validateMacroIntegrity(400, 100, 0, 0);

      expect(result.isValid).toBe(true);
      expect(result.expectedCalories).toBe(400);
      expect(result.actualCalories).toBe(400);
      expect(result.deviation).toBe(0);
    });

    it('should validate correct macros (carbs only)', () => {
      const result = service.validateMacroIntegrity(400, 0, 100, 0);

      expect(result.isValid).toBe(true);
      expect(result.expectedCalories).toBe(400);
    });

    it('should validate correct macros (fats only)', () => {
      const result = service.validateMacroIntegrity(900, 0, 0, 100);

      expect(result.isValid).toBe(true);
      expect(result.expectedCalories).toBe(900);
    });

    it('should validate mixed macros within tolerance', () => {
      const result = service.validateMacroIntegrity(500, 40, 50, 15);

      expect(result.isValid).toBe(true);
      expect(result.expectedCalories).toBe(495);
      expect(result.deviation).toBeLessThan(0.05);
    });

    it('should invalidate macros outside tolerance', () => {
      const result = service.validateMacroIntegrity(600, 40, 50, 15);

      expect(result.isValid).toBe(false);
      expect(result.expectedCalories).toBe(495);
      expect(result.deviation).toBeGreaterThan(0.05);
    });

    it('should handle zero calories with zero macros', () => {
      const result = service.validateMacroIntegrity(0, 0, 0, 0);

      expect(result.isValid).toBe(true);
      expect(result.expectedCalories).toBe(0);
      expect(result.actualCalories).toBe(0);
    });

    it('should validate realistic meal example 1', () => {
      const result = service.validateMacroIntegrity(650, 50, 60, 20);

      expect(result.isValid).toBe(true);
    });

    it('should validate realistic meal example 2', () => {
      const result = service.validateMacroIntegrity(300, 25, 20, 12);

      expect(result.isValid).toBe(true);
    });

    it('should detect over-reported calories', () => {
      const result = service.validateMacroIntegrity(1000, 40, 50, 15);

      expect(result.isValid).toBe(false);
      expect(result.actualCalories).toBeGreaterThan(result.expectedCalories);
    });

    it('should handle edge case with 5% deviation boundary', () => {
      const expectedCal = 495;
      const actualCal = Math.round(expectedCal * 1.049);

      const result = service.validateMacroIntegrity(actualCal, 40, 50, 15);

      expect(result.isValid).toBe(true);
    });
  });

  describe('calculateCaloriesFromMacros', () => {
    it('should calculate calories from proteins only', () => {
      const result = service.calculateCaloriesFromMacros(100, 0, 0);

      expect(result).toBe(400);
    });

    it('should calculate calories from carbs only', () => {
      const result = service.calculateCaloriesFromMacros(0, 100, 0);

      expect(result).toBe(400);
    });

    it('should calculate calories from fats only', () => {
      const result = service.calculateCaloriesFromMacros(0, 0, 100);

      expect(result).toBe(900);
    });

    it('should calculate calories from mixed macros', () => {
      const result = service.calculateCaloriesFromMacros(40, 50, 15);

      expect(result).toBe(495);
    });

    it('should handle zero macros', () => {
      const result = service.calculateCaloriesFromMacros(0, 0, 0);

      expect(result).toBe(0);
    });

    it('should round result to nearest integer', () => {
      const result = service.calculateCaloriesFromMacros(10.5, 10.5, 5.5);

      expect(result).toBe(134);
    });
  });
});
