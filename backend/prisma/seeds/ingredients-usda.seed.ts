/**
 * Standalone USDA ingredient seed script — no NestJS server required.
 *
 * Usage (from backend/ directory):
 *   npm run seed:ingredients
 */

import { PrismaClient } from '../../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as dotenv from 'dotenv';
import { INGREDIENTS_TO_SEED } from '../../src/shared/data/ingredient-specs.data';

dotenv.config();

const connectionString = process.env.DATABASE_URL!;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const USDA_BASE = 'https://api.nal.usda.gov/fdc/v1';
const NUTRIENT_ENERGY = 1008;
const NUTRIENT_PROTEIN = 1003;
const NUTRIENT_CARBS = 1005;
const NUTRIENT_FAT = 1004;
const NUTRIENT_FIBER = 1079;

/** USDA documented limit: ~3500 req/hour → 1 req per ~1030ms. Use 1100ms for headroom. */
const USDA_RATE_LIMIT_MS = 1100;
const MAX_RETRIES = 3;

async function searchUsda(query: string, apiKey: string, dataTypes = ['Foundation', 'SR Legacy']) {
  const params = new URLSearchParams({
    query,
    api_key: apiKey,
    dataType: dataTypes.join(','),
    pageSize: '3',
  });

  const url = `${USDA_BASE}/foods/search?${params}`;
  let attempt = 0;
  let backoffMs = 2000;

  while (attempt <= MAX_RETRIES) {
    const res = await fetch(url);

    if (res.status === 429) {
      if (attempt === MAX_RETRIES) throw new Error(`Rate limited after ${attempt} retries`);
      console.warn(`  ⏳ 429 rate limit — retry ${attempt + 1} in ${backoffMs}ms`);
      await new Promise((r) => setTimeout(r, backoffMs));
      backoffMs *= 2;
      attempt++;
      continue;
    }

    if (!res.ok) throw new Error(`USDA ${res.status}: ${res.statusText}`);

    const body = await res.json() as { foods: Array<{
      fdcId: number;
      description: string;
      foodNutrients: Array<{ nutrientId: number; value: number }>;
    }> };

    const food = body.foods?.[0];
    if (!food) return null;

    const get = (id: number) =>
      food.foodNutrients.find((n) => n.nutrientId === id)?.value ?? 0;

    return {
      fdcId: food.fdcId,
      description: food.description,
      calories: Math.round(get(NUTRIENT_ENERGY)),
      proteins: Math.round(get(NUTRIENT_PROTEIN) * 10) / 10,
      carbs: Math.round(get(NUTRIENT_CARBS) * 10) / 10,
      fats: Math.round(get(NUTRIENT_FAT) * 10) / 10,
      fiber: Math.round(get(NUTRIENT_FIBER) * 10) / 10,
    };
  }

  return null;
}

async function main() {
  const apiKey = process.env.USDA_API_KEY;
  if (!apiKey) {
    console.error('❌  USDA_API_KEY not set in .env');
    process.exit(1);
  }

  console.log(`🌱 Seeding ${INGREDIENTS_TO_SEED.length} ingredients from USDA...\n`);

  let seeded = 0;
  let skipped = 0;
  const failed: string[] = [];

  for (const spec of INGREDIENTS_TO_SEED) {
    const existing = await prisma.ingredient.findFirst({
      where: { name: spec.polishName },
    });

    if (existing) {
      console.log(`  ⏭  Skip (exists): ${spec.polishName}`);
      skipped++;
      continue;
    }

    try {
      const macros = await searchUsda(spec.usdaQuery, apiKey, spec.dataTypes);

      if (!macros) {
        console.warn(`  ⚠️  No result: "${spec.polishName}" (query: "${spec.usdaQuery}")`);
        failed.push(spec.polishName);
        continue;
      }

      const servingUnit =
        spec.polishName.includes('oliwa') || spec.polishName.includes('olej') ? 'ml' : 'g';

      await prisma.ingredient.create({
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

      console.log(`  ✅  ${spec.polishName}`);
      console.log(`      ← "${macros.description}"`);
      console.log(`      ${macros.calories} kcal | P: ${macros.proteins}g | C: ${macros.carbs}g | F: ${macros.fats}g | błonnik: ${macros.fiber}g\n`);
      seeded++;

      await new Promise((r) => setTimeout(r, USDA_RATE_LIMIT_MS));
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`  ❌  ${spec.polishName}: ${msg}`);
      failed.push(spec.polishName);
    }
  }

  console.log('\n─────────────────────────────────────');
  console.log(`✅  Dodano:    ${seeded}`);
  console.log(`⏭  Pominięto: ${skipped}`);
  console.log(`❌  Błędy:     ${failed.length}${failed.length ? '\n   ' + failed.join('\n   ') : ''}`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
