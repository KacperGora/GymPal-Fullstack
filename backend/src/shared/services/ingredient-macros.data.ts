/**
 * Macros per 100g (or 100ml for liquids) — USDA FoodData Central values.
 * Values: [kcal, protein_g, carbs_g, fat_g]
 *
 * NOTE: All meat/fish values are for RAW unless the key explicitly says
 * "gotowany/smażony". AI is prompted to specify state — if unknown we use raw.
 *
 * TODO: Replace with USDA FoodData Central API integration for production.
 */

export type IngredientId =
  // Mięso i drób
  | 'chicken_breast_raw'
  | 'chicken_breast_cooked'
  | 'chicken_thigh_raw'
  | 'turkey_breast_raw'
  | 'beef_lean_raw'
  | 'beef_ground_raw'
  | 'pork_loin_raw'
  | 'salmon_raw'
  | 'salmon_cooked'
  | 'tuna_canned_water'
  | 'tuna_canned_oil_drained'
  | 'cod_raw'
  | 'shrimp_raw'
  | 'egg_whole'
  | 'egg_white'
  // Nabiał
  | 'milk_whole'
  | 'milk_2pct'
  | 'yogurt_plain_whole'
  | 'yogurt_greek_full_fat'
  | 'yogurt_greek_0pct'
  | 'skyr'
  | 'cottage_cheese'
  | 'mozzarella'
  | 'cheese_yellow'
  | 'parmesan'
  | 'sour_cream'
  | 'butter'
  // Zboża i kasze (wartości dla suchego produktu)
  | 'rice_white_dry'
  | 'rice_brown_dry'
  | 'pasta_dry'
  | 'pasta_wholegrain_dry'
  | 'millet_dry'
  | 'buckwheat_dry'
  | 'bulgur_dry'
  | 'oats_dry'
  | 'bread_wholegrain'
  | 'bread_white'
  | 'tortilla_wheat'
  | 'flour_wheat'
  | 'quinoa_dry'
  // Warzywa
  | 'broccoli_raw'
  | 'spinach_raw'
  | 'tomato_raw'
  | 'tomato_cherry'
  | 'tomato_sauce'
  | 'onion_raw'
  | 'garlic_raw'
  | 'bell_pepper_red'
  | 'bell_pepper_green'
  | 'zucchini_raw'
  | 'eggplant_raw'
  | 'carrot_raw'
  | 'potato_raw'
  | 'lettuce_raw'
  | 'arugula_raw'
  | 'cucumber_raw'
  | 'cabbage_raw'
  | 'cauliflower_raw'
  | 'peas_frozen'
  | 'corn_canned'
  | 'mushrooms_raw'
  // Owoce
  | 'banana'
  | 'apple'
  | 'avocado'
  | 'blueberries'
  | 'strawberries'
  | 'orange'
  | 'lemon_juice'
  // Strączkowe i orzechy
  | 'lentils_dry'
  | 'chickpeas_cooked'
  | 'black_beans_cooked'
  | 'tofu_firm'
  | 'almonds'
  | 'walnuts'
  | 'peanut_butter'
  // Tłuszcze
  | 'olive_oil'
  | 'canola_oil'
  | 'coconut_oil'
  // Inne
  | 'honey'
  | 'sugar'
  | 'dark_chocolate'
  | 'spices_negligible';

/** [kcal, protein_g, carbs_g, fat_g] per 100g/100ml */
export const INGREDIENT_MACROS: Record<
  IngredientId,
  [number, number, number, number]
