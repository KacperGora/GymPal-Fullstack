/**
 * Canonical ingredient spec list — single source of truth for both:
 *   - IngredientSeederService (NestJS, via admin endpoint)
 *   - ingredients-usda.seed.ts  (standalone script)
 *
 * Polish names must match what the AI generates so ILIKE lookups always hit.
 * All entries use servingSize=100 to simplify macro math.
 */

import { IngredientCategory } from '../../generated/prisma/client';

export interface IngredientSpec {
  /** Polish name stored in DB and used in AI prompts */
  polishName: string;
  /** English query for USDA FoodData Central search */
  usdaQuery: string;
  category: IngredientCategory;
  /** Override USDA data types; defaults to Foundation + SR Legacy */
  dataTypes?: string[];
}

export const INGREDIENTS_TO_SEED: IngredientSpec[] = [
  // ── Mięso i drób ────────────────────────────────────────���────────────────
  {
    polishName: 'Pierś z kurczaka (surowa)',
    usdaQuery: 'chicken breast raw',
    category: IngredientCategory.PROTEIN,
  },
  {
    polishName: 'Pierś z kurczaka (gotowana)',
    usdaQuery: 'chicken breast cooked roasted',
    category: IngredientCategory.PROTEIN,
  },
  {
    polishName: 'Udo kurczaka (surowe)',
    usdaQuery: 'chicken thigh raw',
    category: IngredientCategory.PROTEIN,
  },
  {
    polishName: 'Pierś z indyka (surowa)',
    usdaQuery: 'turkey breast raw',
    category: IngredientCategory.PROTEIN,
  },
  {
    polishName: 'Wołowina chuda (surowa)',
    usdaQuery: 'beef round lean raw',
    category: IngredientCategory.PROTEIN,
  },
  {
    polishName: 'Mielona wołowina (surowa)',
    usdaQuery: 'ground beef 85% lean raw',
    category: IngredientCategory.PROTEIN,
  },
  {
    polishName: 'Schab wieprzowy (surowy)',
    usdaQuery: 'pork loin raw',
    category: IngredientCategory.PROTEIN,
  },
  // ── Ryby i owoce morza ────────────────────────────────────────────────────
  {
    polishName: 'Łosoś (surowy)',
    usdaQuery: 'salmon atlantic raw',
    category: IngredientCategory.PROTEIN,
  },
  {
    polishName: 'Łosoś (gotowany/pieczony)',
    usdaQuery: 'salmon atlantic cooked dry heat',
    category: IngredientCategory.PROTEIN,
  },
  {
    polishName: 'Tuńczyk w sosie własnym',
    usdaQuery: 'tuna canned water drained',
    category: IngredientCategory.PROTEIN,
  },
  {
    polishName: 'Tuńczyk w oleju (odsączony)',
    usdaQuery: 'tuna canned oil drained',
    category: IngredientCategory.PROTEIN,
  },
  {
    polishName: 'Dorsz (surowy)',
    usdaQuery: 'cod atlantic raw',
    category: IngredientCategory.PROTEIN,
  },
  {
    polishName: 'Krewetki (surowe)',
    usdaQuery: 'shrimp raw',
    category: IngredientCategory.PROTEIN,
  },
  // ── Jajka ────────────────────────────────────────────────────────────��────
  {
    polishName: 'Jajko całe',
    usdaQuery: 'egg whole raw',
    category: IngredientCategory.PROTEIN,
  },
  {
    polishName: 'Białko jajka',
    usdaQuery: 'egg white raw',
    category: IngredientCategory.PROTEIN,
  },
  // ── Nabiał ────────────────────────────────────────────────────────────────
  {
    polishName: 'Mleko pełnotłuste',
    usdaQuery: 'milk whole',
    category: IngredientCategory.DAIRY,
  },
  {
    polishName: 'Mleko 2%',
    usdaQuery: 'milk reduced fat 2%',
    category: IngredientCategory.DAIRY,
  },
  {
    polishName: 'Jogurt naturalny',
    usdaQuery: 'yogurt plain whole milk',
    category: IngredientCategory.DAIRY,
  },
  {
    polishName: 'Jogurt grecki pełnotłusty',
    usdaQuery: 'greek yogurt plain whole milk',
    category: IngredientCategory.DAIRY,
  },
  {
    polishName: 'Jogurt grecki 0%',
    usdaQuery: 'greek yogurt nonfat plain',
    category: IngredientCategory.DAIRY,
  },
  {
    polishName: 'Skyr',
    usdaQuery: 'skyr icelandic yogurt nonfat',
    category: IngredientCategory.DAIRY,
  },
  {
    polishName: 'Twaróg',
    usdaQuery: 'cottage cheese lowfat',
    category: IngredientCategory.DAIRY,
  },
  {
    polishName: 'Ser mozzarella',
    usdaQuery: 'mozzarella cheese part skim',
    category: IngredientCategory.DAIRY,
  },
  {
    polishName: 'Ser żółty',
    usdaQuery: 'cheddar cheese',
    category: IngredientCategory.DAIRY,
  },
  {
    polishName: 'Parmezan',
    usdaQuery: 'parmesan cheese',
    category: IngredientCategory.DAIRY,
  },
  {
    polishName: 'Śmietana 18%',
    usdaQuery: 'sour cream',
    category: IngredientCategory.DAIRY,
  },
  {
    polishName: 'Masło',
    usdaQuery: 'butter unsalted',
    category: IngredientCategory.FATS_OILS,
  },
  // ── Zboża i kasze (suche) ─────────────────────────────────────────────────
  {
    polishName: 'Ryż biały (suchy)',
    usdaQuery: 'white rice raw unenriched',
    category: IngredientCategory.GRAINS,
  },
  {
    polishName: 'Ryż brązowy (suchy)',
    usdaQuery: 'brown rice raw',
    category: IngredientCategory.GRAINS,
  },
  {
    polishName: 'Makaron (suchy)',
    usdaQuery: 'pasta dry unenriched',
    category: IngredientCategory.GRAINS,
  },
  {
    polishName: 'Makaron pełnoziarnisty (suchy)',
    usdaQuery: 'whole wheat pasta dry',
    category: IngredientCategory.GRAINS,
  },
  {
    polishName: 'Kasza jaglana (sucha)',
    usdaQuery: 'millet raw',
    category: IngredientCategory.GRAINS,
  },
  {
    polishName: 'Kasza gryczana (sucha)',
    usdaQuery: 'buckwheat groats raw',
    category: IngredientCategory.GRAINS,
  },
  {
    polishName: 'Kasza bulgur (sucha)',
    usdaQuery: 'bulgur dry',
    category: IngredientCategory.GRAINS,
  },
  {
    polishName: 'Płatki owsiane',
    usdaQuery: 'oats rolled dry',
    category: IngredientCategory.GRAINS,
  },
  {
    polishName: 'Chleb pełnoziarnisty',
    usdaQuery: 'whole wheat bread',
    category: IngredientCategory.GRAINS,
  },
  {
    polishName: 'Quinoa (sucha)',
    usdaQuery: 'quinoa raw',
    category: IngredientCategory.GRAINS,
  },
  // ── Warzywa ─────────────────────────────────��─────────────────────────────
  {
    polishName: 'Brokuły',
    usdaQuery: 'broccoli raw',
    category: IngredientCategory.VEGETABLES,
  },
  {
    polishName: 'Szpinak',
    usdaQuery: 'spinach raw',
    category: IngredientCategory.VEGETABLES,
  },
  {
    polishName: 'Pomidor',
    usdaQuery: 'tomatoes raw',
    category: IngredientCategory.VEGETABLES,
  },
  {
    polishName: 'Sos pomidorowy',
    usdaQuery: 'tomato sauce canned',
    category: IngredientCategory.VEGETABLES,
  },
  {
    polishName: 'Cebula',
    usdaQuery: 'onions raw',
    category: IngredientCategory.VEGETABLES,
  },
  {
    polishName: 'Czosnek',
    usdaQuery: 'garlic raw',
    category: IngredientCategory.VEGETABLES,
  },
  {
    polishName: 'Papryka czerwona',
    usdaQuery: 'sweet red pepper raw',
    category: IngredientCategory.VEGETABLES,
  },
  {
    polishName: 'Papryka zielona',
    usdaQuery: 'sweet green pepper raw',
    category: IngredientCategory.VEGETABLES,
  },
  {
    polishName: 'Cukinia',
    usdaQuery: 'zucchini summer squash raw',
    category: IngredientCategory.VEGETABLES,
  },
  {
    polishName: 'Bakłażan',
    usdaQuery: 'eggplant raw',
    category: IngredientCategory.VEGETABLES,
  },
  {
    polishName: 'Marchew',
    usdaQuery: 'carrots raw',
    category: IngredientCategory.VEGETABLES,
  },
  {
    polishName: 'Ziemniaki',
    usdaQuery: 'potatoes raw flesh skin',
    category: IngredientCategory.VEGETABLES,
  },
  {
    polishName: 'Rukola',
    usdaQuery: 'arugula raw',
    category: IngredientCategory.VEGETABLES,
  },
  {
    polishName: 'Ogórek',
    usdaQuery: 'cucumber with peel raw',
    category: IngredientCategory.VEGETABLES,
  },
  {
    polishName: 'Kapusta',
    usdaQuery: 'cabbage raw',
    category: IngredientCategory.VEGETABLES,
  },
  {
    polishName: 'Pieczarki',
    usdaQuery: 'mushrooms white raw',
    category: IngredientCategory.VEGETABLES,
  },
  // ── Owoce ─────────────────────────────────────────────────────────────────
  {
    polishName: 'Banan',
    usdaQuery: 'bananas raw',
    category: IngredientCategory.FRUITS,
  },
  {
    polishName: 'Jabłko',
    usdaQuery: 'apples raw with skin',
    category: IngredientCategory.FRUITS,
  },
  {
    polishName: 'Awokado',
    usdaQuery: 'avocados raw',
    category: IngredientCategory.FRUITS,
  },
  {
    polishName: 'Truskawki',
    usdaQuery: 'strawberries raw',
    category: IngredientCategory.FRUITS,
  },
  {
    polishName: 'Borówki',
    usdaQuery: 'blueberries raw',
    category: IngredientCategory.FRUITS,
  },
  // ── Strączkowe ────────────────────────────────────────────────────────────
  {
    polishName: 'Soczewica (sucha)',
    usdaQuery: 'lentils raw',
    category: IngredientCategory.LEGUMES,
  },
  {
    polishName: 'Ciecierzyca (gotowana)',
    usdaQuery: 'chickpeas cooked boiled',
    category: IngredientCategory.LEGUMES,
  },
  {
    polishName: 'Fasola czarna (gotowana)',
    usdaQuery: 'black beans cooked boiled',
    category: IngredientCategory.LEGUMES,
  },
  {
    polishName: 'Tofu twarde',
    usdaQuery: 'tofu firm',
    category: IngredientCategory.PROTEIN,
  },
  // ── Orzechy i nasiona ─────────────────────────────────────────────────────
  {
    polishName: 'Migdały',
    usdaQuery: 'almonds',
    category: IngredientCategory.NUTS_SEEDS,
  },
  {
    polishName: 'Orzechy włoskie',
    usdaQuery: 'walnuts',
    category: IngredientCategory.NUTS_SEEDS,
  },
  {
    polishName: 'Masło orzechowe',
    usdaQuery: 'peanut butter smooth',
    category: IngredientCategory.NUTS_SEEDS,
  },
  // ── Tłuszcze i oleje ──────────────────────────────────────────────────────
  {
    polishName: 'Oliwa z oliwek',
    usdaQuery: 'olive oil',
    category: IngredientCategory.FATS_OILS,
  },
  {
    polishName: 'Olej rzepakowy',
    usdaQuery: 'canola oil',
    category: IngredientCategory.FATS_OILS,
  },
  // ── Inne ──────────────────────────────────────────────────────────────────
  {
    polishName: 'Miód',
    usdaQuery: 'honey',
    category: IngredientCategory.CONDIMENTS,
  },
  {
    polishName: 'Czekolada gorzka',
    usdaQuery: 'dark chocolate 70-85% cocoa',
    category: IngredientCategory.CONDIMENTS,
  },
];
