import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { WorkoutSession } from '../types';

import { deleteWorkout } from '../api/workouts.api';

interface UseDeleteWorkoutOptions {
  onSuccess?: () => void;
}

export const useDeleteWorkout = (options: UseDeleteWorkoutOptions = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteWorkout(id),
    onSuccess: (_, deletedId) => {
      queryClient.setQueryData(
        ['workouts', undefined],
        (old: WorkoutSession[] | undefined) => {
          if (!old) return [];
          return old.filter((w) => w.id !== deletedId);
        },
      );
      queryClient.invalidateQueries({ queryKey: ['workouts'] });
      options.onSuccess?.();
    },
  });
};
