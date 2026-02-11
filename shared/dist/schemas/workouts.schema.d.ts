import { z } from "zod";
export declare const exerciseCategoryEnum: z.ZodEnum<{
    STRENGTH: "STRENGTH";
    CARDIO: "CARDIO";
    FLEXIBILITY: "FLEXIBILITY";
    HIIT: "HIIT";
}>;
export declare const exerciseSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    category: z.ZodEnum<{
        STRENGTH: "STRENGTH";
        CARDIO: "CARDIO";
        FLEXIBILITY: "FLEXIBILITY";
        HIIT: "HIIT";
    }>;
    muscleGroup: z.ZodString;
    equipment: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type ExerciseDto = z.infer<typeof exerciseSchema>;
export declare const createWorkoutExerciseSchema: z.ZodObject<{
    wgerExerciseId: z.ZodNumber;
    exerciseName: z.ZodString;
    exerciseCategory: z.ZodOptional<z.ZodString>;
    sets: z.ZodNumber;
    reps: z.ZodNumber;
    weight: z.ZodNumber;
    restTime: z.ZodNumber;
    notes: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const updateWorkoutExerciseSchema: z.ZodObject<{
    wgerExerciseId: z.ZodOptional<z.ZodNumber>;
    exerciseName: z.ZodOptional<z.ZodString>;
    exerciseCategory: z.ZodOptional<z.ZodString>;
    sets: z.ZodOptional<z.ZodNumber>;
    reps: z.ZodOptional<z.ZodNumber>;
    weight: z.ZodOptional<z.ZodNumber>;
    restTime: z.ZodOptional<z.ZodNumber>;
    notes: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type CreateWorkoutExerciseDto = z.infer<typeof createWorkoutExerciseSchema>;
export type UpdateWorkoutExerciseDto = z.infer<typeof updateWorkoutExerciseSchema>;
export declare const createWorkoutSessionSchema: z.ZodObject<{
    name: z.ZodString;
    date: z.ZodOptional<z.ZodString>;
    duration: z.ZodNumber;
    caloriesBurned: z.ZodNumber;
    notes: z.ZodOptional<z.ZodString>;
    exercises: z.ZodOptional<z.ZodArray<z.ZodObject<{
        wgerExerciseId: z.ZodNumber;
        exerciseName: z.ZodString;
        exerciseCategory: z.ZodOptional<z.ZodString>;
        sets: z.ZodNumber;
        reps: z.ZodNumber;
        weight: z.ZodNumber;
        restTime: z.ZodNumber;
        notes: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>>;
}, z.core.$strip>;
export declare const updateWorkoutSessionSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    date: z.ZodOptional<z.ZodString>;
    duration: z.ZodOptional<z.ZodNumber>;
    caloriesBurned: z.ZodOptional<z.ZodNumber>;
    notes: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type CreateWorkoutSessionDto = z.infer<typeof createWorkoutSessionSchema>;
export type UpdateWorkoutSessionDto = z.infer<typeof updateWorkoutSessionSchema>;
export declare const workoutQuerySchema: z.ZodObject<{
    startDate: z.ZodOptional<z.ZodString>;
    endDate: z.ZodOptional<z.ZodString>;
    limit: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
}, z.core.$strip>;
export type WorkoutQueryDto = z.infer<typeof workoutQuerySchema>;
