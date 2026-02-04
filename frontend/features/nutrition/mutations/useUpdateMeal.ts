import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { Meal } from '../types';
import type { UpdateMealDto } from '@gympal/shared';

import { updateMeal } from '../api/nutrition.api';

interface UseUpdateMealOptions {
  onSuccess?: (meal: Meal) => void;
}

export const useUpdateMeal = (options: UseUpdateMealOptions = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateMealDto }) =>
      updateMeal(id, data),
    onSuccess: (meal) => {
      queryClient.invalidateQueries({ queryKey: ['meals'] });
      queryClient.invalidateQueries({ queryKey: ['dailyStats'] });
      options.onSuccess?.(meal);
    },
  });
};
