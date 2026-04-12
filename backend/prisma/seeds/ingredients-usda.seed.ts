/**
 * Seeds the Ingredient table with Polish ingredient names + USDA macros.
 *
 * Usage:
 *   npx tsx prisma/seeds/ingredients-usda.seed.ts
 */

import { PrismaClient, IngredientCategory } from '../../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as dotenv from 'dotenv';

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

interface IngredientSpec {
  polishName: string;
  usdaQuery: string;
  category: IngredientCategory;
  unit?: string;
}

const INGREDIENTS: IngredientSpec[] = [
  // Mięso i drób
  { polishName: 'Pierś z kurczaka (surowa)', usdaQuery: 'chicken breast raw', category: IngredientCategory.PROTEIN },
  { polishName: 'Pierś z kurczaka (gotowana)', usdaQuery: 'chicken breast cooked roasted', category: IngredientCategory.PROTEIN },
  { polishName: 'Udo kurczaka (surowe)', usdaQuery: 'chicken thigh raw', category: IngredientCategory.PROTEIN },
  { polishName: 'Pierś z indyka (surowa)', usdaQuery: 'turkey breast raw', category: IngredientCategory.PROTEIN },
  { polishName: 'Wołowina chuda (surowa)', usdaQuery: 'beef round lean raw', category: IngredientCategory.PROTEIN },
  { polishName: 'Mielona wołowina (surowa)', usdaQuery: 'ground beef 85% lean raw', category: IngredientCategory.PROTEIN },
  { polishName: 'Schab wieprzowy (surowy)', usdaQuery: 'pork loin raw', category: IngredientCategory.PROTEIN },
  // Ryby
  { polishName: 'Łosoś (surowy)', usdaQuery: 'salmon atlantic raw', category: IngredientCategory.PROTEIN },
  { polishName: 'Łosoś (gotowany/pieczony)', usdaQuery: 'salmon atlantic cooked dry heat', category: IngredientCategory.PROTEIN },
  { polishName: 'Tuńczyk w sosie własnym', usdaQuery: 'tuna canned water drained', category: IngredientCategory.PROTEIN },
  { polishName: 'Tuńczyk w oleju (odsączony)', usdaQuery: 'tuna canned oil drained', category: IngredientCategory.PROTEIN },
  { polishName: 'Dorsz (surowy)', usdaQuery: 'cod atlantic raw', category: IngredientCategory.PROTEIN },
  { polishName: 'Krewetki (surowe)', usdaQuery: 'shrimp raw', category: IngredientCategory.PROTEIN },
  // Jajka
  { polishName: 'Jajko całe', usdaQuery: 'egg whole raw', category: IngredientCategory.PROTEIN },
  { polishName: 'Białko jajka', usdaQuery: 'egg white raw', category: IngredientCategory.PROTEIN },
  // Nabiał
  { polishName: 'Mleko pełnotłuste', usdaQuery: 'milk whole', category: IngredientCategory.DAIRY, unit: 'ml' },
  { polishName: 'Mleko 2%', usdaQuery: 'milk reduced fat 2%', category: IngredientCategory.DAIRY, unit: 'ml' },
  { polishName: 'Jogurt naturalny', usdaQuery: 'yogurt plain whole milk', category: IngredientCategory.DAIRY },
  { polishName: 'Jogurt grecki pełnotłusty', usdaQuery: 'greek yogurt plain whole milk', category: IngredientCategory.DAIRY },
  { polishName: 'Jogurt grecki 0%', usdaQuery: 'greek yogurt nonfat plain', category: IngredientCategory.DAIRY },
  { polishName: 'Skyr', usdaQuery: 'skyr icelandic yogurt nonfat', category: IngredientCategory.DAIRY },
  { polishName: 'Twaróg', usdaQuery: 'cottage cheese lowfat', category: IngredientCategory.DAIRY },
  { polishName: 'Ser mozzarella', usdaQuery: 'mozzarella cheese part skim', category: IngredientCategory.DAIRY },
  { polishName: 'Ser żółty', usdaQuery: 'cheddar cheese', category: IngredientCategory.DAIRY },
  { polishName: 'Parmezan', usdaQuery: 'parmesan cheese', category: IngredientCategory.DAIRY },
  { polishName: 'Śmietana 18%', usdaQuery: 'sour cream', category: IngredientCategory.DAIRY },
  { polishName: 'Masło', usdaQuery: 'butter unsalted', category: IngredientCategory.FATS_OILS },
  // Zboża (suche)
  { polishName: 'Ryż biały (suchy)', usdaQuery: 'white rice raw unenriched', category: IngredientCategory.GRAINS },
  { polishName: 'Ryż brązowy (suchy)', usdaQuery: 'brown rice raw', category: IngredientCategory.GRAINS },
  { polishName: 'Makaron (suchy)', usdaQuery: 'pasta dry unenriched', category: IngredientCategory.GRAINS },
  { polishName: 'Makaron pełnoziarnisty (suchy)', usdaQuery: 'whole wheat pasta dry', category: IngredientCategory.GRAINS },
  { polishName: 'Kasza jaglana (sucha)', usdaQuery: 'millet raw', category: IngredientCategory.GRAINS },
  { polishName: 'Kasza gryczana (sucha)', usdaQuery: 'buckwheat groats raw', category: IngredientCategory.GRAINS },
  { polishName: 'Kasza bulgur (sucha)', usdaQuery: 'bulgur dry', category: IngredientCategory.GRAINS },
  { polishName: 'Płatki owsiane', usdaQuery: 'oats rolled dry', category: IngredientCategory.GRAINS },
  { polishName: 'Chleb pełnoziarnisty', usdaQuery: 'whole wheat bread', category: IngredientCategory.GRAINS },
  { polishName: 'Quinoa (sucha)', usdaQuery: 'quinoa raw', category: IngredientCategory.GRAINS },
  // Warzywa
  { polishName: 'Brokuły', usdaQuery: 'broccoli raw', category: IngredientCategory.VEGETABLES },
  { polishName: 'Szpinak', usdaQuery: 'spinach raw', category: IngredientCategory.VEGETABLES },
  { polishName: 'Pomidor', usdaQuery: 'tomatoes raw', category: IngredientCategory.VEGETABLES },
  { polishName: 'Sos pomidorowy', usdaQuery: 'tomato sauce canned', category: IngredientCategory.VEGETABLES },
  { polishName: 'Cebula', usdaQuery: 'onions raw', category: IngredientCategory.VEGETABLES },
  { polishName: 'Czosnek', usdaQuery: 'garlic raw', category: IngredientCategory.VEGETABLES },
  { polishName: 'Papryka czerwona', usdaQuery: 'sweet red pepper raw', category: IngredientCategory.VEGETABLES },
  { polishName: 'Papryka zielona', usdaQuery: 'sweet green pepper raw', category: IngredientCategory.VEGETABLES },
  { polishName: 'Cukinia', usdaQuery: 'zucchini summer squash raw', category: IngredientCategory.VEGETABLES },
  { polishName: 'Bakłażan', usdaQuery: 'eggplant raw', category: IngredientCategory.VEGETABLES },
  { polishName: 'Marchew', usdaQuery: 'carrots raw', category: IngredientCategory.VEGETABLES },
  { polishName: 'Ziemniaki', usdaQuery: 'potatoes raw flesh skin', category: IngredientCategory.VEGETABLES },
  { polishName: 'Rukola', usdaQuery: 'arugula raw', category: IngredientCategory.VEGETABLES },
  { polishName: 'Ogórek', usdaQuery: 'cucumber with peel raw', category: IngredientCategory.VEGETABLES },
  { polishName: 'Kapusta', usdaQuery: 'cabbage raw', category: IngredientCategory.VEGETABLES },
  { polishName: 'Pieczarki', usdaQuery: 'mushrooms white raw', category: IngredientCategory.VEGETABLES },
  // Owoce
  { polishName: 'Banan', usdaQuery: 'bananas raw', category: IngredientCategory.FRUITS },
  { polishName: 'Jabłko', usdaQuery: 'apples raw with skin', category: IngredientCategory.FRUITS },
  { polishName: 'Awokado', usdaQuery: 'avocados raw', category: IngredientCategory.FRUITS },
  { polishName: 'Truskawki', usdaQuery: 'strawberries raw', category: IngredientCategory.FRUITS },
  { polishName: 'Borówki', usdaQuery: 'blueberries raw', category: IngredientCategory.FRUITS },
  // Strączkowe
  { polishName: 'Soczewica (sucha)', usdaQuery: 'lentils raw', category: IngredientCategory.LEGUMES },
  { polishName: 'Ciecierzyca (gotowana)', usdaQuery: 'chickpeas cooked boiled', category: IngredientCategory.LEGUMES },
  { polishName: 'Fasola czarna (gotowana)', usdaQuery: 'black beans cooked boiled', category: IngredientCategory.LEGUMES },
  { polishName: 'Tofu twarde', usdaQuery: 'tofu firm', category: IngredientCategory.PROTEIN },
  // Orzechy
  { polishName: 'Migdały', usdaQuery: 'almonds', category: IngredientCategory.NUTS_SEEDS },
  { polishName: 'Orzechy włoskie', usdaQuery: 'walnuts', category: IngredientCategory.NUTS_SEEDS },
  { polishName: 'Masło orzechowe', usdaQuery: 'peanut butter smooth', category: IngredientCategory.NUTS_SEEDS },
  // Tłuszcze
  { polishName: 'Oliwa z oliwek', usdaQuery: 'olive oil', category: IngredientCategory.FATS_OILS, unit: 'ml' },
  { polishName: 'Olej rzepakowy', usdaQuery: 'canola oil', category: IngredientCategory.FATS_OILS, unit: 'ml' },
  // Inne
  { polishName: 'Miód', usdaQuery: 'honey', category: IngredientCategory.CONDIMENTS },
  { polishName: 'Czekolada gorzka', usdaQuery: 'dark chocolate 70-85% cocoa', category: IngredientCategory.CONDIMENTS },
];

