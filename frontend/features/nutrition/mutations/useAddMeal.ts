import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { Meal } from '../types';
import type { CreateMealDto } from '@gympal/shared';

import { createMeal } from '../api/nutrition.api';

interface UseAddMealOptions {
  onSuccess?: (meal: Meal) => void;
}

export const useAddMeal = (options: UseAddMealOptions = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateMealDto) => createMeal(data),
    onSuccess: (meal) => {
      queryClient.invalidateQueries({ queryKey: ['meals'] });
      queryClient.invalidateQueries({ queryKey: ['dailyStats'] });
      options.onSuccess?.(meal);
    },
  });
};
