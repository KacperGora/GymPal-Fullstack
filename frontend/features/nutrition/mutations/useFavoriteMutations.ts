import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { FavoriteMeal } from '../types';

import {
  createFavorite,
  deleteFavorite,
  type CreateFavoriteDto,
} from '../api/nutrition.api';

export const useAddFavorite = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateFavoriteDto) => createFavorite(data),
    onSuccess: (favorite) => {
      queryClient.setQueryData(
        ['favorites'],
        (old: FavoriteMeal[] | undefined) => {
          if (!old) return [favorite];
          if (old.some((item) => item.id === favorite.id)) return old;
          return [favorite, ...old];
        },
      );
    },
  });
};

export const useRemoveFavorite = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteFavorite(id),
    onSuccess: (_, id) => {
      queryClient.setQueryData(
        ['favorites'],
        (old: FavoriteMeal[] | undefined) => {
          if (!old) return [];
          return old.filter((item) => item.id !== id);
        },
      );
    },
  });
};