> = {
  // ── Mięso i drób ─────────────────────────────────────────────────────────
  chicken_breast_raw: [110, 23.1, 0, 1.2],
  chicken_breast_cooked: [165, 31.0, 0, 3.6],
  chicken_thigh_raw: [177, 19.7, 0, 10.9],
  turkey_breast_raw: [104, 21.9, 0, 1.7],
  beef_lean_raw: [143, 21.4, 0, 5.9],
  beef_ground_raw: [215, 17.4, 0, 15.4],
  pork_loin_raw: [143, 21.0, 0, 6.3],
  salmon_raw: [182, 19.8, 0, 10.9],
  salmon_cooked: [206, 22.1, 0, 12.4],
  tuna_canned_water: [86, 19.0, 0, 0.6], // odsączony, w wodzie
  tuna_canned_oil_drained: [198, 29.1, 0, 8.2], // odsączony z oleju
  cod_raw: [82, 17.8, 0, 0.7],
  shrimp_raw: [85, 20.1, 0.9, 0.5],
  egg_whole: [143, 12.6, 0.7, 9.5], // 1 jajko ≈ 55g
  egg_white: [52, 10.9, 0.7, 0.2],
  // ── Nabiał ───────────────────────────────────────────────────────────────
  milk_whole: [61, 3.2, 4.8, 3.3],
  milk_2pct: [50, 3.4, 4.7, 2.0],
  yogurt_plain_whole: [61, 3.5, 4.7, 3.3],
  yogurt_greek_full_fat: [97, 9.0, 3.6, 5.0], // np. Fage 2% lub pełnotłusty
  yogurt_greek_0pct: [59, 10.2, 3.6, 0.4], // Fage 0% / skyr-like
  skyr: [63, 11.0, 4.0, 0.2],
  cottage_cheese: [98, 11.1, 3.4, 4.3],
  mozzarella: [280, 19.9, 2.2, 22.4],
  cheese_yellow: [371, 25.2, 1.3, 29.7],
  parmesan: [431, 38.5, 4.1, 28.6],
  sour_cream: [193, 2.4, 3.7, 20.0],
  butter: [717, 0.9, 0.1, 81.1],
  // ── Zboża i kasze (SUCHE — przed gotowaniem) ─────────────────────────────
  rice_white_dry: [365, 6.6, 80.3, 0.7],
  rice_brown_dry: [367, 7.5, 76.2, 2.7],
  pasta_dry: [371, 13.0, 74.7, 1.5],
  pasta_wholegrain_dry: [348, 12.5, 69.6, 2.5],
  millet_dry: [354, 11.0, 72.9, 3.1], // kasza jaglana sucha (USDA: 354, nie 378)
  buckwheat_dry: [343, 13.3, 71.5, 3.4],
  bulgur_dry: [342, 12.3, 75.9, 1.3],
  oats_dry: [389, 16.9, 66.3, 6.9],
  bread_wholegrain: [265, 9.0, 49.2, 3.4],
  bread_white: [265, 7.6, 51.5, 2.5],
  tortilla_wheat: [310, 8.0, 53.2, 7.5],
  flour_wheat: [364, 10.3, 76.3, 1.0],
  quinoa_dry: [368, 14.1, 64.2, 6.1],
  // ── Warzywa ───────────────────────────────────────────────────────────────
  broccoli_raw: [34, 2.8, 6.6, 0.4],
  spinach_raw: [23, 2.9, 3.6, 0.4],
  tomato_raw: [18, 0.9, 3.9, 0.2],
  tomato_cherry: [18, 0.9, 3.9, 0.2],
  tomato_sauce: [29, 1.5, 6.3, 0.3],
  onion_raw: [40, 1.1, 9.3, 0.1],
  garlic_raw: [149, 6.4, 33.1, 0.5],
  bell_pepper_red: [31, 1.0, 6.0, 0.3],
  bell_pepper_green: [20, 0.9, 4.6, 0.2],
  zucchini_raw: [17, 1.2, 3.1, 0.3],
  eggplant_raw: [25, 1.0, 5.9, 0.2],
  carrot_raw: [41, 0.9, 9.6, 0.2],
  potato_raw: [77, 2.0, 17.5, 0.1],
  lettuce_raw: [15, 1.4, 2.9, 0.2],
  arugula_raw: [25, 2.6, 3.7, 0.7],
  cucumber_raw: [16, 0.7, 3.6, 0.1],
  cabbage_raw: [25, 1.3, 5.8, 0.1],
  cauliflower_raw: [25, 1.9, 5.0, 0.3],
  peas_frozen: [81, 5.4, 14.5, 0.4],
  corn_canned: [83, 2.7, 18.7, 1.1],
  mushrooms_raw: [22, 3.1, 3.3, 0.3],
  // ── Owoce ─────────────────────────────────────────────────────────────────
  banana: [89, 1.1, 22.8, 0.3],
  apple: [52, 0.3, 13.8, 0.2],
  avocado: [160, 2.0, 8.5, 14.7],
  blueberries: [57, 0.7, 14.5, 0.3],
  strawberries: [32, 0.7, 7.7, 0.3],
  orange: [47, 0.9, 11.8, 0.1],
  lemon_juice: [22, 0.4, 6.9, 0.2],
  // ── Strączkowe i orzechy ──────────────────────────────────────────────────
  lentils_dry: [352, 24.6, 63.4, 1.1],
  chickpeas_cooked: [164, 8.9, 27.4, 2.6],
  black_beans_cooked: [132, 8.9, 23.7, 0.5],
  tofu_firm: [76, 8.1, 1.9, 4.8],
  almonds: [579, 21.2, 21.6, 49.9],
  walnuts: [654, 15.2, 13.7, 65.2],
  peanut_butter: [588, 25.1, 20.1, 50.4],
  // ── Tłuszcze i oleje ──────────────────────────────────────────────────────
  olive_oil: [884, 0, 0, 100.0],
  canola_oil: [884, 0, 0, 100.0],
  coconut_oil: [862, 0, 0, 100.0],
  // ── Inne ──────────────────────────────────────────────────────────────────
  honey: [304, 0.3, 82.4, 0],
  sugar: [387, 0, 100.0, 0],
  dark_chocolate: [546, 4.9, 63.1, 31.3],
  spices_negligible: [0, 0, 0, 0],
};

