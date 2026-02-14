import { useMutation } from '@tanstack/react-query';

import type {
  MealSuggestionRequest,
  MealSuggestionsResponse,
} from '@gympal/shared';

import { getMealSuggestions } from '../api/nutrition.api';

interface UseAiMealSuggestionsOptions {
  onSuccess?: (data: MealSuggestionsResponse) => void;
}

export const useAiMealSuggestions = (
  options: UseAiMealSuggestionsOptions = {},
) => {
  return useMutation({
    mutationFn: (data: MealSuggestionRequest) => getMealSuggestions(data),
    onSuccess: (data) => {
      options.onSuccess?.(data);
    },
  });
};
