import { Test, TestingModule } from '@nestjs/testing';
import { CacheService } from './cache.service';
import { MealCategory } from '../../generated/prisma/enums';
import type { MealTemplate } from '../../modules/ai/template.service';

describe('CacheService', () => {
  let service: CacheService;

  const mockTemplate: MealTemplate = {
    id: 'test-id',
    name: 'Test Meal',
    category: MealCategory.LUNCH,
    totalCalories: 500,
    totalProteins: 40,
    totalCarbs: 60,
    totalFats: 10,
    ingredients: [
      { id: 'ti-1', name: 'Test', grams: 100, scaleable: true, sortOrder: 0 },
    ],
    minScale: 0.5,
    maxScale: 2.0,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CacheService],
    }).compile();

    service = module.get<CacheService>(CacheService);
  });

  afterEach(async () => {
    await service.invalidateTemplates();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getTemplates', () => {
    it('should return null on cache miss', async () => {
      const result = await service.getTemplates('en', MealCategory.LUNCH, 500);
      expect(result).toBeNull();
    });

    it('should return cached templates on cache hit', async () => {
      await service.setTemplates('en', MealCategory.LUNCH, 500, [mockTemplate]);
      const result = await service.getTemplates('en', MealCategory.LUNCH, 500);

      expect(result).toHaveLength(1);
      expect(result![0].name).toBe('Test Meal');
    });

    it('should round calories to nearest 100 for cache key', async () => {
      await service.setTemplates('en', MealCategory.LUNCH, 523, [mockTemplate]);
      const result = await service.getTemplates('en', MealCategory.LUNCH, 547);

      expect(result).toHaveLength(1);
    });

    it('should expire cache after TTL', async () => {
      jest.useFakeTimers();

      await service.setTemplates('en', MealCategory.LUNCH, 500, [mockTemplate]);

      const result1 = await service.getTemplates('en', MealCategory.LUNCH, 500);
      expect(result1).toHaveLength(1);

      jest.advanceTimersByTime(1000 * 60 * 60 * 24 + 1000);

      const result2 = await service.getTemplates('en', MealCategory.LUNCH, 500);
      expect(result2).toBeNull();

      jest.useRealTimers();
    });

    it('should track cache hit', async () => {
      await service.setTemplates('en', MealCategory.LUNCH, 500, [mockTemplate]);
      await service.getTemplates('en', MealCategory.LUNCH, 500);

      const stats = await service.getCacheStats();
      expect(stats.hits).toBe(1);
    });

    it('should track cache miss', async () => {
      await service.getTemplates('en', MealCategory.LUNCH, 500);

      const stats = await service.getCacheStats();
      expect(stats.misses).toBe(1);
    });
  });

  describe('setTemplates', () => {
    it('should cache templates with correct key', async () => {
      await service.setTemplates('en', MealCategory.LUNCH, 500, [mockTemplate]);
      const result = await service.getTemplates('en', MealCategory.LUNCH, 500);

      expect(result).toHaveLength(1);
    });

    it('should cache templates with language-specific key', async () => {
      await service.setTemplates('en', MealCategory.LUNCH, 500, [mockTemplate]);
      await service.setTemplates('pl', MealCategory.LUNCH, 500, [
        { ...mockTemplate, name: 'Polish Meal' },
      ]);

      const enResult = await service.getTemplates(
        'en',
        MealCategory.LUNCH,
        500,
      );
      const plResult = await service.getTemplates(
        'pl',
        MealCategory.LUNCH,
        500,
      );

      expect(enResult![0].name).toBe('Test Meal');
      expect(plResult![0].name).toBe('Polish Meal');
    });
  });

  describe('getIngredientMacros', () => {
    it('should return null on cache miss', async () => {
      const result = await service.getIngredientMacros('ingredient-id', 100);
      expect(result).toBeNull();
    });

    it('should return scaled macros on cache hit', async () => {
      await service.setIngredientMacros('ingredient-id', {
        calories: 100,
        proteins: 10,
        carbs: 15,
        fats: 5,
      });

      const result = await service.getIngredientMacros('ingredient-id', 200);

      expect(result).toEqual({
        calories: 200,
        proteins: 20,
        carbs: 30,
        fats: 10,
      });
    });

    it('should track cache hit for ingredients', async () => {
      await service.setIngredientMacros('ingredient-id', {
        calories: 100,
        proteins: 10,
        carbs: 15,
        fats: 5,
      });

      await service.getIngredientMacros('ingredient-id', 100);

      const stats = await service.getCacheStats();
      expect(stats.hits).toBeGreaterThan(0);
    });
  });

  describe('invalidateTemplates', () => {
    it('should clear all template cache when no category specified', async () => {
      await service.setTemplates('en', MealCategory.LUNCH, 500, [mockTemplate]);
      await service.setTemplates('en', MealCategory.DINNER, 600, [
        mockTemplate,
      ]);

      await service.invalidateTemplates();

      const lunchResult = await service.getTemplates(
        'en',
        MealCategory.LUNCH,
        500,
      );
      const dinnerResult = await service.getTemplates(
        'en',
        MealCategory.DINNER,
        600,
      );

      expect(lunchResult).toBeNull();
      expect(dinnerResult).toBeNull();
    });

    it('should clear only specified category cache', async () => {
      await service.setTemplates('en', MealCategory.LUNCH, 500, [mockTemplate]);
      await service.setTemplates('en', MealCategory.DINNER, 600, [
        mockTemplate,
      ]);

      await service.invalidateTemplates(MealCategory.LUNCH);

      const lunchResult = await service.getTemplates(
        'en',
        MealCategory.LUNCH,
        500,
      );
      const dinnerResult = await service.getTemplates(
        'en',
        MealCategory.DINNER,
        600,
      );

      expect(lunchResult).toBeNull();
      expect(dinnerResult).toHaveLength(1);
    });
  });

  describe('invalidateIngredient', () => {
    it('should clear ingredient cache', async () => {
      await service.setIngredientMacros('ingredient-id', {
        calories: 100,
        proteins: 10,
        carbs: 15,
        fats: 5,
      });

      await service.invalidateIngredient('ingredient-id');

      const result = await service.getIngredientMacros('ingredient-id', 100);
      expect(result).toBeNull();
    });
  });

  describe('getCacheStats', () => {
    it('should return correct hit rate', async () => {
      await service.setTemplates('en', MealCategory.LUNCH, 500, [mockTemplate]);

      await service.getTemplates('en', MealCategory.LUNCH, 500);
      await service.getTemplates('en', MealCategory.LUNCH, 500);
      await service.getTemplates('en', MealCategory.DINNER, 600);

      const stats = await service.getCacheStats();

      expect(stats.hits).toBe(2);
      expect(stats.misses).toBe(1);
      expect(stats.hitRate).toBeCloseTo(66.67, 1);
    });

    it('should return 0 hit rate when no cache access', async () => {
      const stats = await service.getCacheStats();

      expect(stats.hits).toBe(0);
      expect(stats.misses).toBe(0);
      expect(stats.hitRate).toBe(0);
    });
  });
});
