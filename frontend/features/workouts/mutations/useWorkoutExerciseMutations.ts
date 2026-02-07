import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { WorkoutExercise } from '../types';
import type {
  CreateWorkoutExerciseDto,
  UpdateWorkoutExerciseDto,
} from '@gympal/shared';

import {
  addExerciseToWorkout,
  updateWorkoutExercise,
  deleteWorkoutExercise,
} from '../api/workouts.api';

interface UseAddExerciseOptions {
  onSuccess?: (exercise: WorkoutExercise) => void;
}

export const useAddExerciseToWorkout = (
  options: UseAddExerciseOptions = {},
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      workoutId,
      data,
    }: {
      workoutId: string;
      data: CreateWorkoutExerciseDto;
    }) => addExerciseToWorkout(workoutId, data),
    onSuccess: (newExercise, { workoutId }) => {
      queryClient.invalidateQueries({ queryKey: ['workouts', workoutId] });
      queryClient.invalidateQueries({ queryKey: ['workouts'] });
      options.onSuccess?.(newExercise);
    },
  });
};

interface UseUpdateExerciseOptions {
  onSuccess?: (exercise: WorkoutExercise) => void;
}

export const useUpdateWorkoutExercise = (
  options: UseUpdateExerciseOptions = {},
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      workoutId,
      exerciseId,
      data,
    }: {
      workoutId: string;
      exerciseId: string;
      data: UpdateWorkoutExerciseDto;
    }) => updateWorkoutExercise(workoutId, exerciseId, data),
    onSuccess: (updatedExercise, { workoutId }) => {
      queryClient.invalidateQueries({ queryKey: ['workouts', workoutId] });
      queryClient.invalidateQueries({ queryKey: ['workouts'] });
      options.onSuccess?.(updatedExercise);
    },
  });
};

interface UseDeleteExerciseOptions {
  onSuccess?: () => void;
}

export const useDeleteWorkoutExercise = (
  options: UseDeleteExerciseOptions = {},
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      workoutId,
      exerciseId,
    }: {
      workoutId: string;
      exerciseId: string;
    }) => deleteWorkoutExercise(workoutId, exerciseId),
    onSuccess: (_, { workoutId }) => {
      queryClient.invalidateQueries({ queryKey: ['workouts', workoutId] });
      queryClient.invalidateQueries({ queryKey: ['workouts'] });
      options.onSuccess?.();
    },
  });
};
