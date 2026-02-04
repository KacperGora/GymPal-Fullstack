import { useMutation, useQueryClient } from '@tanstack/react-query';

import { deleteMeal } from '../api/nutrition.api';

interface UseDeleteMealOptions {
  onSuccess?: () => void;
}

export const useDeleteMeal = (options: UseDeleteMealOptions = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteMeal(id),
    onSuccess: (_data, id) => {
      const mealsQueries = queryClient.getQueriesData<unknown>({
        queryKey: ['meals'],
      });

      mealsQueries.forEach(([key, data]) => {
        if (!Array.isArray(data)) return;
        queryClient.setQueryData(
          key,
          data.filter((item: { id?: string }) => item.id !== id),
        );
      });

      queryClient.invalidateQueries({ queryKey: ['meals'] });
      queryClient.invalidateQueries({ queryKey: ['dailyStats'] });
      options.onSuccess?.();
    },
  });
};
