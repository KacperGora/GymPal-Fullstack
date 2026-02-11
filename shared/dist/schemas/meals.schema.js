import { z } from "zod";
export const mealCategoryEnum = z.enum([
    "BREAKFAST",
    "LUNCH",
    "DINNER",
    "SNACK",
]);
export const createMealSchema = z.object({
    name: z.string().min(1).max(255),
    calories: z.number().int().nonnegative(),
    proteins: z.number().nonnegative(),
    carbs: z.number().nonnegative(),
    fats: z.number().nonnegative(),
    category: mealCategoryEnum.optional().default("SNACK"),
    date: z.string().datetime().optional(),
});
export const updateMealSchema = z.object({
    name: z.string().min(1).max(255).optional(),
    proteins: z.number().nonnegative().optional(),
    calories: z.number().int().nonnegative().optional(),
    carbs: z.number().nonnegative().optional(),
    fats: z.number().nonnegative().optional(),
    category: mealCategoryEnum.optional(),
    date: z.string().datetime().optional(),
});
