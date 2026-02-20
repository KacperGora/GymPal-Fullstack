import { z } from "zod";
export declare const mealSuggestionRequestSchema: z.ZodObject<
  {
    category: z.ZodEnum<{
      BREAKFAST: "BREAKFAST";
      LUNCH: "LUNCH";
      DINNER: "DINNER";
      SNACK: "SNACK";
    }>;
    date: z.ZodOptional<z.ZodString>;
    count: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    language: z.ZodDefault<
      z.ZodOptional<
        z.ZodEnum<{
          en: "en";
          pl: "pl";
        }>
      >
    >;
  },
  z.core.$strip
>;
export declare const mealSuggestionItemSchema: z.ZodObject<
  {
    name: z.ZodString;
    calories: z.ZodNumber;
    proteins: z.ZodNumber;
    carbs: z.ZodNumber;
    fats: z.ZodNumber;
    ingredients: z.ZodArray<
      z.ZodObject<
        {
          name: z.ZodString;
          grams: z.ZodNumber;
        },
        z.core.$strip
      >
    >;
    steps: z.ZodOptional<z.ZodArray<z.ZodString>>;
    reasoning: z.ZodOptional<z.ZodString>;
  },
  z.core.$strip
>;
export declare const mealSuggestionsResponseSchema: z.ZodObject<
  {
    suggestions: z.ZodArray<
      z.ZodObject<
        {
          name: z.ZodString;
          calories: z.ZodNumber;
          proteins: z.ZodNumber;
          carbs: z.ZodNumber;
          fats: z.ZodNumber;
          ingredients: z.ZodArray<
            z.ZodObject<
              {
                name: z.ZodString;
                grams: z.ZodNumber;
              },
              z.core.$strip
            >
          >;
          steps: z.ZodOptional<z.ZodArray<z.ZodString>>;
          reasoning: z.ZodOptional<z.ZodString>;
        },
        z.core.$strip
      >
    >;
    context: z.ZodObject<
      {
        targetCalories: z.ZodNumber;
        consumed: z.ZodObject<
          {
            calories: z.ZodNumber;
            proteins: z.ZodNumber;
            carbs: z.ZodNumber;
            fats: z.ZodNumber;
          },
          z.core.$strip
        >;
        remaining: z.ZodObject<
          {
            calories: z.ZodNumber;
            proteins: z.ZodNumber;
            carbs: z.ZodNumber;
            fats: z.ZodNumber;
          },
          z.core.$strip
        >;
      },
      z.core.$strip
    >;
  },
  z.core.$strip
>;
export type MealSuggestionRequest = z.infer<typeof mealSuggestionRequestSchema>;
export type MealSuggestionItem = z.infer<typeof mealSuggestionItemSchema>;
export type MealSuggestionsResponse = z.infer<
  typeof mealSuggestionsResponseSchema
>;
