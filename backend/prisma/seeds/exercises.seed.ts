import { PrismaClient, ExerciseCategory } from '../../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = process.env.DATABASE_URL;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const exercises = [
  {
    name: 'Barbell Bench Press',
    category: ExerciseCategory.STRENGTH,
    muscleGroup: 'Chest',
    equipment: 'Barbell',
    description: 'Classic chest exercise for building upper body strength',
  },
  {
    name: 'Barbell Squat',
    category: ExerciseCategory.STRENGTH,
    muscleGroup: 'Legs',
    equipment: 'Barbell',
    description: 'Compound lower body exercise',
  },
  {
    name: 'Deadlift',
    category: ExerciseCategory.STRENGTH,
    muscleGroup: 'Back',
    equipment: 'Barbell',
    description: 'Full body compound exercise',
  },
  {
    name: 'Overhead Press',
    category: ExerciseCategory.STRENGTH,
    muscleGroup: 'Shoulders',
    equipment: 'Barbell',
    description: 'Shoulder and tricep builder',
  },
  {
    name: 'Barbell Row',
    category: ExerciseCategory.STRENGTH,
    muscleGroup: 'Back',
    equipment: 'Barbell',
    description: 'Back thickness and strength',
  },
  {
    name: 'Dumbbell Curl',
    category: ExerciseCategory.STRENGTH,
    muscleGroup: 'Biceps',
    equipment: 'Dumbbells',
    description: 'Bicep isolation exercise',
  },
  {
    name: 'Tricep Dips',
    category: ExerciseCategory.STRENGTH,
    muscleGroup: 'Triceps',
    equipment: 'Bodyweight',
    description: 'Tricep and chest exercise',
  },
  {
    name: 'Pull-ups',
    category: ExerciseCategory.STRENGTH,
    muscleGroup: 'Back',
    equipment: 'Pull-up Bar',
    description: 'Upper body pulling exercise',
  },
  {
    name: 'Leg Press',
    category: ExerciseCategory.STRENGTH,
    muscleGroup: 'Legs',
    equipment: 'Machine',
    description: 'Quadriceps and glute development',
  },
  {
    name: 'Lat Pulldown',
    category: ExerciseCategory.STRENGTH,
    muscleGroup: 'Back',
    equipment: 'Cable Machine',
    description: 'Back width and lat development',
  },

  // Cardio Exercises
  {
    name: 'Running',
    category: ExerciseCategory.CARDIO,
    muscleGroup: 'Full Body',
    equipment: 'None',
    description: 'Cardiovascular endurance',
  },
  {
    name: 'Cycling',
    category: ExerciseCategory.CARDIO,
    muscleGroup: 'Legs',
    equipment: 'Bike',
    description: 'Low-impact cardio',
  },
  {
    name: 'Rowing',
    category: ExerciseCategory.CARDIO,
    muscleGroup: 'Full Body',
    equipment: 'Rowing Machine',
    description: 'Full body cardio workout',
  },
  {
    name: 'Jump Rope',
    category: ExerciseCategory.CARDIO,
    muscleGroup: 'Full Body',
    equipment: 'Jump Rope',
    description: 'High-intensity cardio',
  },
  {
    name: 'Elliptical',
    category: ExerciseCategory.CARDIO,
    muscleGroup: 'Full Body',
    equipment: 'Elliptical Machine',
    description: 'Low-impact cardiovascular exercise',
  },

  // HIIT Exercises
  {
    name: 'Burpees',
    category: ExerciseCategory.HIIT,
    muscleGroup: 'Full Body',
    equipment: 'Bodyweight',
    description: 'High-intensity full body exercise',
  },
  {
    name: 'Mountain Climbers',
    category: ExerciseCategory.HIIT,
    muscleGroup: 'Core',
    equipment: 'Bodyweight',
    description: 'Core and cardio combination',
  },
  {
    name: 'Box Jumps',
    category: ExerciseCategory.HIIT,
    muscleGroup: 'Legs',
    equipment: 'Plyo Box',
    description: 'Explosive leg power',
  },
  {
    name: 'Battle Ropes',
    category: ExerciseCategory.HIIT,
    muscleGroup: 'Full Body',
    equipment: 'Battle Ropes',
    description: 'High-intensity upper body and core',
  },
  {
    name: 'Kettlebell Swings',
    category: ExerciseCategory.HIIT,
    muscleGroup: 'Full Body',
    equipment: 'Kettlebell',
    description: 'Explosive hip power and conditioning',
  },

  // Flexibility Exercises
  {
    name: 'Yoga Flow',
    category: ExerciseCategory.FLEXIBILITY,
    muscleGroup: 'Full Body',
    equipment: 'Yoga Mat',
    description: 'Flexibility and mobility',
  },
  {
    name: 'Stretching Routine',
    category: ExerciseCategory.FLEXIBILITY,
    muscleGroup: 'Full Body',
    equipment: 'None',
    description: 'General flexibility work',
  },
  {
    name: 'Foam Rolling',
    category: ExerciseCategory.FLEXIBILITY,
    muscleGroup: 'Full Body',
    equipment: 'Foam Roller',
    description: 'Myofascial release and recovery',
  },
];

async function seedExercises() {
  console.log('Seeding exercises...');

  for (const exercise of exercises) {
    await prisma.exercise.upsert({
      where: { name: exercise.name },
      update: exercise,
      create: exercise,
    });
  }

  console.log(`Seeded ${exercises.length} exercises successfully!`);
}

seedExercises()
  .catch((e) => {
    console.error('Error seeding exercises:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
