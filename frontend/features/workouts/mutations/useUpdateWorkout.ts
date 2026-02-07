import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { WorkoutSession } from '../types';
import type { UpdateWorkoutSessionDto } from '@gympal/shared';

import { updateWorkout } from '../api/workouts.api';

interface UseUpdateWorkoutOptions {
  onSuccess?: (workout: WorkoutSession) => void;
}

export const useUpdateWorkout = (options: UseUpdateWorkoutOptions = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateWorkoutSessionDto }) =>
      updateWorkout(id, data),
    onSuccess: (updatedWorkout) => {
      queryClient.setQueryData(['workouts', updatedWorkout.id], updatedWorkout);
      queryClient.invalidateQueries({ queryKey: ['workouts'] });
      options.onSuccess?.(updatedWorkout);
    },
  });
};
