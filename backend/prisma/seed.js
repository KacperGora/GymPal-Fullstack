// Production-compatible seed runner
// Uses compiled Prisma client from dist/ instead of TypeScript sources
try { require('dotenv/config'); } catch {}
const { PrismaClient } = require('../dist/generated/prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');

const connectionString = process.env.DATABASE_URL;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Starting database seeding...');

  const ingredientCount = await prisma.ingredient.count();
  if (ingredientCount > 0) {
    console.log(`Skipping ingredients: ${ingredientCount} already exist`);
  } else {
    console.log('Seeding ingredients...');
    const ingredients = [
      { name: 'Chicken Breast (skinless, cooked)', servingSize: 100, servingUnit: 'g', calories: 165, proteins: 31, carbs: 0, fats: 3.6, fiber: 0, category: 'PROTEIN', verified: true, source: 'USDA' },
      { name: 'Salmon (cooked)', servingSize: 100, servingUnit: 'g', calories: 206, proteins: 22, carbs: 0, fats: 13, fiber: 0, category: 'PROTEIN', verified: true, source: 'USDA' },
      { name: 'Brown Rice (cooked)', servingSize: 100, servingUnit: 'g', calories: 111, proteins: 2.6, carbs: 23, fats: 0.9, fiber: 1.8, category: 'CARB', verified: true, source: 'USDA' },
      { name: 'Oats (dry)', servingSize: 100, servingUnit: 'g', calories: 389, proteins: 17, carbs: 66, fats: 6.9, fiber: 10.6, category: 'CARB', verified: true, source: 'USDA' },
      { name: 'Banana', servingSize: 100, servingUnit: 'g', calories: 89, proteins: 1.1, carbs: 23, fats: 0.3, fiber: 2.6, category: 'FRUIT', verified: true, source: 'USDA' },
      { name: 'Broccoli (cooked)', servingSize: 100, servingUnit: 'g', calories: 34, proteins: 2.8, carbs: 7, fats: 0.4, fiber: 2.4, category: 'VEGETABLE', verified: true, source: 'USDA' },
      { name: 'Greek Yogurt (plain)', servingSize: 100, servingUnit: 'g', calories: 59, proteins: 10, carbs: 3.3, fats: 0.4, fiber: 0, category: 'DAIRY', verified: true, source: 'USDA' },
      { name: 'Olive Oil', servingSize: 100, servingUnit: 'ml', calories: 884, proteins: 0, carbs: 0, fats: 100, fiber: 0, category: 'FAT', verified: true, source: 'USDA' },
    ];
    const created = await prisma.ingredient.createMany({ data: ingredients, skipDuplicates: true });
    console.log(`Seeded ${created.count} ingredients`);
  }

  const templateCount = await prisma.mealTemplate.count();
  if (templateCount > 0) {
    console.log(`Skipping templates: ${templateCount} already exist`);
  } else {
    console.log('Seeding meal templates...');
    const templates = [
      { name: 'Oatmeal with Banana', category: 'BREAKFAST', baseRecipe: [], totalCalories: 350, totalProteins: 10, totalCarbs: 65, totalFats: 5, scaleableIngredients: [], minScale: 0.7, maxScale: 1.3, preparationTime: 10, difficulty: 'EASY', macroFocus: 'CARB', translations: {} },
      { name: 'Grilled Chicken with Brown Rice', category: 'LUNCH', baseRecipe: [], totalCalories: 500, totalProteins: 40, totalCarbs: 45, totalFats: 10, scaleableIngredients: [], minScale: 0.7, maxScale: 1.3, preparationTime: 30, difficulty: 'MEDIUM', macroFocus: 'PROTEIN', translations: {} },
      { name: 'Salmon with Vegetables', category: 'DINNER', baseRecipe: [], totalCalories: 480, totalProteins: 35, totalCarbs: 30, totalFats: 20, scaleableIngredients: [], minScale: 0.7, maxScale: 1.3, preparationTime: 25, difficulty: 'MEDIUM', macroFocus: 'PROTEIN', translations: {} },
      { name: 'Greek Yogurt Bowl', category: 'SNACK', baseRecipe: [], totalCalories: 220, totalProteins: 15, totalCarbs: 30, totalFats: 2, scaleableIngredients: [], minScale: 0.7, maxScale: 1.3, preparationTime: 5, difficulty: 'EASY', macroFocus: 'PROTEIN', translations: {} },
    ];
    const created = await prisma.mealTemplate.createMany({ data: templates, skipDuplicates: true });
    console.log(`Seeded ${created.count} templates`);
  }

  console.log('Database seeding completed!');
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error('Seed error:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
