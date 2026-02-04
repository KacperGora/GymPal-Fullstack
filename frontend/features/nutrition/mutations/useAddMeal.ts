import { useMutation, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';

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
      const dateKey = dayjs(meal.date).format('YYYY-MM-DD');

      queryClient.setQueryData(
        ['meals', dateKey],
        (old: Meal[] | undefined) => {
          if (!old) return [meal];
          if (old.some((item) => item.id === meal.id)) return old;
          return [meal, ...old];
        },
      );

      queryClient.setQueryData(
        ['meals', 'recent'],
        (old: Meal[] | undefined) => {
          if (!old) return [meal];
          if (old.some((item) => item.id === meal.id)) return old;
          return [meal, ...old];
        },
      );

      queryClient.invalidateQueries({ queryKey: ['meals'] });
      queryClient.invalidateQueries({ queryKey: ['dailyStats'] });
      options.onSuccess?.(meal);
    },
  });
};
