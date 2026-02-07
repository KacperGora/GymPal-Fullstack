import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { WorkoutSession } from '../types';
import type { CreateWorkoutSessionDto } from '@gympal/shared';

import { createWorkout } from '../api/workouts.api';

interface UseAddWorkoutOptions {
  onSuccess?: (workout: WorkoutSession) => void;
}

export const useAddWorkout = (options: UseAddWorkoutOptions = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateWorkoutSessionDto) => createWorkout(data),
    onSuccess: (newWorkout) => {
      queryClient.setQueryData(
        ['workouts', undefined],
        (old: WorkoutSession[] | undefined) => {
          if (!old) return [newWorkout];
          return [newWorkout, ...old];
        },
      );
      queryClient.invalidateQueries({ queryKey: ['workouts'] });
      options.onSuccess?.(newWorkout);
    },
  });
};
