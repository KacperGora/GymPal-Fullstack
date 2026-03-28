import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';

const hashPassword = (pass: string) => bcrypt.hash(pass, 10);

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

    // Seed users (RBAC roles)
    console.log('👤 Seeding users...');
    await seedUsers(prisma);
    console.log('✅ Seeded users');

    // Seed demo user
    console.log('👤 Seeding demo user...');
    await seedDemoUser(prisma);
    console.log('✅ Seeded demo user');

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
async function seedUsers(prisma: PrismaClient): Promise<void> {
  const usersToSeed = [
    {
      email: 'admin@gympal.app',
      firstName: 'Admin',
      password: await hashPassword('Admin123!'),
      lastName: 'GymPal',
      role: 'ADMIN' as const,
    },
    {
      email: 'trainer@gympal.app',
      password: await hashPassword('Trainer123!'),
      firstName: 'John',
      lastName: 'Coach',
      role: 'TRAINER' as const,
    },
    {
      email: 'client1@gympal.app',
      password: await hashPassword('Client123!'),
      firstName: 'Alice',
      lastName: 'Strong',
      role: 'CLIENT' as const,
    },
    {
      email: 'client2@gympal.app',
      password: await hashPassword('Client123!'),
      firstName: 'Bob',
      lastName: 'Fit',
      role: 'CLIENT' as const,
    },
    {
      email: 'client3@gympal.app',
      password: await hashPassword('Client123!'),
      firstName: 'Charlie',
      lastName: 'Gains',
      role: 'CLIENT' as const,
    },
  ];

  const upserted = await Promise.all(
    usersToSeed.map((data) =>
      prisma.user.upsert({
        where: { email: data.email },
        update: { password: data.password, role: data.role },
        create: data,
      }),
    ),
  );

  console.log(`   Upserted ${upserted.length} users`);

  const trainer = upserted.find((u) => u.email === 'trainer@gympal.app')!;
  const clients = upserted.filter((u) => u.role === 'CLIENT');

  await Promise.all(
    clients.map((client) =>
      prisma.trainerClient.upsert({
        where: {
          trainerId_clientId: { trainerId: trainer.id, clientId: client.id },
        },
        update: {},
        create: {
          trainerId: trainer.id,
          clientId: client.id,
          status: 'ACTIVE',
          acceptedAt: new Date(),
        },
      }),
    ),
  );
}