async function searchUsda(query: string, apiKey: string) {
  const params = new URLSearchParams({
    query,
    api_key: apiKey,
    dataType: 'Foundation,SR Legacy',
    pageSize: '3',
  });

  const res = await fetch(`${USDA_BASE}/foods/search?${params}`);
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

async function main() {
  const apiKey = process.env.USDA_API_KEY;
  if (!apiKey) {
    console.error('❌  USDA_API_KEY not set in .env');
    process.exit(1);
  }

  console.log(`🌱 Seeding ${INGREDIENTS.length} ingredients from USDA...\n`);

  let seeded = 0;
  let skipped = 0;
  const failed: string[] = [];

  for (const spec of INGREDIENTS) {
    const existing = await prisma.ingredient.findFirst({
      where: { name: spec.polishName },
    });

    if (existing) {
      console.log(`  ⏭  Skip (exists): ${spec.polishName}`);
      skipped++;
      continue;
    }

    try {
      const macros = await searchUsda(spec.usdaQuery, apiKey);

      if (!macros) {
        console.warn(`  ⚠️  No result: "${spec.polishName}" (query: "${spec.usdaQuery}")`);
        failed.push(spec.polishName);
        continue;
      }

      await prisma.ingredient.create({
        data: {
          name: spec.polishName,
          servingSize: 100,
          servingUnit: spec.unit ?? 'g',
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

      // USDA rate limit: ~3500 req/hour → safe at 1 req/300ms
      await new Promise((r) => setTimeout(r, 300));
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
