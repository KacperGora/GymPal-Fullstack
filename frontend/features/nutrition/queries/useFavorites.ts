import { useQuery } from '@tanstack/react-query';

import { getFavorites } from '../api/nutrition.api';

export const useFavorites = () =>
  useQuery({
    queryKey: ['favorites'],
    queryFn: getFavorites,
  });
