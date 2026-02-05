import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { FavoriteExercise } from '../types';
import type { CreateFavoriteExerciseDto } from '@gympal/shared';

import {
  addFavoriteExercise,
  removeFavoriteExercise,
} from '../api/exercises.api';

export const useAddFavoriteExercise = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateFavoriteExerciseDto) => addFavoriteExercise(data),
    onSuccess: (favorite) => {
      queryClient.setQueryData(
        ['favoriteExercises'],
        (old: FavoriteExercise[] | undefined) => {
          if (!old) {
            return [favorite];
          }

          if (old.some((item) => item.id === favorite.id)) return old;
          return [favorite, ...old];
        },
      );
      queryClient.setQueryData(
        ['favoriteExerciseIds'],
        (old: number[] | undefined) => {
          if (!old) {
            return [favorite.wgerExerciseId];
          }

          if (old.includes(favorite.wgerExerciseId)) {
            return old;
          }

          return [...old, favorite.wgerExerciseId];
        },
      );
    },
  });
};

export const useRemoveFavoriteExercise = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => removeFavoriteExercise(id),
    onSuccess: (_, id) => {
      queryClient.setQueryData(
        ['favoriteExercises'],
        (old: FavoriteExercise[] | undefined) => {
          if (!old) {
            return [];
          }

          const removed = old.find((item) => item.id === id);

          if (removed) {
            queryClient.setQueryData(
              ['favoriteExerciseIds'],
              (ids: number[] | undefined) => {
                if (!ids) {
                  return [];
                }

                return ids.filter((i) => i !== removed.wgerExerciseId);
              },
            );
          }
          return old.filter((item) => item.id !== id);
        },
      );
    },
  });
};
