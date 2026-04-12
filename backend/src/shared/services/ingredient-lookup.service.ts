import { Injectable, Logger } from '@nestjs/common';
import { IngredientCategory } from '../../generated/prisma/client';
import { PrismaService } from '../db/prisma.service';

interface IngredientInput {
  name: string;
  grams: number;
}

interface MacrosPer100g {
  calories: number;
  proteins: number;
  carbs: number;
  fats: number;
}

export interface MacroLookupResult {
  calories: number;
  proteins: number;
  carbs: number;
  fats: number;
  /** Fraction of total grams covered by DB lookup (0–1) */
  coverage: number;
}

@Injectable()
export class IngredientLookupService {
  private readonly logger = new Logger(IngredientLookupService.name);
  private readonly cache = new Map<string, MacrosPer100g | null>();

  constructor(private readonly prisma: PrismaService) {}

  async calculateMacros(
    ingredients: IngredientInput[],
  ): Promise<MacroLookupResult> {
    let totalProteins = 0;
    let totalCarbs = 0;
    let totalFats = 0;
    let matchedGrams = 0;
    let totalGrams = 0;

    for (const ingredient of ingredients) {
      totalGrams += ingredient.grams;
      const macros = await this.lookup(ingredient.name);

      if (macros) {
        const ratio = ingredient.grams / 100;
        totalProteins += macros.proteins * ratio;
        totalCarbs += macros.carbs * ratio;
        totalFats += macros.fats * ratio;
        matchedGrams += ingredient.grams;
      } else {
        this.logger.warn(
          `No DB match for: "${ingredient.name}" (${ingredient.grams}g)`,
        );
      }
    }

    const proteins = Math.round(totalProteins * 10) / 10;
    const carbs = Math.round(totalCarbs * 10) / 10;
    const fats = Math.round(totalFats * 10) / 10;
    // Recalculate calories via Atwater (P×4 + C×4 + F×9) for internal consistency.
    // USDA stores measured kcal which differs from Atwater due to fiber (2 kcal/g vs 4 kcal/g),
    // causing macro integrity validation to fail if we use USDA calories directly.
    const calories = Math.round(proteins * 4 + carbs * 4 + fats * 9);

    return {
      calories,
      proteins,
      carbs,
      fats,
      coverage: totalGrams > 0 ? matchedGrams / totalGrams : 0,
    };
  }

  async getNamesByCategories(
    categories: IngredientCategory[],
  ): Promise<string[]> {
    const rows = await this.prisma.ingredient.findMany({
      where: { category: { in: categories }, verified: true },
      select: { name: true },
      orderBy: { name: 'asc' },
    });
    return rows.map((r) => r.name);
  }

  private async lookup(name: string): Promise<MacrosPer100g | null> {
    const key = name.toLowerCase().trim();

    if (this.cache.has(key)) {
      return this.cache.get(key) ?? null;
    }

    const row = await this.prisma.ingredient.findFirst({
      where: { name: { contains: key, mode: 'insensitive' } },
      orderBy: { verified: 'desc' },
      select: {
        calories: true,
        proteins: true,
        carbs: true,
        fats: true,
        servingSize: true,
      },
    });

    if (!row) {
      this.cache.set(key, null);
      return null;
    }

    // Normalize to per-100g regardless of servingSize in DB
    const factor = 100 / row.servingSize;
    const macros: MacrosPer100g = {
      calories: row.calories * factor,
      proteins: row.proteins * factor,
      carbs: row.carbs * factor,
      fats: row.fats * factor,
    };

    this.cache.set(key, macros);
    return macros;
  }
}
