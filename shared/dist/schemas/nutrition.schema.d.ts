import { z } from "zod";
/**
 * Schema for nutrition query parameters
 * Validates date format (YYYY-MM-DD) for weekly stats
 */
export declare const nutritionQuerySchema: z.ZodObject<
  {
    date: z.ZodString;
  },
  z.core.$strip
>;
export type NutritionQueryDto = z.infer<typeof nutritionQuerySchema>;