async function seedIngredients(prisma: PrismaClient): Promise<number> {
  const existingCount = await prisma.ingredient.count();
  if (existingCount > 0) {
    console.log(`   Skipping: ${existingCount} ingredients already exist`);
    return 0;
  }

  const ingredients = [
    {
      name: 'Chicken Breast (skinless, cooked)',
      servingSize: 100,
      servingUnit: 'g',
      calories: 165,
      proteins: 31,
      carbs: 0,
      fats: 3.6,
      fiber: 0,
      category: 'PROTEIN',
      verified: true,
      source: 'USDA',
    },
    {
      name: 'Salmon (cooked)',
      servingSize: 100,
      servingUnit: 'g',
      calories: 206,
      proteins: 22,
      carbs: 0,
      fats: 13,
      fiber: 0,
      category: 'PROTEIN',
      verified: true,
      source: 'USDA',
    },
    {
      name: 'Brown Rice (cooked)',
      servingSize: 100,
      servingUnit: 'g',
      calories: 111,
      proteins: 2.6,
      carbs: 23,
      fats: 0.9,
      fiber: 1.8,
      category: 'CARBS',
      verified: true,
      source: 'USDA',
    },
    {
      name: 'Oats (dry)',
      servingSize: 100,
      servingUnit: 'g',
      calories: 389,
      proteins: 17,
      carbs: 66,
      fats: 6.9,
      fiber: 10.6,
      category: 'CARBS',
      verified: true,
      source: 'USDA',
    },
    {
      name: 'Banana',
      servingSize: 100,
      servingUnit: 'g',
      calories: 89,
      proteins: 1.1,
      carbs: 23,
      fats: 0.3,
      fiber: 2.6,
      category: 'FRUITS',
      verified: true,
      source: 'USDA',
    },
    {
      name: 'Broccoli (cooked)',
      servingSize: 100,
      servingUnit: 'g',
      calories: 34,
      proteins: 2.8,
      carbs: 7,
      fats: 0.4,
      fiber: 2.4,
      category: 'VEGETABLES',
      verified: true,
      source: 'USDA',
    },
    {
      name: 'Greek Yogurt (plain)',
      servingSize: 100,
      servingUnit: 'g',
      calories: 59,
      proteins: 10,
      carbs: 3.3,
      fats: 0.4,
      fiber: 0,
      category: 'DAIRY',
      verified: true,
      source: 'USDA',
    },
    {
      name: 'Olive Oil',
      servingSize: 100,
      servingUnit: 'ml',
      calories: 884,
      proteins: 0,
      carbs: 0,
      fats: 100,
      fiber: 0,
      category: 'FATS_OILS',
      verified: true,
      source: 'USDA',
    },
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
    {
      name: 'Oatmeal with Banana',
      category: 'BREAKFAST',
      totalCalories: 350,
      totalProteins: 10,
      totalCarbs: 65,
      totalFats: 5,
      minScale: 0.7,
      maxScale: 1.3,
      preparationTime: 10,
      difficulty: 'EASY',
      macroFocus: 'HIGH_CARB',
    },
    {
      name: 'Grilled Chicken with Brown Rice',
      category: 'LUNCH',
      totalCalories: 500,
      totalProteins: 40,
      totalCarbs: 45,
      totalFats: 10,
      minScale: 0.7,
      maxScale: 1.3,
      preparationTime: 30,
      difficulty: 'MEDIUM',
      macroFocus: 'HIGH_PROTEIN',
    },
    {
      name: 'Salmon with Vegetables',
      category: 'DINNER',
      totalCalories: 480,
      totalProteins: 35,
      totalCarbs: 30,
      totalFats: 20,
      minScale: 0.7,
      maxScale: 1.3,
      preparationTime: 25,
      difficulty: 'MEDIUM',
      macroFocus: 'HIGH_PROTEIN',
    },
    {
      name: 'Greek Yogurt Bowl',
      category: 'SNACK',
      totalCalories: 220,
      totalProteins: 15,
      totalCarbs: 30,
      totalFats: 2,
      minScale: 0.7,
      maxScale: 1.3,
      preparationTime: 5,
      difficulty: 'EASY',
      macroFocus: 'HIGH_PROTEIN',
    },
  ];

  const created = await prisma.mealTemplate.createMany({
    data: templates as any,
    skipDuplicates: true,
  });

  return created.count;
}

