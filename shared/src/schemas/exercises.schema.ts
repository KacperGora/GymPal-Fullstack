import { z } from "zod";

export const wgerExerciseSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string(),
  category: z.string(),
  categoryId: z.number(),
  muscles: z.array(z.string()),
  musclesSecondary: z.array(z.string()),
  equipment: z.array(z.string()),
  images: z.array(z.string()),
});

export type WgerExercise = z.infer<typeof wgerExerciseSchema>;

export const wgerCategorySchema = z.object({
  id: z.number(),
  name: z.string(),
});

export type WgerCategory = z.infer<typeof wgerCategorySchema>;

export const wgerMuscleSchema = z.object({
  id: z.number(),
  name: z.string(),
  nameEn: z.string(),
  isFront: z.boolean(),
});

export type WgerMuscle = z.infer<typeof wgerMuscleSchema>;

export const wgerEquipmentSchema = z.object({
  id: z.number(),
  name: z.string(),
});

export type WgerEquipment = z.infer<typeof wgerEquipmentSchema>;

export const wgerPaginatedSchema = z.object({
  count: z.number(),
  next: z.string().nullable(),
  previous: z.string().nullable(),
  results: z.array(wgerExerciseSchema),
});

export type WgerPaginated = z.infer<typeof wgerPaginatedSchema>;

export const createFavoriteExerciseSchema = z.object({
  wgerExerciseId: z.number().int().positive("Exercise ID is required"),
  name: z.string().min(1, "Name is required"),
  category: z.string().min(1, "Category is required"),
  muscles: z.string().min(1, "Muscles is required"),
  equipment: z.string(),
  imageUrl: z.string().optional(),
});

export type CreateFavoriteExerciseDto = z.infer<
  typeof createFavoriteExerciseSchema
>;
