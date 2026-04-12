import { Injectable, Logger } from '@nestjs/common';
import { MealCategory } from '../../generated/prisma/enums';
import { PrismaService } from '../../shared/db/prisma.service';
import type {
  MacroCalcResult,
  MealTemplateForScaling,
} from '../../shared/services/macro-calculator.service';
import { MacroCalculatorService } from '../../shared/services/macro-calculator.service';

export interface MealTemplate {
  id: string;
  name: string;
  category: MealCategory;
  totalCalories: number;
  totalProteins: number;
  totalCarbs: number;
  totalFats: number;
  ingredients: Array<{
    id: string;
    name: string;
    grams: number;
    scaleable: boolean;
    sortOrder: number;
  }>;
  minScale: number;
  maxScale: number;
  preparationTime?: number;
  difficulty?: string;
  macroFocus?: string;
  translations?: Record<string, unknown>;
}

@Injectable()
export class TemplateService {
  private readonly logger = new Logger(TemplateService.name);

  constructor(
    private prisma: PrismaService,
    private macroCalculator: MacroCalculatorService,
  ) {}

  async getTemplatesByCategory(
    category: MealCategory,
    targetCalories: number,
    language: string,
  ): Promise<MealTemplate[]> {
    const calorieRange = 200;
    const minCalories = Math.max(0, targetCalories - calorieRange);
    const maxCalories = targetCalories + calorieRange;

    this.logger.debug(
      `Fetching templates for category=${category}, targetCalories=${targetCalories}, language=${language}, range=[${minCalories}, ${maxCalories}]`,
    );

    const templates = await this.prisma.mealTemplate.findMany({
      where: {
        category,
        totalCalories: {
          gte: minCalories,
          lte: maxCalories,
        },
      },
      orderBy: {
        totalCalories: 'asc',
      },
      take: 8,
      include: {
        ingredients: {
          include: { ingredient: true },
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    const sorted = [...templates]
      .sort(
        (a, b) =>
          Math.abs(a.totalCalories - targetCalories) -
          Math.abs(b.totalCalories - targetCalories),
      )
      .slice(0, 8);

    this.logger.debug(
      `Found ${sorted.length} templates matching criteria (${sorted.length > 0 ? 'cache miss' : 'no results'})`,
    );

    return sorted.map(
      (template): MealTemplate => ({
        id: template.id,
        name: template.name,
        category: template.category,
        totalCalories: template.totalCalories,
        totalProteins: template.totalProteins,
        totalCarbs: template.totalCarbs,
        totalFats: template.totalFats,
        ingredients: template.ingredients.map((ti) => ({
          id: ti.id,
          name: ti.ingredient.name,
          grams: ti.grams,
          scaleable: ti.scaleable,
          sortOrder: ti.sortOrder,
        })),
        minScale: template.minScale,
        maxScale: template.maxScale,
        preparationTime: template.preparationTime ?? undefined,
        difficulty: template.difficulty ?? undefined,
        macroFocus: template.macroFocus ?? undefined,
        translations:
          (template.translations as Record<string, unknown>) ?? undefined,
      }),
    );
  }

  scaleLoadedTemplate(
    template: MealTemplate,
    scaleFactor: number,
  ): MacroCalcResult {
    return this.macroCalculator.scaleTemplate(
      {
        totalCalories: template.totalCalories,
        totalProteins: template.totalProteins,
        totalCarbs: template.totalCarbs,
        totalFats: template.totalFats,
        ingredients: template.ingredients.map((ing) => ({
          name: ing.name,
          grams: ing.grams,
          scaleable: ing.scaleable,
        })),
      },
      scaleFactor,
    );
  }

  async getTemplateWithScaledMacros(
    templateId: string,
    scaleFactor: number,
  ): Promise<MacroCalcResult> {
    if (scaleFactor <= 0) {
      throw new Error('Scale factor must be greater than 0');
    }

    const template = await this.prisma.mealTemplate.findUnique({
      where: { id: templateId },
      include: {
        ingredients: {
          include: { ingredient: true },
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    if (!template) {
      throw new Error(`Template with id ${templateId} not found`);
    }

    const templateForScaling: MealTemplateForScaling = {
      totalCalories: template.totalCalories,
      totalProteins: template.totalProteins,
      totalCarbs: template.totalCarbs,
      totalFats: template.totalFats,
      ingredients: template.ingredients.map((ti) => ({
        name: ti.ingredient.name,
        grams: ti.grams,
        scaleable: ti.scaleable,
      })),
    };

    return this.macroCalculator.scaleTemplate(templateForScaling, scaleFactor);
  }

  async getPopularTemplates(
    category: MealCategory,
    limit: number,
  ): Promise<MealTemplate[]> {
    this.logger.debug(
      `Fetching top ${limit} popular templates for category=${category}`,
    );

    const templates = await this.prisma.mealTemplate.findMany({
      where: { category },
      orderBy: { totalCalories: 'asc' },
      take: limit,
      include: {
        ingredients: {
          include: { ingredient: true },
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    return templates.map(
      (template): MealTemplate => ({
        id: template.id,
        name: template.name,
        category: template.category,
        totalCalories: template.totalCalories,
        totalProteins: template.totalProteins,
        totalCarbs: template.totalCarbs,
        totalFats: template.totalFats,
        ingredients: template.ingredients.map((ti) => ({
          id: ti.id,
          name: ti.ingredient.name,
          grams: ti.grams,
          scaleable: ti.scaleable,
          sortOrder: ti.sortOrder,
        })),
        minScale: template.minScale,
        maxScale: template.maxScale,
        preparationTime: template.preparationTime ?? undefined,
        difficulty: template.difficulty ?? undefined,
        macroFocus: template.macroFocus ?? undefined,
        translations:
          (template.translations as Record<string, unknown>) ?? undefined,
      }),
    );
  }

  async getAllTemplates(): Promise<MealTemplate[]> {
    this.logger.debug('Fetching all templates (admin/debug)');

    const templates = await this.prisma.mealTemplate.findMany({
      orderBy: [{ category: 'asc' }, { totalCalories: 'asc' }],
      include: {
        ingredients: {
          include: { ingredient: true },
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    return templates.map(
      (template): MealTemplate => ({
        id: template.id,
        name: template.name,
        category: template.category,
        totalCalories: template.totalCalories,
        totalProteins: template.totalProteins,
        totalCarbs: template.totalCarbs,
        totalFats: template.totalFats,
        ingredients: template.ingredients.map((ti) => ({
          id: ti.id,
          name: ti.ingredient.name,
          grams: ti.grams,
          scaleable: ti.scaleable,
          sortOrder: ti.sortOrder,
        })),
        minScale: template.minScale,
        maxScale: template.maxScale,
        preparationTime: template.preparationTime ?? undefined,
        difficulty: template.difficulty ?? undefined,
        macroFocus: template.macroFocus ?? undefined,
        translations:
          (template.translations as Record<string, unknown>) ?? undefined,
      }),
    );
  }
}
