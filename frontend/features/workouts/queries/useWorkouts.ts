import { keepPreviousData, useQuery } from '@tanstack/react-query';

import type { WorkoutQueryParams } from '../types';

import { getWorkouts } from '../api/workouts.api';

export const useWorkouts = (params?: WorkoutQueryParams) =>
  useQuery({
    queryKey: ['workouts', params],
    queryFn: () => getWorkouts(params),
    placeholderData: keepPreviousData,
  });
