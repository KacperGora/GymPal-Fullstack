import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Starting database seeding...');

  try {
    // Seed plans
    console.log('💳 Seeding plans...');
    await seedPlans(prisma);
    console.log('✅ Seeded plans');

    // Seed ingredients
    console.log('📦 Seeding ingredients...');
    const ingredientCount = await seedIngredients(prisma);
    console.log(`✅ Seeded ${ingredientCount} ingredients`);

    // Seed meal templates
    console.log('🍽️  Seeding meal templates...');
    const templateCount = await seedMealTemplates(prisma);
    console.log(`✅ Seeded ${templateCount} meal templates`);

    console.log('✨ Database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    throw error;
  }
}

async function seedPlans(prisma: PrismaClient): Promise<void> {
  const existing = await prisma.plan.count();
  if (existing > 0) {
    console.log(`   Skipping: ${existing} plans already exist`);
    return;
  }

  const pro = await prisma.plan.create({
    data: {
      name: 'Pro',
      stripePriceId: 'price_1TBzqP4d6DwnhKO48sR9IcIa',
      price: 999,
      currency: 'pln',
      interval: 'month',
    },
  });

  await prisma.usageLimit.create({
    data: {
      planId: pro.id,
      feature: 'AI_MEAL_SUGGESTIONS',
      dailyLimit: 100,
    },
  });
}

async function seedIngredients(prisma: PrismaClient): Promise<number> {
  const existingCount = await prisma.ingredient.count();
  if (existingCount > 0) {
    console.log(`   Skipping: ${existingCount} ingredients already exist`);
    return 0;
  }

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

  const created = await prisma.ingredient.createMany({
    data: ingredients as any,
    skipDuplicates: true,
  });

  return created.count;
}

async function seedMealTemplates(prisma: PrismaClient): Promise<number> {
  const existingCount = await prisma.mealTemplate.count();
  if (existingCount > 0) {
    console.log(`   Skipping: ${existingCount} templates already exist`);
    return 0;
  }

  const templates = [
    { name: 'Oatmeal with Banana', category: 'BREAKFAST', baseRecipe: JSON.stringify([]), totalCalories: 350, totalProteins: 10, totalCarbs: 65, totalFats: 5, scaleableIngredients: [], minScale: 0.7, maxScale: 1.3, preparationTime: 10, difficulty: 'EASY', macroFocus: 'CARB', translations: '{}' },
    { name: 'Grilled Chicken with Brown Rice', category: 'LUNCH', baseRecipe: JSON.stringify([]), totalCalories: 500, totalProteins: 40, totalCarbs: 45, totalFats: 10, scaleableIngredients: [], minScale: 0.7, maxScale: 1.3, preparationTime: 30, difficulty: 'MEDIUM', macroFocus: 'PROTEIN', translations: '{}' },
    { name: 'Salmon with Vegetables', category: 'DINNER', baseRecipe: JSON.stringify([]), totalCalories: 480, totalProteins: 35, totalCarbs: 30, totalFats: 20, scaleableIngredients: [], minScale: 0.7, maxScale: 1.3, preparationTime: 25, difficulty: 'MEDIUM', macroFocus: 'PROTEIN', translations: '{}' },
    { name: 'Greek Yogurt Bowl', category: 'SNACK', baseRecipe: JSON.stringify([]), totalCalories: 220, totalProteins: 15, totalCarbs: 30, totalFats: 2, scaleableIngredients: [], minScale: 0.7, maxScale: 1.3, preparationTime: 5, difficulty: 'EASY', macroFocus: 'PROTEIN', translations: '{}' },
  ];

  const created = await prisma.mealTemplate.createMany({
    data: templates as any,
    skipDuplicates: true,
  });

  return created.count;
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
