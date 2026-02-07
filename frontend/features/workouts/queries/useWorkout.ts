import { useQuery } from '@tanstack/react-query';

import { getWorkout } from '../api/workouts.api';

export const useWorkout = (id: string | null) =>
  useQuery({
    queryKey: ['workouts', id],
    queryFn: () => getWorkout(id!),
    enabled: id !== null,
  });
