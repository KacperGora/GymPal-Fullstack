import { useQuery } from '@tanstack/react-query';

import {
  getFavoriteExercises,
  getFavoriteExerciseIds,
} from '../api/exercises.api';

export const useFavoriteExercises = () =>
  useQuery({
    queryKey: ['favoriteExercises'],
    queryFn: getFavoriteExercises,
  });

export const useFavoriteExerciseIds = () =>
  useQuery({
    queryKey: ['favoriteExerciseIds'],
    queryFn: getFavoriteExerciseIds,
  });
