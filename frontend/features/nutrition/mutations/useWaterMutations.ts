import { useMutation, useQueryClient } from '@tanstack/react-query';

import { addWaterGlass, removeWaterGlass } from '../api/nutrition.api';

export const useAddWater = (date: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => addWaterGlass(date),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['water', date] });
    },
  });
};

export const useRemoveWater = (date: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => removeWaterGlass(date),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['water', date] });
    },
  });
};
