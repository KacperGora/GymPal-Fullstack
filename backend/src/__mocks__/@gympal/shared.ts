import { z } from 'zod';

// Re-export schemas without ESM syntax issues
export const exerciseCategoryEnum = z.enum([
  'STRENGTH',
  'CARDIO',
  'FLEXIBILITY',
  'HIIT',
]);

export const createWorkoutExerciseSchema = z.object({
  exerciseId: z.string().min(1, 'Exercise ID is required'),
  sets: z.number().int().positive('Sets must be positive'),
  reps: z.number().int().positive('Reps must be positive'),
  weight: z.number().nonnegative('Weight must be non-negative'),
  restTime: z.number().int().nonnegative('Rest time must be non-negative'),
  notes: z.string().optional(),
});

export const updateWorkoutExerciseSchema = z.object({
  exerciseId: z.string().min(1).optional(),
  sets: z.number().int().positive().optional(),
  reps: z.number().int().positive().optional(),
  weight: z.number().nonnegative().optional(),
  restTime: z.number().int().nonnegative().optional(),
  notes: z.string().optional(),
});

export const createWorkoutSessionSchema = z.object({
  name: z.string().min(1, 'Workout name is required'),
  date: z.string().datetime().optional(),
  duration: z.number().int().positive('Duration must be positive'),
  caloriesBurned: z.number().nonnegative('Calories must be non-negative'),
  notes: z.string().optional(),
  exercises: z.array(createWorkoutExerciseSchema).optional(),
});

export const updateWorkoutSessionSchema = z.object({
  name: z.string().min(1).optional(),
  date: z.string().datetime().optional(),
  duration: z.number().int().positive().optional(),
  caloriesBurned: z.number().nonnegative().optional(),
  notes: z.string().optional(),
});

export const workoutQuerySchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  limit: z.number().int().positive().optional(),
});

// Export types
export type CreateWorkoutExerciseDto = z.infer<
  typeof createWorkoutExerciseSchema
>;
export type UpdateWorkoutExerciseDto = z.infer<
  typeof updateWorkoutExerciseSchema
>;
export type CreateWorkoutSessionDto = z.infer<
  typeof createWorkoutSessionSchema
>;
export type UpdateWorkoutSessionDto = z.infer<
  typeof updateWorkoutSessionSchema
>;
export type WorkoutQueryDto = z.infer<typeof workoutQuerySchema>;
