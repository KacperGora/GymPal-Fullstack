import { z } from "zod";
import { mealCategoryEnum } from "./meals.schema.js";

export const mealSuggestionRequestSchema = z.object({
  category: mealCategoryEnum,
  date: z.string().datetime().optional(),
  count: z.number().int().min(1).max(5).optional().default(3),
});

export const mealSuggestionItemSchema = z.object({
  name: z.string().min(1).max(100),
  calories: z.number().int().min(50).max(2000),
  proteins: z.number().min(0).max(200),
  carbs: z.number().min(0).max(300),
  fats: z.number().min(0).max(100),
  reasoning: z.string().max(500).optional(),
});

export const mealSuggestionsResponseSchema = z.object({
  suggestions: z.array(mealSuggestionItemSchema).min(1).max(5),
  context: z.object({
    targetCalories: z.number(),
    consumed: z.object({
      calories: z.number(),
      proteins: z.number(),
      carbs: z.number(),
      fats: z.number(),
    }),
    remaining: z.object({
      calories: z.number(),
      proteins: z.number(),
      carbs: z.number(),
      fats: z.number(),
    }),
  }),
});

export type MealSuggestionRequest = z.infer<typeof mealSuggestionRequestSchema>;
export type MealSuggestionItem = z.infer<typeof mealSuggestionItemSchema>;
export type MealSuggestionsResponse = z.infer<
  typeof mealSuggestionsResponseSchema
>;
