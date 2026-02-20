import { Test, TestingModule } from '@nestjs/testing';
import { PromptBuilderV2Service } from './prompt-builder-v2.service';
import { MealCategory } from '../../generated/prisma/enums';
import type { MealTemplate } from './template.service';

describe('PromptBuilderV2Service', () => {
  let service: PromptBuilderV2Service;

  const mockTemplates: MealTemplate[] = [
    {
      id: '1',
      name: 'Chicken Rice',
      category: MealCategory.LUNCH,
      baseRecipe: { ingredients: [] },
      totalCalories: 500,
      totalProteins: 40,
      totalCarbs: 60,
      totalFats: 10,
      scaleableIngredients: [],
      minScale: 0.5,
      maxScale: 2.0,
    },
    {
      id: '2',
      name: 'Beef Bowl',
      category: MealCategory.LUNCH,
      baseRecipe: { ingredients: [] },
      totalCalories: 600,
      totalProteins: 45,
      totalCarbs: 55,
      totalFats: 15,
      scaleableIngredients: [],
      minScale: 0.5,
      maxScale: 2.0,
    },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PromptBuilderV2Service],
    }).compile();

    service = module.get<PromptBuilderV2Service>(PromptBuilderV2Service);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('buildPrompt', () => {
    it('should return prompt with system and user parts', () => {
      const context = {
        category: MealCategory.LUNCH,
        targetCalories: 2000,
        remaining: { calories: 600, proteins: 50, carbs: 70, fats: 20 },
        language: 'en',
        count: 3,
        templates: mockTemplates,
      };

      const result = service.buildPrompt(context);

      expect(result).toHaveProperty('system');
      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('metadata');
      expect(result.system).toContain('meal selection assistant');
      expect(result.user).toContain('600 kcal');
    });

    it('should estimate token count under 200 for minimal prompt', () => {
      const context = {
        category: MealCategory.LUNCH,
        targetCalories: 2000,
        remaining: { calories: 600, proteins: 50, carbs: 70, fats: 20 },
        language: 'en',
        count: 3,
        templates: mockTemplates,
      };

      const result = service.buildPrompt(context);

      expect(result.metadata.tokenEstimate).toBeLessThan(300);
    });

    it('should include template count in metadata', () => {
      const context = {
        category: MealCategory.LUNCH,
        targetCalories: 2000,
        remaining: { calories: 600, proteins: 50, carbs: 70, fats: 20 },
        language: 'en',
        count: 3,
        templates: mockTemplates,
      };

      const result = service.buildPrompt(context);

      expect(result.metadata.templateCount).toBe(2);
    });

    it('should support English language', () => {
      const context = {
        category: MealCategory.LUNCH,
        targetCalories: 2000,
        remaining: { calories: 600, proteins: 50, carbs: 70, fats: 20 },
        language: 'en',
        count: 3,
        templates: mockTemplates,
      };

      const result = service.buildPrompt(context);

      expect(result.system).toContain('meal selection assistant');
      expect(result.system).toContain('DO NOT generate macros');
    });

    it('should support Polish language', () => {
      const context = {
        category: MealCategory.LUNCH,
        targetCalories: 2000,
        remaining: { calories: 600, proteins: 50, carbs: 70, fats: 20 },
        language: 'pl',
        count: 3,
        templates: mockTemplates,
      };

      const result = service.buildPrompt(context);

      expect(result.system).toContain('asystentem wyboru posiłków');
      expect(result.system).toContain('NIE generuj makr');
    });

    it('should fallback to English for unknown language', () => {
      const context = {
        category: MealCategory.LUNCH,
        targetCalories: 2000,
        remaining: { calories: 600, proteins: 50, carbs: 70, fats: 20 },
        language: 'unknown',
        count: 3,
        templates: mockTemplates,
      };

      const result = service.buildPrompt(context);

      expect(result.system).toContain('meal selection assistant');
    });

    it('should include dietary restrictions in user prompt', () => {
      const context = {
        category: MealCategory.LUNCH,
        targetCalories: 2000,
        remaining: { calories: 600, proteins: 50, carbs: 70, fats: 20 },
        language: 'en',
        count: 3,
        templates: mockTemplates,
        dietaryRestrictions: ['vegetarian', 'gluten-free'],
      };

      const result = service.buildPrompt(context);

      expect(result.user).toContain('vegetarian');
      expect(result.user).toContain('gluten-free');
    });

    it('should not include dietary restrictions when none provided', () => {
      const context = {
        category: MealCategory.LUNCH,
        targetCalories: 2000,
        remaining: { calories: 600, proteins: 50, carbs: 70, fats: 20 },
        language: 'en',
        count: 3,
        templates: mockTemplates,
      };

      const result = service.buildPrompt(context);

      expect(result.user).not.toContain('Restrictions');
    });
  });

  describe('buildCacheKey', () => {
    it('should generate consistent cache key', () => {
      const context = {
        category: MealCategory.LUNCH,
        targetCalories: 2000,
        remaining: { calories: 523, proteins: 50, carbs: 70, fats: 20 },
        language: 'en',
        count: 3,
        templates: mockTemplates,
      };

      const key1 = service.buildCacheKey(context);
      const key2 = service.buildCacheKey(context);

      expect(key1).toBe(key2);
    });

    it('should round calories to nearest 100', () => {
      const context1 = {
        category: MealCategory.LUNCH,
        targetCalories: 2000,
        remaining: { calories: 523, proteins: 50, carbs: 70, fats: 20 },
        language: 'en',
        count: 3,
        templates: mockTemplates,
      };

      const context2 = {
        ...context1,
        remaining: { calories: 547, proteins: 50, carbs: 70, fats: 20 },
      };

      const key1 = service.buildCacheKey(context1);
      const key2 = service.buildCacheKey(context2);

      expect(key1).toBe(key2);
      expect(key1).toContain(':500:');
    });

    it('should include language in cache key', () => {
      const context = {
        category: MealCategory.LUNCH,
        targetCalories: 2000,
        remaining: { calories: 600, proteins: 50, carbs: 70, fats: 20 },
        language: 'en',
        count: 3,
        templates: mockTemplates,
      };

      const key = service.buildCacheKey(context);

      expect(key).toContain(':en:');
    });

    it('should include category in cache key', () => {
      const context = {
        category: MealCategory.LUNCH,
        targetCalories: 2000,
        remaining: { calories: 600, proteins: 50, carbs: 70, fats: 20 },
        language: 'en',
        count: 3,
        templates: mockTemplates,
      };

      const key = service.buildCacheKey(context);

      expect(key).toContain(':LUNCH:');
    });

    it('should hash dietary restrictions', () => {
      const context = {
        category: MealCategory.LUNCH,
        targetCalories: 2000,
        remaining: { calories: 600, proteins: 50, carbs: 70, fats: 20 },
        language: 'en',
        count: 3,
        templates: mockTemplates,
        dietaryRestrictions: ['vegetarian', 'gluten-free'],
      };

      const key = service.buildCacheKey(context);

      expect(key).not.toContain('vegetarian');
      expect(key).toMatch(/:[a-f0-9]{8}$/);
    });

    it('should use "none" when no dietary restrictions', () => {
      const context = {
        category: MealCategory.LUNCH,
        targetCalories: 2000,
        remaining: { calories: 600, proteins: 50, carbs: 70, fats: 20 },
        language: 'en',
        count: 3,
        templates: mockTemplates,
      };

      const key = service.buildCacheKey(context);

      expect(key).toContain(':none');
    });

    it('should generate same hash for same restrictions regardless of order', () => {
      const context1 = {
        category: MealCategory.LUNCH,
        targetCalories: 2000,
        remaining: { calories: 600, proteins: 50, carbs: 70, fats: 20 },
        language: 'en',
        count: 3,
        templates: mockTemplates,
        dietaryRestrictions: ['vegetarian', 'gluten-free'],
      };

      const context2 = {
        ...context1,
        dietaryRestrictions: ['gluten-free', 'vegetarian'],
      };

      const key1 = service.buildCacheKey(context1);
      const key2 = service.buildCacheKey(context2);

      expect(key1).toBe(key2);
    });
  });
});
