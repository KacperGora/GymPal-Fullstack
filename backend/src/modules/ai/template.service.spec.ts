import { Test, TestingModule } from '@nestjs/testing';
import { TemplateService } from './template.service';
import { PrismaService } from '../../shared/db/prisma.service';
import { MacroCalculatorService } from '../../shared/services/macro-calculator.service';
import {
  MealCategory,
  MealDifficulty,
  MacroFocus,
} from '../../generated/prisma/enums';

describe('TemplateService', () => {
  let service: TemplateService;
  let prisma: PrismaService;
  let macroCalculator: MacroCalculatorService;

  const mockTemplate = {
    id: 'test-id',
    name: 'Chicken Rice',
    category: MealCategory.LUNCH,
    baseRecipe: {
      ingredients: [
        { name: 'Chicken', grams: 150 },
        { name: 'Rice', grams: 100 },
      ],
    },
    totalCalories: 500,
    totalProteins: 40,
    totalCarbs: 60,
    totalFats: 10,
    scaleableIngredients: ['Chicken', 'Rice'],
    minScale: 0.5,
    maxScale: 2.0,
    preparationTime: 30,
    difficulty: MealDifficulty.EASY,
    macroFocus: MacroFocus.BALANCED,
    translations: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TemplateService,
        {
          provide: PrismaService,
          useValue: {
            mealTemplate: {
              findMany: jest.fn(),
              findUnique: jest.fn(),
            },
          },
        },
        {
          provide: MacroCalculatorService,
          useValue: {
            scaleTemplate: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<TemplateService>(TemplateService);
    prisma = module.get<PrismaService>(PrismaService);
    macroCalculator = module.get<MacroCalculatorService>(
      MacroCalculatorService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getTemplatesByCategory', () => {
    it('should return templates for correct category', async () => {
      jest
        .spyOn(prisma.mealTemplate, 'findMany')
        .mockResolvedValue([mockTemplate]);

      const result = await service.getTemplatesByCategory(
        MealCategory.LUNCH,
        500,
        'en',
      );

      expect(result).toHaveLength(1);
      expect(result[0].category).toBe(MealCategory.LUNCH);
      expect(prisma.mealTemplate.findMany).toHaveBeenCalledWith({
        where: {
          category: MealCategory.LUNCH,
          totalCalories: {
            gte: 300,
            lte: 700,
          },
        },
        orderBy: {
          totalCalories: 'asc',
        },
        take: 8,
      });
    });

    it('should filter by calorie range (±200)', async () => {
      const templates = [
        { ...mockTemplate, totalCalories: 400 },
        { ...mockTemplate, totalCalories: 500 },
        { ...mockTemplate, totalCalories: 600 },
      ];

      jest.spyOn(prisma.mealTemplate, 'findMany').mockResolvedValue(templates);

      await service.getTemplatesByCategory(MealCategory.LUNCH, 500, 'en');

      expect(prisma.mealTemplate.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            totalCalories: {
              gte: 300,
              lte: 700,
            },
          }),
        }),
      );
    });

    it('should sort by closest match to target calories', async () => {
      const templates = [
        { ...mockTemplate, id: '1', totalCalories: 600 },
        { ...mockTemplate, id: '2', totalCalories: 500 },
        { ...mockTemplate, id: '3', totalCalories: 400 },
      ];

      jest.spyOn(prisma.mealTemplate, 'findMany').mockResolvedValue(templates);

      const result = await service.getTemplatesByCategory(
        MealCategory.LUNCH,
        500,
        'en',
      );

      expect(result[0].id).toBe('2');
      expect(result[0].totalCalories).toBe(500);
    });

    it('should return max 8 templates', async () => {
      const templates = Array.from({ length: 12 }, (_, i) => ({
        ...mockTemplate,
        id: `template-${i}`,
        totalCalories: 500 + i * 10,
      }));

      jest.spyOn(prisma.mealTemplate, 'findMany').mockResolvedValue(templates);

      const result = await service.getTemplatesByCategory(
        MealCategory.LUNCH,
        500,
        'en',
      );

      expect(result.length).toBeLessThanOrEqual(8);
    });
  });

  describe('getTemplateWithScaledMacros', () => {
    it('should scale template macros correctly', async () => {
      jest
        .spyOn(prisma.mealTemplate, 'findUnique')
        .mockResolvedValue(mockTemplate);
      jest.spyOn(macroCalculator, 'scaleTemplate').mockReturnValue({
        calories: 750,
        proteins: 60,
        carbs: 90,
        fats: 15,
        ingredients: [
          { name: 'Chicken', grams: 225 },
          { name: 'Rice', grams: 150 },
        ],
      });

      const result = await service.getTemplateWithScaledMacros('test-id', 1.5);

      expect(result.calories).toBe(750);
      expect(result.proteins).toBe(60);
      expect(macroCalculator.scaleTemplate).toHaveBeenCalledWith(
        expect.objectContaining({
          totalCalories: 500,
          totalProteins: 40,
        }),
        1.5,
      );
    });

    it('should throw error if scale factor is 0 or negative', async () => {
      await expect(
        service.getTemplateWithScaledMacros('test-id', 0),
      ).rejects.toThrow('Scale factor must be greater than 0');

      await expect(
        service.getTemplateWithScaledMacros('test-id', -1),
      ).rejects.toThrow('Scale factor must be greater than 0');
    });

    it('should throw error if template not found', async () => {
      jest.spyOn(prisma.mealTemplate, 'findUnique').mockResolvedValue(null);

      await expect(
        service.getTemplateWithScaledMacros('invalid-id', 1.0),
      ).rejects.toThrow('Template with id invalid-id not found');
    });
  });

  describe('getPopularTemplates', () => {
    it('should return top N templates by category', async () => {
      const templates = Array.from({ length: 5 }, (_, i) => ({
        ...mockTemplate,
        id: `template-${i}`,
      }));

      jest.spyOn(prisma.mealTemplate, 'findMany').mockResolvedValue(templates);

      const result = await service.getPopularTemplates(MealCategory.LUNCH, 3);

      expect(result).toHaveLength(5);
      expect(prisma.mealTemplate.findMany).toHaveBeenCalledWith({
        where: { category: MealCategory.LUNCH },
        orderBy: { totalCalories: 'asc' },
        take: 3,
      });
    });
  });

  describe('getAllTemplates', () => {
    it('should return all templates sorted by category and calories', async () => {
      const templates = [
        {
          ...mockTemplate,
          category: MealCategory.BREAKFAST,
          totalCalories: 300,
        },
        { ...mockTemplate, category: MealCategory.LUNCH, totalCalories: 500 },
        { ...mockTemplate, category: MealCategory.DINNER, totalCalories: 600 },
      ];

      jest.spyOn(prisma.mealTemplate, 'findMany').mockResolvedValue(templates);

      const result = await service.getAllTemplates();

      expect(result).toHaveLength(3);
      expect(prisma.mealTemplate.findMany).toHaveBeenCalledWith({
        orderBy: [{ category: 'asc' }, { totalCalories: 'asc' }],
      });
    });
  });
});
