import { useQuery } from '@tanstack/react-query';

import { getWeeklyWorkoutStats } from '../api/workouts.api';

export const useWeeklyWorkoutStats = () =>
  useQuery({
    queryKey: ['workouts', 'stats', 'weekly'],
    queryFn: () => getWeeklyWorkoutStats(),
  });
