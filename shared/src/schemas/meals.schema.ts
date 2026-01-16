import { z } from 'zod';

export const createMealSchema = z.object({
  name: z.string().min(1),
  calories: z.number().nonnegative(),
  proteins: z.number().nonnegative(),
  carbs: z.number().nonnegative(),
  fats: z.number().nonnegative(),
  date: z.string().optional(),
});
export const updateMealSchema = z.object({
  name: z.string().min(1).optional(),
  proteins: z.number().nonnegative().optional(),
  calories: z.number().int().nonnegative().optional(),
  carbs: z.number().nonnegative().optional(),
  fats: z.number().nonnegative().optional(),
  date: z.string().optional(),
});

export type CreateMealDto = z.infer<typeof createMealSchema>;

export type UpdateMealDto = z.infer<typeof updateMealSchema>;
