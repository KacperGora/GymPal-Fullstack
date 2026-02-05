import { useQuery } from '@tanstack/react-query';

import { getExerciseById } from '../api/exercises.api';

export const useExercise = (id: number | null, lang?: string) =>
  useQuery({
    queryKey: ['exercise', id, lang],
    queryFn: () => getExerciseById(id!, lang),
    enabled: id !== null,
  });
