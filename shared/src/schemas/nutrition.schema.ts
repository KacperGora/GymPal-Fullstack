import { z } from "zod";

/**
 * Schema for nutrition query parameters
 * Validates date format (YYYY-MM-DD) for weekly stats
 */
export const nutritionQuerySchema = z.object({
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format")
    .refine((date) => !isNaN(Date.parse(date)), "Invalid date"),
});

export type NutritionQueryDto = z.infer<typeof nutritionQuerySchema>;
