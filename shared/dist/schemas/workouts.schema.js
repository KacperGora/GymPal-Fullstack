import { z } from "zod";
// Exercise Category Enum
export const exerciseCategoryEnum = z.enum([
    "STRENGTH",
    "CARDIO",
    "FLEXIBILITY",
    "HIIT",
]);
// Exercise Schema (read-only)
export const exerciseSchema = z.object({
    id: z.string(),
    name: z.string(),
    category: exerciseCategoryEnum,
    muscleGroup: z.string(),
    equipment: z.string(),
    description: z.string().optional(),
});
// WorkoutExercise Schemas
export const createWorkoutExerciseSchema = z.object({
    wgerExerciseId: z.number().int().positive("Exercise ID is required"),
    exerciseName: z.string().min(1, "Exercise name is required"),
    exerciseCategory: z.string().optional(),
    sets: z.number().int().positive("Sets must be positive"),
    reps: z.number().int().positive("Reps must be positive"),
    weight: z.number().nonnegative("Weight must be non-negative"),
    restTime: z.number().int().nonnegative("Rest time must be non-negative"),
    notes: z.string().optional(),
});
export const updateWorkoutExerciseSchema = z.object({
    wgerExerciseId: z.number().int().positive().optional(),
    exerciseName: z.string().min(1).optional(),
    exerciseCategory: z.string().optional(),
    sets: z.number().int().positive().optional(),
    reps: z.number().int().positive().optional(),
    weight: z.number().nonnegative().optional(),
    restTime: z.number().int().nonnegative().optional(),
    notes: z.string().optional(),
});
// WorkoutSession Schemas
export const createWorkoutSessionSchema = z.object({
    name: z.string().min(1, "Workout name is required"),
    date: z.string().datetime().optional(),
    duration: z.number().int().positive("Duration must be positive"),
    caloriesBurned: z.number().nonnegative("Calories must be non-negative"),
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
// Query Schema
export const workoutQuerySchema = z.object({
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    limit: z.coerce.number().int().positive().max(100).optional(),
    page: z.coerce.number().int().min(1).optional(),
});
