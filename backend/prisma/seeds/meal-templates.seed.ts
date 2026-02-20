import {
  PrismaClient,
  MealCategory,
  MealDifficulty,
  MacroFocus,
} from '../../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

interface MealTemplateData {
  name: string;
  category: MealCategory;
  baseRecipe: {
    ingredients: Array<{ name: string; grams: number }>;
    instructions?: string;
  };
  totalCalories: number;
  totalProteins: number;
  totalCarbs: number;
  totalFats: number;
  scaleableIngredients: string[];
  minScale: number;
  maxScale: number;
  preparationTime?: number;
  difficulty: MealDifficulty;
  macroFocus: MacroFocus;
  translations?: {
    pl?: { name: string; instructions?: string };
  };
}

const mealTemplates: MealTemplateData[] = [
  // BREAKFAST TEMPLATES
  {
    name: 'Classic Oatmeal with Berries',
    category: MealCategory.BREAKFAST,
    baseRecipe: {
      ingredients: [
        { name: 'Oatmeal (cooked)', grams: 200 },
        { name: 'Blueberries', grams: 50 },
        { name: 'Banana', grams: 100 },
        { name: 'Almonds', grams: 14 },
        { name: 'Honey', grams: 10 },
      ],
      instructions: 'Cook oatmeal, top with berries, sliced banana, and almonds. Drizzle with honey.',
    },
    totalCalories: 395,
    totalProteins: 10.5,
    totalCarbs: 71.5,
    totalFats: 9.1,
    scaleableIngredients: ['Oatmeal (cooked)', 'Blueberries', 'Banana', 'Almonds'],
    minScale: 0.7,
    maxScale: 1.8,
    preparationTime: 10,
    difficulty: MealDifficulty.EASY,
    macroFocus: MacroFocus.HIGH_CARB,
    translations: {
      pl: {
        name: 'Klasyczna owsianka z jagodami',
        instructions: 'Ugotuj owsiankę, dodaj jagody, pokrojonego banana i migdały. Polej miodem.',
      },
    },
  },
  {
    name: 'Protein Pancakes',
    category: MealCategory.BREAKFAST,
    baseRecipe: {
      ingredients: [
        { name: 'Egg (whole, large)', grams: 150 },
        { name: 'Banana', grams: 100 },
        { name: 'Oatmeal (cooked)', grams: 100 },
        { name: 'Blueberries', grams: 50 },
      ],
      instructions: 'Blend eggs, banana, and oats. Cook as pancakes. Top with blueberries.',
    },
    totalCalories: 450,
    totalProteins: 23.9,
    totalCarbs: 58.5,
    totalFats: 15.1,
    scaleableIngredients: ['Egg (whole, large)', 'Banana', 'Oatmeal (cooked)'],
    minScale: 0.6,
    maxScale: 2.0,
    preparationTime: 15,
    difficulty: MealDifficulty.MEDIUM,
    macroFocus: MacroFocus.HIGH_PROTEIN,
    translations: {
      pl: {
        name: 'Proteinowe naleśniki',
      },
    },
  },
  {
    name: 'Greek Yogurt Parfait',
    category: MealCategory.BREAKFAST,
    baseRecipe: {
      ingredients: [
        { name: 'Greek Yogurt (nonfat, plain)', grams: 200 },
        { name: 'Strawberries', grams: 100 },
        { name: 'Blueberries', grams: 50 },
        { name: 'Almonds', grams: 28 },
        { name: 'Honey', grams: 21 },
      ],
      instructions: 'Layer yogurt with berries and almonds. Drizzle with honey.',
    },
    totalCalories: 400,
    totalProteins: 24.7,
    totalCarbs: 53.3,
    totalFats: 15.8,
    scaleableIngredients: ['Greek Yogurt (nonfat, plain)', 'Strawberries', 'Blueberries'],
    minScale: 0.6,
    maxScale: 1.5,
    preparationTime: 5,
    difficulty: MealDifficulty.EASY,
    macroFocus: MacroFocus.HIGH_PROTEIN,
    translations: {
      pl: {
        name: 'Grecki jogurt z owocami',
      },
    },
  },
  {
    name: 'Scrambled Eggs with Avocado Toast',
    category: MealCategory.BREAKFAST,
    baseRecipe: {
      ingredients: [
        { name: 'Egg (whole, large)', grams: 150 },
        { name: 'Whole Wheat Bread', grams: 56 },
        { name: 'Avocado', grams: 50 },
        { name: 'Tomato (raw)', grams: 50 },
      ],
      instructions: 'Scramble eggs. Toast bread and top with mashed avocado. Serve with tomato slices.',
    },
    totalCalories: 413,
    totalProteins: 21.9,
    totalCarbs: 31.3,
    totalFats: 22.1,
    scaleableIngredients: ['Egg (whole, large)', 'Whole Wheat Bread', 'Avocado'],
    minScale: 0.7,
    maxScale: 1.8,
    preparationTime: 10,
    difficulty: MealDifficulty.EASY,
    macroFocus: MacroFocus.BALANCED,
    translations: {
      pl: {
        name: 'Jajecznica z tostami z awokado',
      },
    },
  },
  {
    name: 'Cottage Cheese Bowl',
    category: MealCategory.BREAKFAST,
    baseRecipe: {
      ingredients: [
        { name: 'Cottage Cheese (low fat)', grams: 200 },
        { name: 'Banana', grams: 100 },
        { name: 'Strawberries', grams: 50 },
        { name: 'Walnuts', grams: 28 },
      ],
      instructions: 'Combine cottage cheese with fresh fruits and chopped walnuts.',
    },
    totalCalories: 431,
    totalProteins: 29.5,
    totalCarbs: 42.1,
    totalFats: 19.6,
    scaleableIngredients: ['Cottage Cheese (low fat)', 'Banana', 'Strawberries'],
    minScale: 0.6,
    maxScale: 1.7,
    preparationTime: 5,
    difficulty: MealDifficulty.EASY,
    macroFocus: MacroFocus.HIGH_PROTEIN,
    translations: {
      pl: {
        name: 'Miska z twarogiem i owocami',
      },
    },
  },
  {
    name: 'Egg White Omelette',
    category: MealCategory.BREAKFAST,
    baseRecipe: {
      ingredients: [
        { name: 'Egg White', grams: 165 },
        { name: 'Spinach (cooked)', grams: 50 },
        { name: 'Mushrooms (cooked)', grams: 50 },
        { name: 'Bell Pepper (raw)', grams: 50 },
        { name: 'Whole Wheat Bread', grams: 56 },
      ],
      instructions: 'Cook egg whites with vegetables. Serve with whole wheat toast.',
    },
    totalCalories: 276,
    totalProteins: 26.9,
    totalCarbs: 36.9,
    totalFats: 3.5,
    scaleableIngredients: ['Egg White', 'Spinach (cooked)', 'Mushrooms (cooked)'],
    minScale: 0.7,
    maxScale: 2.0,
    preparationTime: 12,
    difficulty: MealDifficulty.MEDIUM,
    macroFocus: MacroFocus.HIGH_PROTEIN,
    translations: {
      pl: {
        name: 'Omlet z białek z warzywami',
      },
    },
  },
  {
    name: 'Peanut Butter Banana Smoothie',
    category: MealCategory.BREAKFAST,
    baseRecipe: {
      ingredients: [
        { name: 'Banana', grams: 150 },
        { name: 'Peanut Butter', grams: 32 },
        { name: 'Milk (skim)', grams: 250 },
        { name: 'Oatmeal (cooked)', grams: 50 },
      ],
      instructions: 'Blend all ingredients until smooth.',
    },
    totalCalories: 449,
    totalProteins: 18.8,
    totalCarbs: 59.8,
    totalFats: 16.6,
    scaleableIngredients: ['Banana', 'Peanut Butter', 'Milk (skim)'],
    minScale: 0.6,
    maxScale: 1.8,
    preparationTime: 5,
    difficulty: MealDifficulty.EASY,
    macroFocus: MacroFocus.BALANCED,
    translations: {
      pl: {
        name: 'Smoothie z masłem orzechowym i bananem',
      },
    },
  },
  {
    name: 'Turkey Bacon and Eggs',
    category: MealCategory.BREAKFAST,
    baseRecipe: {
      ingredients: [
        { name: 'Egg (whole, large)', grams: 100 },
        { name: 'Turkey Breast (cooked)', grams: 50 },
        { name: 'Whole Wheat Bread', grams: 56 },
        { name: 'Avocado', grams: 30 },
      ],
      instructions: 'Cook eggs and turkey. Serve with toast and sliced avocado.',
    },
    totalCalories: 395,
    totalProteins: 32.1,
    totalCarbs: 27.7,
    totalFats: 15.8,
    scaleableIngredients: ['Egg (whole, large)', 'Turkey Breast (cooked)'],
    minScale: 0.7,
    maxScale: 1.9,
    preparationTime: 10,
    difficulty: MealDifficulty.EASY,
    macroFocus: MacroFocus.HIGH_PROTEIN,
    translations: {
      pl: {
        name: 'Jajka z boczkiem z indyka',
      },
    },
  },
  {
    name: 'Chia Pudding',
    category: MealCategory.BREAKFAST,
    baseRecipe: {
      ingredients: [
        { name: 'Chia Seeds', grams: 28 },
        { name: 'Milk (skim)', grams: 250 },
        { name: 'Blueberries', grams: 50 },
        { name: 'Strawberries', grams: 50 },
        { name: 'Honey', grams: 10 },
      ],
      instructions: 'Mix chia seeds with milk. Refrigerate overnight. Top with berries and honey.',
    },
    totalCalories: 309,
    totalProteins: 15.2,
    totalCarbs: 42.4,
    totalFats: 9.4,
    scaleableIngredients: ['Chia Seeds', 'Milk (skim)', 'Blueberries'],
    minScale: 0.6,
    maxScale: 1.5,
    preparationTime: 5,
    difficulty: MealDifficulty.EASY,
    macroFocus: MacroFocus.BALANCED,
    translations: {
      pl: {
        name: 'Pudding chia',
      },
    },
  },
  {
    name: 'Whole Grain Toast with Almond Butter',
    category: MealCategory.BREAKFAST,
    baseRecipe: {
      ingredients: [
        { name: 'Whole Wheat Bread', grams: 84 },
        { name: 'Peanut Butter', grams: 32 },
        { name: 'Banana', grams: 100 },
        { name: 'Honey', grams: 10 },
      ],
      instructions: 'Toast bread, spread peanut butter, top with banana slices and honey.',
    },
    totalCalories: 458,
    totalProteins: 16.7,
    totalCarbs: 67.9,
    totalFats: 17.9,
    scaleableIngredients: ['Whole Wheat Bread', 'Peanut Butter', 'Banana'],
    minScale: 0.6,
    maxScale: 1.7,
    preparationTime: 5,
    difficulty: MealDifficulty.EASY,
    macroFocus: MacroFocus.HIGH_CARB,
    translations: {
      pl: {
        name: 'Pełnoziarnisty toast z masłem migdałowym',
      },
    },
  },

  // LUNCH TEMPLATES
  {
    name: 'Grilled Chicken Salad',
    category: MealCategory.LUNCH,
    baseRecipe: {
      ingredients: [
        { name: 'Chicken Breast (skinless, cooked)', grams: 150 },
        { name: 'Lettuce (raw)', grams: 100 },
        { name: 'Tomato (raw)', grams: 100 },
        { name: 'Cucumber (raw)', grams: 100 },
        { name: 'Olive Oil', grams: 14 },
        { name: 'Whole Wheat Bread', grams: 56 },
      ],
      instructions: 'Grill chicken. Combine with fresh vegetables. Dress with olive oil. Serve with bread.',
    },
    totalCalories: 555,
    totalProteins: 53.5,
    totalCarbs: 37.9,
    totalFats: 19.8,
    scaleableIngredients: ['Chicken Breast (skinless, cooked)', 'Lettuce (raw)', 'Tomato (raw)'],
    minScale: 0.7,
    maxScale: 1.8,
    preparationTime: 20,
    difficulty: MealDifficulty.MEDIUM,
    macroFocus: MacroFocus.HIGH_PROTEIN,
    translations: {
      pl: {
        name: 'Sałatka z grillowanym kurczakiem',
      },
    },
  },
  {
    name: 'Salmon with Quinoa',
    category: MealCategory.LUNCH,
    baseRecipe: {
      ingredients: [
        { name: 'Salmon (Atlantic, cooked)', grams: 150 },
        { name: 'Quinoa (cooked)', grams: 150 },
        { name: 'Broccoli (cooked)', grams: 100 },
        { name: 'Asparagus (cooked)', grams: 100 },
        { name: 'Olive Oil', grams: 7 },
      ],
      instructions: 'Bake salmon. Serve with quinoa and steamed vegetables drizzled with olive oil.',
    },
    totalCalories: 605,
    totalProteins: 46.2,
    totalCarbs: 49.6,
    totalFats: 25.0,
    scaleableIngredients: ['Salmon (Atlantic, cooked)', 'Quinoa (cooked)', 'Broccoli (cooked)'],
    minScale: 0.7,
    maxScale: 1.9,
    preparationTime: 25,
    difficulty: MealDifficulty.MEDIUM,
    macroFocus: MacroFocus.HIGH_PROTEIN,
    translations: {
      pl: {
        name: 'Łosoś z quinoa',
      },
    },
  },
  {
    name: 'Turkey Wrap',
    category: MealCategory.LUNCH,
    baseRecipe: {
      ingredients: [
        { name: 'Turkey Breast (cooked)', grams: 100 },
        { name: 'Whole Wheat Bread', grams: 84 },
        { name: 'Lettuce (raw)', grams: 50 },
        { name: 'Tomato (raw)', grams: 50 },
        { name: 'Avocado', grams: 50 },
        { name: 'Mustard', grams: 10 },
      ],
      instructions: 'Layer turkey, vegetables, and avocado on bread. Roll into a wrap.',
    },
    totalCalories: 452,
    totalProteins: 42.2,
    totalCarbs: 42.8,
    totalFats: 10.8,
    scaleableIngredients: ['Turkey Breast (cooked)', 'Whole Wheat Bread', 'Avocado'],
    minScale: 0.6,
    maxScale: 1.8,
    preparationTime: 10,
    difficulty: MealDifficulty.EASY,
    macroFocus: MacroFocus.HIGH_PROTEIN,
    translations: {
      pl: {
        name: 'Wrap z indykiem',
      },
    },
  },
  {
    name: 'Beef Stir-Fry with Rice',
    category: MealCategory.LUNCH,
    baseRecipe: {
      ingredients: [
        { name: 'Ground Beef (90% lean, cooked)', grams: 120 },
        { name: 'Brown Rice (cooked)', grams: 150 },
        { name: 'Broccoli (cooked)', grams: 100 },
        { name: 'Bell Pepper (raw)', grams: 100 },
        { name: 'Soy Sauce', grams: 15 },
        { name: 'Olive Oil', grams: 7 },
      ],
      instructions: 'Stir-fry beef with vegetables in olive oil. Add soy sauce. Serve over brown rice.',
    },
    totalCalories: 565,
    totalProteins: 38.5,
    totalCarbs: 57.9,
    totalFats: 19.6,
    scaleableIngredients: ['Ground Beef (90% lean, cooked)', 'Brown Rice (cooked)', 'Broccoli (cooked)'],
    minScale: 0.7,
    maxScale: 1.9,
    preparationTime: 20,
    difficulty: MealDifficulty.MEDIUM,
    macroFocus: MacroFocus.BALANCED,
    translations: {
      pl: {
        name: 'Wołowina stir-fry z ryżem',
      },
    },
  },
  {
    name: 'Tuna Salad Bowl',
    category: MealCategory.LUNCH,
    baseRecipe: {
      ingredients: [
        { name: 'Tuna (canned in water)', grams: 150 },
        { name: 'Chickpeas (cooked)', grams: 100 },
        { name: 'Lettuce (raw)', grams: 100 },
        { name: 'Cucumber (raw)', grams: 100 },
        { name: 'Tomato (raw)', grams: 100 },
        { name: 'Olive Oil', grams: 14 },
      ],
      instructions: 'Mix tuna and chickpeas with fresh vegetables. Dress with olive oil.',
    },
    totalCalories: 497,
    totalProteins: 51.8,
    totalCarbs: 38.7,
    totalFats: 15.5,
    scaleableIngredients: ['Tuna (canned in water)', 'Chickpeas (cooked)', 'Lettuce (raw)'],
    minScale: 0.6,
    maxScale: 1.7,
    preparationTime: 10,
    difficulty: MealDifficulty.EASY,
    macroFocus: MacroFocus.HIGH_PROTEIN,
    translations: {
      pl: {
        name: 'Sałatka z tuńczykiem',
      },
    },
  },
  {
    name: 'Chicken Pasta',
    category: MealCategory.LUNCH,
    baseRecipe: {
      ingredients: [
        { name: 'Chicken Breast (skinless, cooked)', grams: 120 },
        { name: 'Whole Wheat Pasta (cooked)', grams: 150 },
        { name: 'Tomato (raw)', grams: 100 },
        { name: 'Spinach (cooked)', grams: 50 },
        { name: 'Olive Oil', grams: 14 },
      ],
      instructions: 'Cook pasta. Sauté chicken with tomatoes and spinach in olive oil. Mix together.',
    },
    totalCalories: 569,
    totalProteins: 48.0,
    totalCarbs: 57.1,
    totalFats: 17.7,
    scaleableIngredients: ['Chicken Breast (skinless, cooked)', 'Whole Wheat Pasta (cooked)'],
    minScale: 0.7,
    maxScale: 1.9,
    preparationTime: 20,
    difficulty: MealDifficulty.MEDIUM,
    macroFocus: MacroFocus.BALANCED,
    translations: {
      pl: {
        name: 'Makaron z kurczakiem',
      },
    },
  },
  {
    name: 'Vegetarian Buddha Bowl',
    category: MealCategory.LUNCH,
    baseRecipe: {
      ingredients: [
        { name: 'Quinoa (cooked)', grams: 150 },
        { name: 'Chickpeas (cooked)', grams: 150 },
        { name: 'Sweet Potato (baked)', grams: 100 },
        { name: 'Kale (cooked)', grams: 50 },
        { name: 'Avocado', grams: 50 },
        { name: 'Olive Oil', grams: 7 },
      ],
      instructions: 'Arrange quinoa, roasted chickpeas, sweet potato, kale, and avocado in a bowl. Drizzle with olive oil.',
    },
    totalCalories: 629,
    totalProteins: 22.7,
    totalCarbs: 92.6,
    totalFats: 22.2,
    scaleableIngredients: ['Quinoa (cooked)', 'Chickpeas (cooked)', 'Sweet Potato (baked)'],
    minScale: 0.6,
    maxScale: 1.7,
    preparationTime: 25,
    difficulty: MealDifficulty.MEDIUM,
    macroFocus: MacroFocus.BALANCED,
    translations: {
      pl: {
        name: 'Wegetariańska miska buddyjska',
      },
    },
  },
  {
    name: 'Shrimp Tacos',
    category: MealCategory.LUNCH,
    baseRecipe: {
      ingredients: [
        { name: 'Shrimp (cooked)', grams: 150 },
        { name: 'Whole Wheat Bread', grams: 84 },
        { name: 'Lettuce (raw)', grams: 50 },
        { name: 'Tomato (raw)', grams: 50 },
        { name: 'Avocado', grams: 50 },
      ],
      instructions: 'Season and cook shrimp. Serve in bread with lettuce, tomato, and avocado.',
    },
    totalCalories: 450,
    totalProteins: 43.2,
    totalCarbs: 39.5,
    totalFats: 11.7,
    scaleableIngredients: ['Shrimp (cooked)', 'Whole Wheat Bread', 'Avocado'],
    minScale: 0.6,
    maxScale: 1.8,
    preparationTime: 15,
    difficulty: MealDifficulty.MEDIUM,
    macroFocus: MacroFocus.HIGH_PROTEIN,
    translations: {
      pl: {
        name: 'Tacos z krewetkami',
      },
    },
  },
  {
    name: 'Tofu Stir-Fry',
    category: MealCategory.LUNCH,
    baseRecipe: {
      ingredients: [
        { name: 'Tofu (firm)', grams: 150 },
        { name: 'Brown Rice (cooked)', grams: 150 },
        { name: 'Broccoli (cooked)', grams: 100 },
        { name: 'Bell Pepper (raw)', grams: 100 },
        { name: 'Soy Sauce', grams: 15 },
        { name: 'Olive Oil', grams: 7 },
      ],
      instructions: 'Stir-fry tofu and vegetables with soy sauce. Serve over brown rice.',
    },
    totalCalories: 591,
    totalProteins: 28.4,
    totalCarbs: 70.0,
    totalFats: 22.9,
    scaleableIngredients: ['Tofu (firm)', 'Brown Rice (cooked)', 'Broccoli (cooked)'],
    minScale: 0.7,
    maxScale: 1.8,
    preparationTime: 20,
    difficulty: MealDifficulty.MEDIUM,
    macroFocus: MacroFocus.BALANCED,
    translations: {
      pl: {
        name: 'Tofu stir-fry',
      },
    },
  },
  {
    name: 'Grilled Pork with Sweet Potato',
    category: MealCategory.LUNCH,
    baseRecipe: {
      ingredients: [
        { name: 'Pork Loin (lean, cooked)', grams: 150 },
        { name: 'Sweet Potato (baked)', grams: 200 },
        { name: 'Green Beans (cooked)', grams: 100 },
        { name: 'Olive Oil', grams: 7 },
      ],
      instructions: 'Grill pork loin. Serve with baked sweet potato and green beans drizzled with olive oil.',
    },
    totalCalories: 585,
    totalProteins: 44.0,
    totalCarbs: 64.4,
    totalFats: 13.3,
    scaleableIngredients: ['Pork Loin (lean, cooked)', 'Sweet Potato (baked)', 'Green Beans (cooked)'],
    minScale: 0.7,
    maxScale: 1.9,
    preparationTime: 25,
    difficulty: MealDifficulty.MEDIUM,
    macroFocus: MacroFocus.BALANCED,
    translations: {
      pl: {
        name: 'Grillowany schab ze słodkim ziemniakiem',
      },
    },
  },

  // DINNER TEMPLATES
  {
    name: 'Grilled Salmon with Vegetables',
    category: MealCategory.DINNER,
    baseRecipe: {
      ingredients: [
        { name: 'Salmon (Atlantic, cooked)', grams: 180 },
        { name: 'Asparagus (cooked)', grams: 150 },
        { name: 'Broccoli (cooked)', grams: 100 },
        { name: 'Sweet Potato (baked)', grams: 150 },
        { name: 'Olive Oil', grams: 14 },
      ],
      instructions: 'Grill salmon. Roast vegetables with olive oil. Serve together.',
    },
    totalCalories: 655,
    totalProteins: 50.6,
    totalCarbs: 53.7,
    totalFats: 28.9,
    scaleableIngredients: ['Salmon (Atlantic, cooked)', 'Asparagus (cooked)', 'Sweet Potato (baked)'],
    minScale: 0.7,
    maxScale: 1.8,
    preparationTime: 30,
    difficulty: MealDifficulty.MEDIUM,
    macroFocus: MacroFocus.HIGH_PROTEIN,
    translations: {
      pl: {
        name: 'Grillowany łosoś z warzywami',
      },
    },
  },
  {
    name: 'Chicken Stir-Fry with Brown Rice',
    category: MealCategory.DINNER,
    baseRecipe: {
      ingredients: [
        { name: 'Chicken Breast (skinless, cooked)', grams: 150 },
        { name: 'Brown Rice (cooked)', grams: 200 },
        { name: 'Broccoli (cooked)', grams: 100 },
        { name: 'Bell Pepper (raw)', grams: 100 },
        { name: 'Soy Sauce', grams: 15 },
        { name: 'Olive Oil', grams: 7 },
      ],
      instructions: 'Stir-fry chicken with vegetables. Season with soy sauce. Serve over brown rice.',
    },
    totalCalories: 619,
    totalProteins: 53.3,
    totalCarbs: 68.0,
    totalFats: 13.4,
    scaleableIngredients: ['Chicken Breast (skinless, cooked)', 'Brown Rice (cooked)', 'Broccoli (cooked)'],
    minScale: 0.7,
    maxScale: 1.9,
    preparationTime: 25,
    difficulty: MealDifficulty.MEDIUM,
    macroFocus: MacroFocus.BALANCED,
    translations: {
      pl: {
        name: 'Kurczak stir-fry z brązowym ryżem',
      },
    },
  },
  {
    name: 'Beef and Vegetable Stew',
    category: MealCategory.DINNER,
    baseRecipe: {
      ingredients: [
        { name: 'Ground Beef (90% lean, cooked)', grams: 150 },
        { name: 'Potato (baked with skin)', grams: 200 },
        { name: 'Carrot (raw)', grams: 100 },
        { name: 'Onion (raw)', grams: 50 },
        { name: 'Tomato (raw)', grams: 100 },
      ],
      instructions: 'Brown beef with onions. Add vegetables and simmer until tender.',
    },
    totalCalories: 618,
    totalProteins: 45.9,
    totalCarbs: 77.8,
    totalFats: 13.1,
    scaleableIngredients: ['Ground Beef (90% lean, cooked)', 'Potato (baked with skin)', 'Carrot (raw)'],
    minScale: 0.7,
    maxScale: 1.8,
    preparationTime: 40,
    difficulty: MealDifficulty.MEDIUM,
    macroFocus: MacroFocus.BALANCED,
    translations: {
      pl: {
        name: 'Gulasz wołowy z warzywami',
      },
    },
  },
  {
    name: 'Turkey Meatballs with Pasta',
    category: MealCategory.DINNER,
    baseRecipe: {
      ingredients: [
        { name: 'Turkey Breast (cooked)', grams: 150 },
        { name: 'Whole Wheat Pasta (cooked)', grams: 200 },
        { name: 'Tomato (raw)', grams: 150 },
        { name: 'Spinach (cooked)', grams: 50 },
        { name: 'Olive Oil', grams: 14 },
      ],
      instructions: 'Form turkey into meatballs and bake. Cook pasta. Make tomato sauce with spinach. Combine.',
    },
    totalCalories: 677,
    totalProteins: 58.5,
    totalCarbs: 78.8,
    totalFats: 16.6,
    scaleableIngredients: ['Turkey Breast (cooked)', 'Whole Wheat Pasta (cooked)', 'Tomato (raw)'],
    minScale: 0.7,
    maxScale: 1.9,
    preparationTime: 35,
    difficulty: MealDifficulty.MEDIUM,
    macroFocus: MacroFocus.BALANCED,
    translations: {
      pl: {
        name: 'Klopsiki z indyka z makaronem',
      },
    },
  },
  {
    name: 'Baked Cod with Quinoa',
    category: MealCategory.DINNER,
    baseRecipe: {
      ingredients: [
        { name: 'Cod (cooked)', grams: 180 },
        { name: 'Quinoa (cooked)', grams: 150 },
        { name: 'Zucchini (cooked)', grams: 150 },
        { name: 'Tomato (raw)', grams: 100 },
        { name: 'Olive Oil', grams: 14 },
      ],
      instructions: 'Bake cod with herbs. Serve with quinoa and roasted vegetables.',
    },
    totalCalories: 565,
    totalProteins: 50.6,
    totalCarbs: 53.1,
    totalFats: 17.4,
    scaleableIngredients: ['Cod (cooked)', 'Quinoa (cooked)', 'Zucchini (cooked)'],
    minScale: 0.7,
    maxScale: 1.8,
    preparationTime: 30,
    difficulty: MealDifficulty.MEDIUM,
    macroFocus: MacroFocus.HIGH_PROTEIN,
    translations: {
      pl: {
        name: 'Pieczony dorsz z quinoa',
      },
    },
  },
  {
    name: 'Chicken Thigh with Sweet Potato',
    category: MealCategory.DINNER,
    baseRecipe: {
      ingredients: [
        { name: 'Chicken Thigh (skinless, cooked)', grams: 150 },
        { name: 'Sweet Potato (baked)', grams: 200 },
        { name: 'Broccoli (cooked)', grams: 150 },
        { name: 'Olive Oil', grams: 7 },
      ],
      instructions: 'Roast chicken thighs. Bake sweet potato. Steam broccoli. Drizzle with olive oil.',
    },
    totalCalories: 585,
    totalProteins: 43.5,
    totalCarbs: 62.9,
    totalFats: 17.9,
    scaleableIngredients: ['Chicken Thigh (skinless, cooked)', 'Sweet Potato (baked)', 'Broccoli (cooked)'],
    minScale: 0.7,
    maxScale: 1.9,
    preparationTime: 35,
    difficulty: MealDifficulty.MEDIUM,
    macroFocus: MacroFocus.BALANCED,
    translations: {
      pl: {
        name: 'Udko z kurczaka ze słodkim ziemniakiem',
      },
    },
  },
  {
    name: 'Shrimp and Vegetable Stir-Fry',
    category: MealCategory.DINNER,
    baseRecipe: {
      ingredients: [
        { name: 'Shrimp (cooked)', grams: 200 },
        { name: 'Brown Rice (cooked)', grams: 200 },
        { name: 'Broccoli (cooked)', grams: 100 },
        { name: 'Bell Pepper (raw)', grams: 100 },
        { name: 'Soy Sauce', grams: 15 },
        { name: 'Olive Oil', grams: 7 },
      ],
      instructions: 'Stir-fry shrimp and vegetables with soy sauce. Serve over brown rice.',
    },
    totalCalories: 621,
    totalProteins: 49.2,
    totalCarbs: 76.1,
    totalFats: 12.7,
    scaleableIngredients: ['Shrimp (cooked)', 'Brown Rice (cooked)', 'Broccoli (cooked)'],
    minScale: 0.7,
    maxScale: 1.8,
    preparationTime: 20,
    difficulty: MealDifficulty.MEDIUM,
    macroFocus: MacroFocus.BALANCED,
    translations: {
      pl: {
        name: 'Krewetki stir-fry z warzywami',
      },
    },
  },
  {
    name: 'Pork Chops with Mashed Potatoes',
    category: MealCategory.DINNER,
    baseRecipe: {
      ingredients: [
        { name: 'Pork Loin (lean, cooked)', grams: 150 },
        { name: 'Potato (baked with skin)', grams: 250 },
        { name: 'Green Beans (cooked)', grams: 150 },
        { name: 'Butter', grams: 14 },
      ],
      instructions: 'Grill pork chops. Mash potatoes with butter. Steam green beans.',
    },
    totalCalories: 678,
    totalProteins: 48.3,
    totalCarbs: 74.2,
    totalFats: 19.6,
    scaleableIngredients: ['Pork Loin (lean, cooked)', 'Potato (baked with skin)', 'Green Beans (cooked)'],
    minScale: 0.7,
    maxScale: 1.9,
    preparationTime: 30,
    difficulty: MealDifficulty.MEDIUM,
    macroFocus: MacroFocus.BALANCED,
    translations: {
      pl: {
        name: 'Kotlety schabowe z puree ziemniaczanym',
      },
    },
  },
  {
    name: 'Lentil Curry with Rice',
    category: MealCategory.DINNER,
    baseRecipe: {
      ingredients: [
        { name: 'Lentils (cooked)', grams: 200 },
        { name: 'Brown Rice (cooked)', grams: 150 },
        { name: 'Tomato (raw)', grams: 100 },
        { name: 'Spinach (cooked)', grams: 50 },
        { name: 'Coconut Oil', grams: 14 },
      ],
      instructions: 'Cook lentils with curry spices and tomatoes. Add spinach. Serve over brown rice.',
    },
    totalCalories: 603,
    totalProteins: 22.4,
    totalCarbs: 89.9,
    totalFats: 16.9,
    scaleableIngredients: ['Lentils (cooked)', 'Brown Rice (cooked)', 'Tomato (raw)'],
    minScale: 0.6,
    maxScale: 1.7,
    preparationTime: 30,
    difficulty: MealDifficulty.MEDIUM,
    macroFocus: MacroFocus.HIGH_CARB,
    translations: {
      pl: {
        name: 'Curry z soczewicy z ryżem',
      },
    },
  },
  {
    name: 'Grilled Mackerel with Vegetables',
    category: MealCategory.DINNER,
    baseRecipe: {
      ingredients: [
        { name: 'Mackerel (cooked)', grams: 150 },
        { name: 'Sweet Potato (baked)', grams: 200 },
        { name: 'Asparagus (cooked)', grams: 150 },
        { name: 'Olive Oil', grams: 7 },
      ],
      instructions: 'Grill mackerel. Roast sweet potato and asparagus with olive oil.',
    },
    totalCalories: 703,
    totalProteins: 42.5,
    totalCarbs: 58.4,
    totalFats: 31.4,
    scaleableIngredients: ['Mackerel (cooked)', 'Sweet Potato (baked)', 'Asparagus (cooked)'],
    minScale: 0.7,
    maxScale: 1.8,
    preparationTime: 25,
    difficulty: MealDifficulty.MEDIUM,
    macroFocus: MacroFocus.HIGH_PROTEIN,
    translations: {
      pl: {
        name: 'Grillowana makrela z warzywami',
      },
    },
  },

  // SNACK TEMPLATES
  {
    name: 'Protein Shake',
    category: MealCategory.SNACK,
    baseRecipe: {
      ingredients: [
        { name: 'Milk (skim)', grams: 250 },
        { name: 'Banana', grams: 100 },
        { name: 'Peanut Butter', grams: 16 },
      ],
      instructions: 'Blend milk, banana, and peanut butter until smooth.',
    },
    totalCalories: 296,
    totalProteins: 13.4,
    totalCarbs: 39.8,
    totalFats: 8.5,
    scaleableIngredients: ['Milk (skim)', 'Banana', 'Peanut Butter'],
    minScale: 0.5,
    maxScale: 2.0,
    preparationTime: 5,
    difficulty: MealDifficulty.EASY,
    macroFocus: MacroFocus.BALANCED,
    translations: {
      pl: {
        name: 'Shake proteinowy',
      },
    },
  },
  {
    name: 'Greek Yogurt with Honey',
    category: MealCategory.SNACK,
    baseRecipe: {
      ingredients: [
        { name: 'Greek Yogurt (nonfat, plain)', grams: 150 },
        { name: 'Honey', grams: 21 },
        { name: 'Almonds', grams: 14 },
      ],
      instructions: 'Top yogurt with honey and chopped almonds.',
    },
    totalCalories: 229,
    totalProteins: 17.3,
    totalCarbs: 26.4,
    totalFats: 7.5,
    scaleableIngredients: ['Greek Yogurt (nonfat, plain)', 'Honey'],
    minScale: 0.5,
    maxScale: 1.8,
    preparationTime: 3,
    difficulty: MealDifficulty.EASY,
    macroFocus: MacroFocus.HIGH_PROTEIN,
    translations: {
      pl: {
        name: 'Grecki jogurt z miodem',
      },
    },
  },
  {
    name: 'Apple with Almond Butter',
    category: MealCategory.SNACK,
    baseRecipe: {
      ingredients: [
        { name: 'Apple', grams: 150 },
        { name: 'Peanut Butter', grams: 16 },
      ],
      instructions: 'Slice apple and serve with almond butter for dipping.',
    },
    totalCalories: 172,
    totalProteins: 4.3,
    totalCarbs: 28.7,
    totalFats: 8.0,
    scaleableIngredients: ['Apple', 'Peanut Butter'],
    minScale: 0.5,
    maxScale: 2.0,
    preparationTime: 3,
    difficulty: MealDifficulty.EASY,
    macroFocus: MacroFocus.BALANCED,
    translations: {
      pl: {
        name: 'Jabłko z masłem migdałowym',
      },
    },
  },
  {
    name: 'Hummus with Vegetables',
    category: MealCategory.SNACK,
    baseRecipe: {
      ingredients: [
        { name: 'Chickpeas (cooked)', grams: 100 },
        { name: 'Carrot (raw)', grams: 100 },
        { name: 'Cucumber (raw)', grams: 100 },
        { name: 'Olive Oil', grams: 7 },
      ],
      instructions: 'Blend chickpeas with olive oil to make hummus. Serve with sliced vegetables.',
    },
    totalCalories: 257,
    totalProteins: 10.7,
    totalCarbs: 35.9,
    totalFats: 9.7,
    scaleableIngredients: ['Chickpeas (cooked)', 'Carrot (raw)', 'Cucumber (raw)'],
    minScale: 0.5,
    maxScale: 1.8,
    preparationTime: 10,
    difficulty: MealDifficulty.EASY,
    macroFocus: MacroFocus.BALANCED,
    translations: {
      pl: {
        name: 'Hummus z warzywami',
      },
    },
  },
  {
    name: 'Cottage Cheese with Berries',
    category: MealCategory.SNACK,
    baseRecipe: {
      ingredients: [
        { name: 'Cottage Cheese (low fat)', grams: 150 },
        { name: 'Blueberries', grams: 50 },
        { name: 'Strawberries', grams: 50 },
      ],
      instructions: 'Mix cottage cheese with fresh berries.',
    },
    totalCalories: 156,
    totalProteins: 19.3,
    totalCarbs: 14.1,
    totalFats: 1.6,
    scaleableIngredients: ['Cottage Cheese (low fat)', 'Blueberries', 'Strawberries'],
    minScale: 0.5,
    maxScale: 1.8,
    preparationTime: 3,
    difficulty: MealDifficulty.EASY,
    macroFocus: MacroFocus.HIGH_PROTEIN,
    translations: {
      pl: {
        name: 'Twarożek z jagodami',
      },
    },
  },
  {
    name: 'Hard-Boiled Eggs',
    category: MealCategory.SNACK,
    baseRecipe: {
      ingredients: [
        { name: 'Egg (whole, large)', grams: 100 },
        { name: 'Whole Wheat Bread', grams: 28 },
      ],
      instructions: 'Boil eggs. Serve with whole wheat toast.',
    },
    totalCalories: 213,
    totalProteins: 15.9,
    totalCarbs: 12.0,
    totalFats: 10.8,
    scaleableIngredients: ['Egg (whole, large)', 'Whole Wheat Bread'],
    minScale: 0.5,
    maxScale: 2.0,
    preparationTime: 10,
    difficulty: MealDifficulty.EASY,
    macroFocus: MacroFocus.HIGH_PROTEIN,
    translations: {
      pl: {
        name: 'Jajka na twardo',
      },
    },
  },
  {
    name: 'Trail Mix',
    category: MealCategory.SNACK,
    baseRecipe: {
      ingredients: [
        { name: 'Almonds', grams: 28 },
        { name: 'Walnuts', grams: 14 },
        { name: 'Raisins', grams: 40 },
      ],
      instructions: 'Mix nuts and dried fruit.',
    },
    totalCalories: 284,
    totalProteins: 8.2,
    totalCarbs: 32.4,
    totalFats: 16.4,
    scaleableIngredients: ['Almonds', 'Walnuts'],
    minScale: 0.5,
    maxScale: 2.0,
    preparationTime: 2,
    difficulty: MealDifficulty.EASY,
    macroFocus: MacroFocus.BALANCED,
    translations: {
      pl: {
        name: 'Mix orzechowy',
      },
    },
  },
  {
    name: 'Edamame',
    category: MealCategory.SNACK,
    baseRecipe: {
      ingredients: [
        { name: 'Edamame (cooked)', grams: 150 },
        { name: 'Soy Sauce', grams: 5 },
      ],
      instructions: 'Steam edamame and lightly salt or add soy sauce.',
    },
    totalCalories: 186,
    totalProteins: 18.3,
    totalCarbs: 13.8,
    totalFats: 7.8,
    scaleableIngredients: ['Edamame (cooked)'],
    minScale: 0.5,
    maxScale: 2.0,
    preparationTime: 5,
    difficulty: MealDifficulty.EASY,
    macroFocus: MacroFocus.HIGH_PROTEIN,
    translations: {
      pl: {
        name: 'Edamame',
      },
    },
  },
  {
    name: 'Banana with Peanut Butter',
    category: MealCategory.SNACK,
    baseRecipe: {
      ingredients: [
        { name: 'Banana', grams: 100 },
        { name: 'Peanut Butter', grams: 16 },
      ],
      instructions: 'Slice banana and spread with peanut butter.',
    },
    totalCalories: 183,
    totalProteins: 4.9,
    totalCarbs: 26.8,
    totalFats: 8.3,
    scaleableIngredients: ['Banana', 'Peanut Butter'],
    minScale: 0.5,
    maxScale: 2.0,
    preparationTime: 3,
    difficulty: MealDifficulty.EASY,
    macroFocus: MacroFocus.BALANCED,
    translations: {
      pl: {
        name: 'Banan z masłem orzechowym',
      },
    },
  },
  {
    name: 'Tuna Snack',
    category: MealCategory.SNACK,
    baseRecipe: {
      ingredients: [
        { name: 'Tuna (canned in water)', grams: 100 },
        { name: 'Whole Wheat Bread', grams: 28 },
      ],
      instructions: 'Drain tuna and serve on whole wheat crackers or toast.',
    },
    totalCalories: 185,
    totalProteins: 28.6,
    totalCarbs: 11.6,
    totalFats: 2.0,
    scaleableIngredients: ['Tuna (canned in water)', 'Whole Wheat Bread'],
    minScale: 0.5,
    maxScale: 1.8,
    preparationTime: 3,
    difficulty: MealDifficulty.EASY,
    macroFocus: MacroFocus.HIGH_PROTEIN,
    translations: {
      pl: {
        name: 'Przekąska z tuńczykiem',
      },
    },
  },
];

async function seedMealTemplates() {
  console.log('Seeding meal templates...');

  for (const template of mealTemplates) {
    await prisma.mealTemplate.upsert({
      where: {
        id: template.name.toLowerCase().replace(/\s+/g, '-'),
      },
      update: template,
      create: {
        id: template.name.toLowerCase().replace(/\s+/g, '-'),
        ...template,
      },
    });
  }

  console.log(`Seeded ${mealTemplates.length} meal templates successfully!`);
}

seedMealTemplates()
  .catch((e) => {
    console.error('Error seeding meal templates:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