/**
 * Alias map: normalized Polish/English strings → IngredientId.
 * Order matters for substring matching — more specific aliases first.
 */
export const INGREDIENT_ALIASES: Array<[string, IngredientId]> = [
  // Kurczak — najpierw bardziej szczegółowe
  ['pierś z kurczaka surowa', 'chicken_breast_raw'],
  ['pierś z kurczaka gotowana', 'chicken_breast_cooked'],
  ['pierś z kurczaka smażona', 'chicken_breast_cooked'],
  ['pierś z kurczaka', 'chicken_breast_raw'], // default: surowa
  ['kurczak surowy', 'chicken_breast_raw'],
  ['kurczak gotowany', 'chicken_breast_cooked'],
  ['kurczak smażony', 'chicken_breast_cooked'],
  ['kurczak grillowany', 'chicken_breast_cooked'],
  ['kurczak pieczony', 'chicken_breast_cooked'],
  ['kurczak pierś', 'chicken_breast_raw'],
  ['chicken breast', 'chicken_breast_raw'],
  ['kurczak', 'chicken_breast_raw'],
  ['indyk', 'turkey_breast_raw'],
  ['pierś z indyka', 'turkey_breast_raw'],
  // Wołowina
  ['mielona wołowina', 'beef_ground_raw'],
  ['wołowina mielona', 'beef_ground_raw'],
  ['wołowina', 'beef_lean_raw'],
  ['beef', 'beef_lean_raw'],
  // Wieprzowina
  ['schab', 'pork_loin_raw'],
  ['wieprzowina', 'pork_loin_raw'],
  ['pork', 'pork_loin_raw'],
  // Ryby
  ['łosoś surowy', 'salmon_raw'],
  ['łosoś gotowany', 'salmon_cooked'],
  ['łosoś smażony', 'salmon_cooked'],
  ['łosoś pieczony', 'salmon_cooked'],
  ['łosoś grillowany', 'salmon_cooked'],
  ['łosoś', 'salmon_raw'],
  ['tuńczyk w sosie własnym', 'tuna_canned_water'],
  ['tuńczyk w wodzie', 'tuna_canned_water'],
  ['tuńczyk w oleju', 'tuna_canned_oil_drained'],
  ['tuńczyk odsączony', 'tuna_canned_water'],
  ['tuńczyk', 'tuna_canned_water'],
  ['dorsz', 'cod_raw'],
  ['krewetki', 'shrimp_raw'],
  // Jajka
  ['białko jajka', 'egg_white'],
  ['białko jaj', 'egg_white'],
  ['jajko', 'egg_whole'],
  ['jaja', 'egg_whole'],
  ['egg', 'egg_whole'],
  // Nabiał
  ['jogurt grecki 0%', 'yogurt_greek_0pct'],
  ['jogurt grecki light', 'yogurt_greek_0pct'],
  ['jogurt grecki 2%', 'yogurt_greek_full_fat'],
  ['jogurt grecki', 'yogurt_greek_full_fat'], // default: pełnotłusty
  ['skyr', 'skyr'],
  ['jogurt naturalny', 'yogurt_plain_whole'],
  ['ser twarogowy', 'cottage_cheese'],
  ['twaróg', 'cottage_cheese'],
  ['mozzarella', 'mozzarella'],
  ['ser żółty', 'cheese_yellow'],
  ['parmezan', 'parmesan'],
  ['śmietana', 'sour_cream'],
  ['masło', 'butter'],
  ['mleko 2%', 'milk_2pct'],
  ['mleko', 'milk_whole'],
  // Zboża — suche
  ['kasza jaglana', 'millet_dry'],
  ['kasza gryczana', 'buckwheat_dry'],
  ['kasza bulgur', 'bulgur_dry'],
  ['kasza', 'buckwheat_dry'],
  ['płatki owsiane', 'oats_dry'],
  ['owsianka', 'oats_dry'],
  ['oats', 'oats_dry'],
  ['ryż brązowy', 'rice_brown_dry'],
  ['ryż biały', 'rice_white_dry'],
  ['ryż', 'rice_white_dry'],
  ['makaron pełnoziarnisty', 'pasta_wholegrain_dry'],
  ['makaron', 'pasta_dry'],
  ['pasta', 'pasta_dry'],
  ['quinoa', 'quinoa_dry'],
  ['chleb pełnoziarnisty', 'bread_wholegrain'],
  ['chleb', 'bread_white'],
  ['tortilla', 'tortilla_wheat'],
  ['mąka pszenna', 'flour_wheat'],
  ['mąka', 'flour_wheat'],
  // Warzywa
  ['papryka czerwona', 'bell_pepper_red'],
  ['papryka zielona', 'bell_pepper_green'],
  ['papryka', 'bell_pepper_red'],
  ['pomidory koktajlowe', 'tomato_cherry'],
  ['sos pomidorowy', 'tomato_sauce'],
  ['pomidory', 'tomato_raw'],
  ['pomidor', 'tomato_raw'],
  ['brokuły', 'broccoli_raw'],
  ['szpinak', 'spinach_raw'],
  ['cebula', 'onion_raw'],
  ['czosnek', 'garlic_raw'],
  ['cukinia', 'zucchini_raw'],
  ['bakłażan', 'eggplant_raw'],
  ['marchew', 'carrot_raw'],
  ['ziemniaki', 'potato_raw'],
  ['ziemniak', 'potato_raw'],
  ['sałata', 'lettuce_raw'],
  ['rukola', 'arugula_raw'],
  ['ogórek', 'cucumber_raw'],
  ['kapusta', 'cabbage_raw'],
  ['kalafior', 'cauliflower_raw'],
  ['groszek', 'peas_frozen'],
  ['kukurydza', 'corn_canned'],
  ['pieczarki', 'mushrooms_raw'],
  ['grzyby', 'mushrooms_raw'],
  // Owoce
  ['banan', 'banana'],
  ['jabłko', 'apple'],
  ['awokado', 'avocado'],
  ['jagody', 'blueberries'],
  ['borówki', 'blueberries'],
  ['truskawki', 'strawberries'],
  ['pomarańcza', 'orange'],
  ['sok z cytryny', 'lemon_juice'],
  ['cytryna', 'lemon_juice'],
  // Strączkowe
  ['soczewica', 'lentils_dry'],
  ['ciecierzyca', 'chickpeas_cooked'],
  ['fasola czarna', 'black_beans_cooked'],
  ['fasola', 'black_beans_cooked'],
  ['tofu', 'tofu_firm'],
  ['migdały', 'almonds'],
  ['orzechy włoskie', 'walnuts'],
  ['masło orzechowe', 'peanut_butter'],
  ['masło migdałowe', 'peanut_butter'],
  // Tłuszcze
  ['oliwa z oliwek', 'olive_oil'],
  ['oliwa', 'olive_oil'],
  ['olej rzepakowy', 'canola_oil'],
  ['olej kokosowy', 'coconut_oil'],
  ['olej', 'olive_oil'],
  // Inne
  ['miód', 'honey'],
  ['cukier', 'sugar'],
  ['czekolada gorzka', 'dark_chocolate'],
  // Przyprawy — pomijalny wkład kaloryczny
  ['przyprawy', 'spices_negligible'],
  ['sól', 'spices_negligible'],
  ['pieprz', 'spices_negligible'],
  ['oregano', 'spices_negligible'],
  ['bazylia świeża', 'spices_negligible'],
  ['bazylia', 'spices_negligible'],
  ['kurkuma', 'spices_negligible'],
  ['cynamon', 'spices_negligible'],
  ['papryka słodka', 'spices_negligible'],
  ['chili', 'spices_negligible'],
  ['curry', 'spices_negligible'],
  ['imbir', 'spices_negligible'],
];
