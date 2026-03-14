import {
  PrismaClient,
  Prisma,
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

interface IngredientEntry {
  name: string;
  grams: number;
  scaleable: boolean;
  sortOrder?: number;
}

interface MealTemplateData {
  name: string;
  category: MealCategory;
  ingredients: IngredientEntry[];
  totalCalories: number;
  totalProteins: number;
  totalCarbs: number;
  totalFats: number;
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
    ingredients: [
      { name: 'Oatmeal (cooked)', grams: 200, scaleable: true },
      { name: 'Blueberries', grams: 50, scaleable: true },
      { name: 'Banana', grams: 100, scaleable: true },
      { name: 'Almonds', grams: 14, scaleable: true },
      { name: 'Honey', grams: 10, scaleable: false },
    ],
    totalCalories: 395,
    totalProteins: 10.5,
    totalCarbs: 71.5,
    totalFats: 9.1,
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
    ingredients: [
      { name: 'Egg (whole, large)', grams: 150, scaleable: true },
      { name: 'Banana', grams: 100, scaleable: true },
      { name: 'Oatmeal (cooked)', grams: 100, scaleable: true },
      { name: 'Blueberries', grams: 50, scaleable: false },
    ],
    totalCalories: 450,
    totalProteins: 23.9,
    totalCarbs: 58.5,
    totalFats: 15.1,
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
    ingredients: [
      { name: 'Greek Yogurt (nonfat, plain)', grams: 200, scaleable: true },
      { name: 'Strawberries', grams: 100, scaleable: true },
      { name: 'Blueberries', grams: 50, scaleable: true },
      { name: 'Almonds', grams: 28, scaleable: false },
      { name: 'Honey', grams: 21, scaleable: false },
    ],
    totalCalories: 400,
    totalProteins: 24.7,
    totalCarbs: 53.3,
    totalFats: 15.8,
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
    ingredients: [
      { name: 'Egg (whole, large)', grams: 150, scaleable: true },
      { name: 'Whole Wheat Bread', grams: 56, scaleable: true },
      { name: 'Avocado', grams: 50, scaleable: true },
      { name: 'Tomato (raw)', grams: 50, scaleable: false },
    ],
    totalCalories: 413,
    totalProteins: 21.9,
    totalCarbs: 31.3,
    totalFats: 22.1,
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
    ingredients: [
      { name: 'Cottage Cheese (low fat)', grams: 200, scaleable: true },
      { name: 'Banana', grams: 100, scaleable: true },
      { name: 'Strawberries', grams: 50, scaleable: true },
      { name: 'Walnuts', grams: 28, scaleable: false },
    ],
    totalCalories: 431,
    totalProteins: 29.5,
    totalCarbs: 42.1,
    totalFats: 19.6,
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
    ingredients: [
      { name: 'Egg White', grams: 165, scaleable: true },
      { name: 'Spinach (cooked)', grams: 50, scaleable: true },
      { name: 'Mushrooms (cooked)', grams: 50, scaleable: true },
      { name: 'Bell Pepper (raw)', grams: 50, scaleable: false },
      { name: 'Whole Wheat Bread', grams: 56, scaleable: false },
    ],
    totalCalories: 276,
    totalProteins: 26.9,
    totalCarbs: 36.9,
    totalFats: 3.5,
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
    ingredients: [
      { name: 'Banana', grams: 150, scaleable: true },
      { name: 'Peanut Butter', grams: 32, scaleable: true },
      { name: 'Milk (skim)', grams: 250, scaleable: true },
      { name: 'Oatmeal (cooked)', grams: 50, scaleable: false },
    ],
    totalCalories: 449,
    totalProteins: 18.8,
    totalCarbs: 59.8,
    totalFats: 16.6,
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
    ingredients: [
      { name: 'Egg (whole, large)', grams: 100, scaleable: true },
      { name: 'Turkey Breast (cooked)', grams: 50, scaleable: true },
      { name: 'Whole Wheat Bread', grams: 56, scaleable: false },
      { name: 'Avocado', grams: 30, scaleable: false },
    ],
    totalCalories: 395,
    totalProteins: 32.1,
    totalCarbs: 27.7,
    totalFats: 15.8,
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
    ingredients: [
      { name: 'Chia Seeds', grams: 28, scaleable: true },
      { name: 'Milk (skim)', grams: 250, scaleable: true },
      { name: 'Blueberries', grams: 50, scaleable: true },
      { name: 'Strawberries', grams: 50, scaleable: false },
      { name: 'Honey', grams: 10, scaleable: false },
    ],
    totalCalories: 309,
    totalProteins: 15.2,
    totalCarbs: 42.4,
    totalFats: 9.4,
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
    ingredients: [
      { name: 'Whole Wheat Bread', grams: 84, scaleable: true },
      { name: 'Peanut Butter', grams: 32, scaleable: true },
      { name: 'Banana', grams: 100, scaleable: true },
      { name: 'Honey', grams: 10, scaleable: false },
    ],
    totalCalories: 458,
    totalProteins: 16.7,
    totalCarbs: 67.9,
    totalFats: 17.9,
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
    ingredients: [
      { name: 'Chicken Breast (skinless, cooked)', grams: 150, scaleable: true },
      { name: 'Lettuce (raw)', grams: 100, scaleable: true },
      { name: 'Tomato (raw)', grams: 100, scaleable: true },
      { name: 'Cucumber (raw)', grams: 100, scaleable: false },
      { name: 'Olive Oil', grams: 14, scaleable: false },
      { name: 'Whole Wheat Bread', grams: 56, scaleable: false },
    ],
    totalCalories: 555,
    totalProteins: 53.5,
    totalCarbs: 37.9,
    totalFats: 19.8,
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
    ingredients: [
      { name: 'Salmon (Atlantic, cooked)', grams: 150, scaleable: true },
      { name: 'Quinoa (cooked)', grams: 150, scaleable: true },
      { name: 'Broccoli (cooked)', grams: 100, scaleable: true },
      { name: 'Asparagus (cooked)', grams: 100, scaleable: false },
      { name: 'Olive Oil', grams: 7, scaleable: false },
    ],
    totalCalories: 605,
    totalProteins: 46.2,
    totalCarbs: 49.6,
    totalFats: 25.0,
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
    ingredients: [
      { name: 'Turkey Breast (cooked)', grams: 100, scaleable: true },
      { name: 'Whole Wheat Bread', grams: 84, scaleable: true },
      { name: 'Avocado', grams: 50, scaleable: true },
      { name: 'Lettuce (raw)', grams: 50, scaleable: false },
      { name: 'Tomato (raw)', grams: 50, scaleable: false },
      { name: 'Mustard', grams: 10, scaleable: false },
    ],
    totalCalories: 452,
    totalProteins: 42.2,
    totalCarbs: 42.8,
    totalFats: 10.8,
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
    ingredients: [
      { name: 'Ground Beef (90% lean, cooked)', grams: 120, scaleable: true },
      { name: 'Brown Rice (cooked)', grams: 150, scaleable: true },
      { name: 'Broccoli (cooked)', grams: 100, scaleable: true },
      { name: 'Bell Pepper (raw)', grams: 100, scaleable: false },
      { name: 'Soy Sauce', grams: 15, scaleable: false },
      { name: 'Olive Oil', grams: 7, scaleable: false },
    ],
    totalCalories: 565,
    totalProteins: 38.5,
    totalCarbs: 57.9,
    totalFats: 19.6,
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
    ingredients: [
      { name: 'Tuna (canned in water)', grams: 150, scaleable: true },
      { name: 'Chickpeas (cooked)', grams: 100, scaleable: true },
      { name: 'Lettuce (raw)', grams: 100, scaleable: true },
      { name: 'Cucumber (raw)', grams: 100, scaleable: false },
      { name: 'Tomato (raw)', grams: 100, scaleable: false },
      { name: 'Olive Oil', grams: 14, scaleable: false },
    ],
    totalCalories: 497,
    totalProteins: 51.8,
    totalCarbs: 38.7,
    totalFats: 15.5,
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
    ingredients: [
      { name: 'Chicken Breast (skinless, cooked)', grams: 120, scaleable: true },
      { name: 'Whole Wheat Pasta (cooked)', grams: 150, scaleable: true },
      { name: 'Tomato (raw)', grams: 100, scaleable: false },
      { name: 'Spinach (cooked)', grams: 50, scaleable: false },
      { name: 'Olive Oil', grams: 14, scaleable: false },
    ],
    totalCalories: 569,
    totalProteins: 48.0,
    totalCarbs: 57.1,
    totalFats: 17.7,
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
    ingredients: [
      { name: 'Quinoa (cooked)', grams: 150, scaleable: true },
      { name: 'Chickpeas (cooked)', grams: 150, scaleable: true },
      { name: 'Sweet Potato (baked)', grams: 100, scaleable: true },
      { name: 'Kale (cooked)', grams: 50, scaleable: false },
      { name: 'Avocado', grams: 50, scaleable: false },
      { name: 'Olive Oil', grams: 7, scaleable: false },
    ],
    totalCalories: 629,
    totalProteins: 22.7,
    totalCarbs: 92.6,
    totalFats: 22.2,
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
    ingredients: [
      { name: 'Shrimp (cooked)', grams: 150, scaleable: true },
      { name: 'Whole Wheat Bread', grams: 84, scaleable: true },
      { name: 'Avocado', grams: 50, scaleable: true },
      { name: 'Lettuce (raw)', grams: 50, scaleable: false },
      { name: 'Tomato (raw)', grams: 50, scaleable: false },
    ],
    totalCalories: 450,
    totalProteins: 43.2,
    totalCarbs: 39.5,
    totalFats: 11.7,
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
    ingredients: [
      { name: 'Tofu (firm)', grams: 150, scaleable: true },
      { name: 'Brown Rice (cooked)', grams: 150, scaleable: true },
      { name: 'Broccoli (cooked)', grams: 100, scaleable: true },
      { name: 'Bell Pepper (raw)', grams: 100, scaleable: false },
      { name: 'Soy Sauce', grams: 15, scaleable: false },
      { name: 'Olive Oil', grams: 7, scaleable: false },
    ],
    totalCalories: 591,
    totalProteins: 28.4,
    totalCarbs: 70.0,
    totalFats: 22.9,
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
    ingredients: [
      { name: 'Pork Loin (lean, cooked)', grams: 150, scaleable: true },
      { name: 'Sweet Potato (baked)', grams: 200, scaleable: true },
      { name: 'Green Beans (cooked)', grams: 100, scaleable: true },
      { name: 'Olive Oil', grams: 7, scaleable: false },
    ],
    totalCalories: 585,
    totalProteins: 44.0,
    totalCarbs: 64.4,
    totalFats: 13.3,
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
    ingredients: [
      { name: 'Salmon (Atlantic, cooked)', grams: 180, scaleable: true },
      { name: 'Asparagus (cooked)', grams: 150, scaleable: true },
      { name: 'Sweet Potato (baked)', grams: 150, scaleable: true },
      { name: 'Broccoli (cooked)', grams: 100, scaleable: false },
      { name: 'Olive Oil', grams: 14, scaleable: false },
    ],
    totalCalories: 655,
    totalProteins: 50.6,
    totalCarbs: 53.7,
    totalFats: 28.9,
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
    ingredients: [
      { name: 'Chicken Breast (skinless, cooked)', grams: 150, scaleable: true },
      { name: 'Brown Rice (cooked)', grams: 200, scaleable: true },
      { name: 'Broccoli (cooked)', grams: 100, scaleable: true },
      { name: 'Bell Pepper (raw)', grams: 100, scaleable: false },
      { name: 'Soy Sauce', grams: 15, scaleable: false },
      { name: 'Olive Oil', grams: 7, scaleable: false },
    ],
    totalCalories: 619,
    totalProteins: 53.3,
    totalCarbs: 68.0,
    totalFats: 13.4,
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
    ingredients: [
      { name: 'Ground Beef (90% lean, cooked)', grams: 150, scaleable: true },
      { name: 'Potato (baked with skin)', grams: 200, scaleable: true },
      { name: 'Carrot (raw)', grams: 100, scaleable: true },
      { name: 'Onion (raw)', grams: 50, scaleable: false },
      { name: 'Tomato (raw)', grams: 100, scaleable: false },
    ],
    totalCalories: 618,
    totalProteins: 45.9,
    totalCarbs: 77.8,
    totalFats: 13.1,
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
    ingredients: [
      { name: 'Turkey Breast (cooked)', grams: 150, scaleable: true },
      { name: 'Whole Wheat Pasta (cooked)', grams: 200, scaleable: true },
      { name: 'Tomato (raw)', grams: 150, scaleable: true },
      { name: 'Spinach (cooked)', grams: 50, scaleable: false },
      { name: 'Olive Oil', grams: 14, scaleable: false },
    ],
    totalCalories: 677,
    totalProteins: 58.5,
    totalCarbs: 78.8,
    totalFats: 16.6,
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
    ingredients: [
      { name: 'Cod (cooked)', grams: 180, scaleable: true },
      { name: 'Quinoa (cooked)', grams: 150, scaleable: true },
      { name: 'Zucchini (cooked)', grams: 150, scaleable: true },
      { name: 'Tomato (raw)', grams: 100, scaleable: false },
      { name: 'Olive Oil', grams: 14, scaleable: false },
    ],
    totalCalories: 565,
    totalProteins: 50.6,
    totalCarbs: 53.1,
    totalFats: 17.4,
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
    ingredients: [
      { name: 'Chicken Thigh (skinless, cooked)', grams: 150, scaleable: true },
      { name: 'Sweet Potato (baked)', grams: 200, scaleable: true },
      { name: 'Broccoli (cooked)', grams: 150, scaleable: true },
      { name: 'Olive Oil', grams: 7, scaleable: false },
    ],
    totalCalories: 585,
    totalProteins: 43.5,
    totalCarbs: 62.9,
    totalFats: 17.9,
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
    ingredients: [
      { name: 'Shrimp (cooked)', grams: 200, scaleable: true },
      { name: 'Brown Rice (cooked)', grams: 200, scaleable: true },
      { name: 'Broccoli (cooked)', grams: 100, scaleable: true },
      { name: 'Bell Pepper (raw)', grams: 100, scaleable: false },
      { name: 'Soy Sauce', grams: 15, scaleable: false },
      { name: 'Olive Oil', grams: 7, scaleable: false },
    ],
    totalCalories: 621,
    totalProteins: 49.2,
    totalCarbs: 76.1,
    totalFats: 12.7,
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
    ingredients: [
      { name: 'Pork Loin (lean, cooked)', grams: 150, scaleable: true },
      { name: 'Potato (baked with skin)', grams: 250, scaleable: true },
      { name: 'Green Beans (cooked)', grams: 150, scaleable: true },
      { name: 'Butter', grams: 14, scaleable: false },
    ],
    totalCalories: 678,
    totalProteins: 48.3,
    totalCarbs: 74.2,
    totalFats: 19.6,
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
    ingredients: [
      { name: 'Lentils (cooked)', grams: 200, scaleable: true },
      { name: 'Brown Rice (cooked)', grams: 150, scaleable: true },
      { name: 'Tomato (raw)', grams: 100, scaleable: true },
      { name: 'Spinach (cooked)', grams: 50, scaleable: false },
      { name: 'Coconut Oil', grams: 14, scaleable: false },
    ],
    totalCalories: 603,
    totalProteins: 22.4,
    totalCarbs: 89.9,
    totalFats: 16.9,
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
    ingredients: [
      { name: 'Mackerel (cooked)', grams: 150, scaleable: true },
      { name: 'Sweet Potato (baked)', grams: 200, scaleable: true },
      { name: 'Asparagus (cooked)', grams: 150, scaleable: true },
      { name: 'Olive Oil', grams: 7, scaleable: false },
    ],
    totalCalories: 703,
    totalProteins: 42.5,
    totalCarbs: 58.4,
    totalFats: 31.4,
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
    ingredients: [
      { name: 'Milk (skim)', grams: 250, scaleable: true },
      { name: 'Banana', grams: 100, scaleable: true },
      { name: 'Peanut Butter', grams: 16, scaleable: true },
    ],
    totalCalories: 296,
    totalProteins: 13.4,
    totalCarbs: 39.8,
    totalFats: 8.5,
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
    ingredients: [
      { name: 'Greek Yogurt (nonfat, plain)', grams: 150, scaleable: true },
      { name: 'Honey', grams: 21, scaleable: true },
      { name: 'Almonds', grams: 14, scaleable: false },
    ],
    totalCalories: 229,
    totalProteins: 17.3,
    totalCarbs: 26.4,
    totalFats: 7.5,
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
    ingredients: [
      { name: 'Apple', grams: 150, scaleable: true },
      { name: 'Peanut Butter', grams: 16, scaleable: true },
    ],
    totalCalories: 172,
    totalProteins: 4.3,
    totalCarbs: 28.7,
    totalFats: 8.0,
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
    ingredients: [
      { name: 'Chickpeas (cooked)', grams: 100, scaleable: true },
      { name: 'Carrot (raw)', grams: 100, scaleable: true },
      { name: 'Cucumber (raw)', grams: 100, scaleable: true },
      { name: 'Olive Oil', grams: 7, scaleable: false },
    ],
    totalCalories: 257,
    totalProteins: 10.7,
    totalCarbs: 35.9,
    totalFats: 9.7,
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
    ingredients: [
      { name: 'Cottage Cheese (low fat)', grams: 150, scaleable: true },
      { name: 'Blueberries', grams: 50, scaleable: true },
      { name: 'Strawberries', grams: 50, scaleable: true },
    ],
    totalCalories: 156,
    totalProteins: 19.3,
    totalCarbs: 14.1,
    totalFats: 1.6,
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
    ingredients: [
      { name: 'Egg (whole, large)', grams: 100, scaleable: true },
      { name: 'Whole Wheat Bread', grams: 28, scaleable: true },
    ],
    totalCalories: 213,
    totalProteins: 15.9,
    totalCarbs: 12.0,
    totalFats: 10.8,
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
    ingredients: [
      { name: 'Almonds', grams: 28, scaleable: true },
      { name: 'Walnuts', grams: 14, scaleable: true },
      { name: 'Raisins', grams: 40, scaleable: false },
    ],
    totalCalories: 284,
    totalProteins: 8.2,
    totalCarbs: 32.4,
    totalFats: 16.4,
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
    ingredients: [
      { name: 'Edamame (cooked)', grams: 150, scaleable: true },
      { name: 'Soy Sauce', grams: 5, scaleable: false },
    ],
    totalCalories: 186,
    totalProteins: 18.3,
    totalCarbs: 13.8,
    totalFats: 7.8,
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
    ingredients: [
      { name: 'Banana', grams: 100, scaleable: true },
      { name: 'Peanut Butter', grams: 16, scaleable: true },
    ],
    totalCalories: 183,
    totalProteins: 4.9,
    totalCarbs: 26.8,
    totalFats: 8.3,
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
    ingredients: [
      { name: 'Tuna (canned in water)', grams: 100, scaleable: true },
      { name: 'Whole Wheat Bread', grams: 28, scaleable: true },
    ],
    totalCalories: 185,
    totalProteins: 28.6,
    totalCarbs: 11.6,
    totalFats: 2.0,
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

  // Pre-load all ingredients into a name→id map to avoid N+1 lookups
  const allIngredients = await prisma.ingredient.findMany({
    select: { id: true, name: true },
  });
  const ingredientMap = new Map<string, string>(
    allIngredients.map((ing) => [ing.name, ing.id]),
  );

  let seededCount = 0;

  for (const templateData of mealTemplates) {
    const templateId = templateData.name.toLowerCase().replace(/\s+/g, '-');

    // Upsert the template row (without ingredients)
    await prisma.mealTemplate.upsert({
      where: { id: templateId },
      update: {
        name: templateData.name,
        category: templateData.category,
        totalCalories: templateData.totalCalories,
        totalProteins: templateData.totalProteins,
        totalCarbs: templateData.totalCarbs,
        totalFats: templateData.totalFats,
        minScale: templateData.minScale,
        maxScale: templateData.maxScale,
        preparationTime: templateData.preparationTime ?? null,
        difficulty: templateData.difficulty,
        macroFocus: templateData.macroFocus,
        translations: templateData.translations ?? Prisma.JsonNull,
      },
      create: {
        id: templateId,
        name: templateData.name,
        category: templateData.category,
        totalCalories: templateData.totalCalories,
        totalProteins: templateData.totalProteins,
        totalCarbs: templateData.totalCarbs,
        totalFats: templateData.totalFats,
        minScale: templateData.minScale,
        maxScale: templateData.maxScale,
        preparationTime: templateData.preparationTime ?? null,
        difficulty: templateData.difficulty,
        macroFocus: templateData.macroFocus,
        translations: templateData.translations ?? Prisma.JsonNull,
      },
    });

    // Upsert each MealTemplateIngredient
    for (let i = 0; i < templateData.ingredients.length; i++) {
      const entry = templateData.ingredients[i];
      const ingredientId = ingredientMap.get(entry.name);

      if (!ingredientId) {
        console.warn(
          `  [WARN] Ingredient not found: "${entry.name}" (template: "${templateData.name}") — skipping`,
        );
        continue;
      }

      await prisma.mealTemplateIngredient.upsert({
        where: {
          templateId_ingredientId: {
            templateId,
            ingredientId,
          },
        },
        update: {
          grams: entry.grams,
          scaleable: entry.scaleable,
          sortOrder: entry.sortOrder ?? i,
        },
        create: {
          templateId,
          ingredientId,
          grams: entry.grams,
          scaleable: entry.scaleable,
          sortOrder: entry.sortOrder ?? i,
        },
      });
    }

    seededCount++;
  }

  console.log(`Seeded ${seededCount} meal templates successfully!`);
}

seedMealTemplates()
  .catch((e) => {
    console.error('Error seeding meal templates:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
