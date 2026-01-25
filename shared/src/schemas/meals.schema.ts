import { z } from "zod";

export const createMealSchema = z.object({
  name: z.string().min(1).max(255),
  calories: z.number().int().nonnegative(),
  proteins: z.number().nonnegative(),
  carbs: z.number().nonnegative(),
  fats: z.number().nonnegative(),
  date: z.string().datetime().optional(),
});
export const updateMealSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  proteins: z.number().nonnegative().optional(),
  calories: z.number().int().nonnegative().optional(),
  carbs: z.number().nonnegative().optional(),
  fats: z.number().nonnegative().optional(),
  date: z.string().datetime().optional(),
});

export type CreateMealDto = z.infer<typeof createMealSchema>;

export type UpdateMealDto = z.infer<typeof updateMealSchema>;
