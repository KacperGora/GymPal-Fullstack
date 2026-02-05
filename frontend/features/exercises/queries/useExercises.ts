import { keepPreviousData, useQuery } from '@tanstack/react-query';

import {
  getExercises,
  getExercisesByCategory,
  searchExercises,
  type ExerciseSearchParams,
} from '../api/exercises.api';

export const useExercises = (params?: ExerciseSearchParams) =>
  useQuery({
    queryKey: ['exercises', params],
    queryFn: () => getExercises(params),
    placeholderData: keepPreviousData,
  });

export const useExercisesByCategory = (
  categoryId: number | null,
  params?: ExerciseSearchParams,
) =>
  useQuery({
    queryKey: ['exercises', 'category', categoryId, params],
    queryFn: () => getExercisesByCategory(categoryId!, params),
    enabled: categoryId !== null,
    placeholderData: keepPreviousData,
  });

export const useSearchExercises = (
  term: string,
  params?: ExerciseSearchParams,
) =>
  useQuery({
    queryKey: ['exercises', 'search', term, params],
    queryFn: () => searchExercises(term, params),
    enabled: term.length >= 2,
    placeholderData: keepPreviousData,
  });