async function seedDemoUser(prisma: PrismaClient): Promise<void> {
  const DEMO_EMAIL = 'demo@gympal.app';

  const existing = await prisma.user.findUnique({ where: { email: DEMO_EMAIL } });
  if (existing) {
    console.log('   Skipping: demo user already exists');
    return;
  }

  const hashedPassword = await bcrypt.hash('Demo123!', 10);

  const user = await prisma.user.create({
    data: {
      email: DEMO_EMAIL,
      password: hashedPassword,
      firstName: 'Alex',
      lastName: 'Demo',
    },
  });

  console.log('   Created demo user id=' + user.id);

  // UserProfile
  await prisma.userProfile.create({
    data: {
      userId: user.id,
      height: 178,
      weight: 78,
      age: 28,
      activity: 1.55,
      goal: 'gain',
    },
  });

  // 30 days of meals
  const now = new Date();
  const mealData: {
    userId: number;
    name: string;
    calories: number;
    proteins: number;
    carbs: number;
    fats: number;
    category: string;
    date: Date;
  }[] = [];

  for (let i = 29; i >= 0; i--) {
    const dayBase = new Date(now);
    dayBase.setUTCDate(dayBase.getUTCDate() - i);

    const breakfast = new Date(dayBase);
    breakfast.setUTCHours(7, 0, 0, 0);

    const lunch = new Date(dayBase);
    lunch.setUTCHours(12, 30, 0, 0);

    const dinner = new Date(dayBase);
    dinner.setUTCHours(19, 0, 0, 0);

    const snack = new Date(dayBase);
    snack.setUTCHours(15, 30, 0, 0);

    mealData.push(
      { userId: user.id, name: 'Owsianka z bananem', calories: 350, proteins: 10, carbs: 65, fats: 5, category: 'BREAKFAST', date: breakfast },
      { userId: user.id, name: 'Kurczak z ryżem', calories: 500, proteins: 40, carbs: 45, fats: 10, category: 'LUNCH', date: lunch },
      { userId: user.id, name: 'Łosoś z warzywami', calories: 480, proteins: 35, carbs: 30, fats: 20, category: 'DINNER', date: dinner },
      { userId: user.id, name: 'Jogurt grecki', calories: 220, proteins: 15, carbs: 30, fats: 2, category: 'SNACK', date: snack },
    );
  }

  await prisma.meal.createMany({ data: mealData as any });
  console.log('   Created ' + mealData.length + ' meals');

  // 15 workout sessions over 30 days (every 2 days starting from daysAgo=1)
  const workoutTemplates = [
    {
      name: 'Push — Klatka & Barki',
      duration: 65,
      caloriesBurned: 420,
      exercises: [
        { wgerExerciseId: 192, exerciseName: 'Bench Press', sets: 4, reps: 8, weight: 80, restTime: 120 },
        { wgerExerciseId: 122, exerciseName: 'Overhead Press', sets: 4, reps: 8, weight: 55, restTime: 120 },
        { wgerExerciseId: 426, exerciseName: 'Incline Dumbbell Press', sets: 3, reps: 10, weight: 30, restTime: 90 },
        { wgerExerciseId: 85, exerciseName: 'Lateral Raises', sets: 3, reps: 15, weight: 12, restTime: 60 },
        { wgerExerciseId: 291, exerciseName: 'Tricep Pushdown', sets: 3, reps: 12, weight: 35, restTime: 60 },
      ],
    },
    {
      name: 'Pull — Plecy & Biceps',
      duration: 60,
      caloriesBurned: 380,
      exercises: [
        { wgerExerciseId: 63, exerciseName: 'Pull-Up', sets: 4, reps: 8, weight: 0, restTime: 120 },
        { wgerExerciseId: 313, exerciseName: 'Barbell Row', sets: 4, reps: 8, weight: 70, restTime: 120 },
        { wgerExerciseId: 120, exerciseName: 'Seated Cable Row', sets: 3, reps: 12, weight: 60, restTime: 90 },
        { wgerExerciseId: 72, exerciseName: 'Barbell Curl', sets: 3, reps: 10, weight: 35, restTime: 60 },
        { wgerExerciseId: 76, exerciseName: 'Hammer Curl', sets: 3, reps: 12, weight: 16, restTime: 60 },
      ],
    },
    {
      name: 'Nogi & Brzuch',
      duration: 75,
      caloriesBurned: 510,
      exercises: [
        { wgerExerciseId: 111, exerciseName: 'Squat', sets: 4, reps: 8, weight: 100, restTime: 150 },
        { wgerExerciseId: 222, exerciseName: 'Romanian Deadlift', sets: 4, reps: 10, weight: 80, restTime: 120 },
        { wgerExerciseId: 99, exerciseName: 'Leg Press', sets: 3, reps: 12, weight: 140, restTime: 90 },
        { wgerExerciseId: 137, exerciseName: 'Leg Curl', sets: 3, reps: 12, weight: 50, restTime: 60 },
        { wgerExerciseId: 11, exerciseName: 'Plank', sets: 3, reps: 60, weight: 0, restTime: 60 },
      ],
    },
    {
      name: 'Full Body',
      duration: 70,
      caloriesBurned: 480,
      exercises: [
        { wgerExerciseId: 111, exerciseName: 'Deadlift', sets: 4, reps: 6, weight: 110, restTime: 150 },
        { wgerExerciseId: 192, exerciseName: 'Bench Press', sets: 3, reps: 10, weight: 75, restTime: 120 },
        { wgerExerciseId: 63, exerciseName: 'Pull-Up', sets: 3, reps: 8, weight: 0, restTime: 90 },
        { wgerExerciseId: 122, exerciseName: 'Overhead Press', sets: 3, reps: 10, weight: 50, restTime: 90 },
      ],
    },
    {
      name: 'Cardio HIIT',
      duration: 40,
      caloriesBurned: 350,
      exercises: [
        { wgerExerciseId: 167, exerciseName: 'Jumping Jacks', sets: 4, reps: 30, weight: 0, restTime: 30 },
        { wgerExerciseId: 203, exerciseName: 'Burpees', sets: 4, reps: 12, weight: 0, restTime: 45 },
        { wgerExerciseId: 211, exerciseName: 'Mountain Climbers', sets: 4, reps: 20, weight: 0, restTime: 30 },
        { wgerExerciseId: 157, exerciseName: 'Box Jumps', sets: 3, reps: 10, weight: 0, restTime: 45 },
      ],
    },
  ];

  for (let sessionIdx = 0; sessionIdx < 15; sessionIdx++) {
    const daysAgo = 1 + sessionIdx * 2;
    const sessionDate = new Date(now);
    sessionDate.setUTCDate(sessionDate.getUTCDate() - daysAgo);
    sessionDate.setUTCHours(18, 0, 0, 0);

    const template = workoutTemplates[sessionIdx % workoutTemplates.length];

    const session = await prisma.workoutSession.create({
      data: {
        userId: user.id,
        name: template.name,
        date: sessionDate,
        duration: template.duration,
        caloriesBurned: template.caloriesBurned,
        notes: null,
      },
    });

    await prisma.workoutExercise.createMany({
      data: template.exercises.map((ex) => ({
        workoutSessionId: session.id,
        wgerExerciseId: ex.wgerExerciseId,
        exerciseName: ex.exerciseName,
        sets: ex.sets,
        reps: ex.reps,
        weight: ex.weight,
        restTime: ex.restTime,
      })),
    });
  }

  console.log('   Created 15 workout sessions with exercises');

  // 30 days of WaterIntake
  const waterData: { userId: number; date: Date; glasses: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const day = new Date(now);
    day.setUTCDate(day.getUTCDate() - i);
    day.setUTCHours(0, 0, 0, 0);
    waterData.push({ userId: user.id, date: day, glasses: (i % 3) + 6 });
  }
  await prisma.waterIntake.createMany({ data: waterData, skipDuplicates: true });
  console.log('   Created ' + waterData.length + ' water intake records');

  // 30 days of DailyStat
  const statData: { userId: number; date: Date; calories: number; fats: number; proteins: number; carbs: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const day = new Date(now);
    day.setUTCDate(day.getUTCDate() - i);
    day.setUTCHours(0, 0, 0, 0);
    statData.push({ userId: user.id, date: day, calories: 1550, fats: 37, proteins: 100, carbs: 170 });
  }
  await prisma.dailyStat.createMany({ data: statData, skipDuplicates: true });
  console.log('   Created ' + statData.length + ' daily stat records');

  // Active subscription
  const plan = await prisma.plan.findFirst();
  if (plan) {
    const periodEnd = new Date(now);
    periodEnd.setFullYear(periodEnd.getFullYear() + 1);

    await prisma.subscription.create({
      data: {
        userId: user.id,
        planId: plan.id,
        stripeCustomerId: 'cus_demo_gympal_001',
        stripeSubscriptionId: 'sub_demo_gympal_001',
        status: 'ACTIVE',
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
        cancelAtPeriodEnd: false,
      },
    });
    console.log('   Created active subscription for demo user');
  } else {
    console.log('   Warning: no plan found, skipping subscription');
  }
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
