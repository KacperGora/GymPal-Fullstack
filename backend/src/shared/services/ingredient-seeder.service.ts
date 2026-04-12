import { Injectable, Logger } from '@nestjs/common';
import { IngredientCategory } from '../../generated/prisma/enums';
import { PrismaService } from '../db/prisma.service';
import { UsdaApiService } from './usda-api.service';
import { INGREDIENTS_TO_SEED } from '../data/ingredient-specs.data';

export interface SeedResult {
  seeded: number;
  skipped: number;
  failed: string[];
}

/** USDA documented limit: ~3500 req/hour → 1 req per ~1030ms. Use 1100ms for headroom. */
const USDA_RATE_LIMIT_MS = 1100;

@Injectable()
export class IngredientSeederService {
  private readonly logger = new Logger(IngredientSeederService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly usda: UsdaApiService,
  ) {}

  async seedFromUsda(): Promise<SeedResult> {
    const result: SeedResult = { seeded: 0, skipped: 0, failed: [] };

    for (const spec of INGREDIENTS_TO_SEED) {
      try {
        const existing = await this.prisma.ingredient.findFirst({
          where: { name: spec.polishName },
        });

        if (existing) {
          this.logger.debug(`Skip (exists): "${spec.polishName}"`);
          result.skipped++;
          continue;
        }

        const macros = await this.usda.searchFood(
          spec.usdaQuery,
          spec.dataTypes,
        );

        if (!macros) {
          this.logger.warn(
            `No USDA data for: "${spec.polishName}" (query: "${spec.usdaQuery}")`,
          );
          result.failed.push(spec.polishName);
          continue;
        }

        const servingUnit =
          spec.category === IngredientCategory.FATS_OILS &&
          (spec.polishName.includes('oliwa') ||
            spec.polishName.includes('olej'))
            ? 'ml'
            : 'g';

        await this.prisma.ingredient.create({
          data: {
            name: spec.polishName,
            servingSize: 100,
            servingUnit,
            calories: macros.calories,
            proteins: macros.proteins,
            carbs: macros.carbs,
            fats: macros.fats,
            fiber: macros.fiber,
            category: spec.category,
            verified: true,
            source: 'USDA',
            sourceUrl: `https://fdc.nal.usda.gov/fdc-app.html#/food-details/${macros.fdcId}`,
          },
        });

        this.logger.log(
          `Seeded: "${spec.polishName}" ← "${macros.description}"`,
        );
        result.seeded++;

        await new Promise((r) => setTimeout(r, USDA_RATE_LIMIT_MS));
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        this.logger.error(`Failed "${spec.polishName}": ${msg}`);
        result.failed.push(spec.polishName);
      }
    }

    return result;
  }
}
