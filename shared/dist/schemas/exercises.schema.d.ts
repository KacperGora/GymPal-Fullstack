import { z } from "zod";
export declare const wgerExerciseSchema: z.ZodObject<{
    id: z.ZodNumber;
    name: z.ZodString;
    description: z.ZodString;
    category: z.ZodString;
    categoryId: z.ZodNumber;
    muscles: z.ZodArray<z.ZodString>;
    musclesSecondary: z.ZodArray<z.ZodString>;
    equipment: z.ZodArray<z.ZodString>;
    images: z.ZodArray<z.ZodString>;
}, z.core.$strip>;
export type WgerExercise = z.infer<typeof wgerExerciseSchema>;
export declare const wgerCategorySchema: z.ZodObject<{
    id: z.ZodNumber;
    name: z.ZodString;
}, z.core.$strip>;
export type WgerCategory = z.infer<typeof wgerCategorySchema>;
export declare const wgerMuscleSchema: z.ZodObject<{
    id: z.ZodNumber;
    name: z.ZodString;
    nameEn: z.ZodString;
    isFront: z.ZodBoolean;
}, z.core.$strip>;
export type WgerMuscle = z.infer<typeof wgerMuscleSchema>;
export declare const wgerEquipmentSchema: z.ZodObject<{
    id: z.ZodNumber;
    name: z.ZodString;
}, z.core.$strip>;
export type WgerEquipment = z.infer<typeof wgerEquipmentSchema>;
export declare const wgerPaginatedSchema: z.ZodObject<{
    count: z.ZodNumber;
    next: z.ZodNullable<z.ZodString>;
    previous: z.ZodNullable<z.ZodString>;
    results: z.ZodArray<z.ZodObject<{
        id: z.ZodNumber;
        name: z.ZodString;
        description: z.ZodString;
        category: z.ZodString;
        categoryId: z.ZodNumber;
        muscles: z.ZodArray<z.ZodString>;
        musclesSecondary: z.ZodArray<z.ZodString>;
        equipment: z.ZodArray<z.ZodString>;
        images: z.ZodArray<z.ZodString>;
    }, z.core.$strip>>;
}, z.core.$strip>;
export type WgerPaginated = z.infer<typeof wgerPaginatedSchema>;
export declare const createFavoriteExerciseSchema: z.ZodObject<{
    wgerExerciseId: z.ZodNumber;
    name: z.ZodString;
    category: z.ZodString;
    muscles: z.ZodString;
    equipment: z.ZodString;
    imageUrl: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type CreateFavoriteExerciseDto = z.infer<typeof createFavoriteExerciseSchema>;
