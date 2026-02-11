import { z } from "zod";
export declare const mealCategoryEnum: z.ZodEnum<{
    BREAKFAST: "BREAKFAST";
    LUNCH: "LUNCH";
    DINNER: "DINNER";
    SNACK: "SNACK";
}>;
export type MealCategory = z.infer<typeof mealCategoryEnum>;
export declare const createMealSchema: z.ZodObject<{
    name: z.ZodString;
    calories: z.ZodNumber;
    proteins: z.ZodNumber;
    carbs: z.ZodNumber;
    fats: z.ZodNumber;
    category: z.ZodDefault<z.ZodOptional<z.ZodEnum<{
        BREAKFAST: "BREAKFAST";
        LUNCH: "LUNCH";
        DINNER: "DINNER";
        SNACK: "SNACK";
    }>>>;
    date: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const updateMealSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    proteins: z.ZodOptional<z.ZodNumber>;
    calories: z.ZodOptional<z.ZodNumber>;
    carbs: z.ZodOptional<z.ZodNumber>;
    fats: z.ZodOptional<z.ZodNumber>;
    category: z.ZodOptional<z.ZodEnum<{
        BREAKFAST: "BREAKFAST";
        LUNCH: "LUNCH";
        DINNER: "DINNER";
        SNACK: "SNACK";
    }>>;
    date: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type CreateMealDto = z.infer<typeof createMealSchema>;
export type UpdateMealDto = z.infer<typeof updateMealSchema>;
