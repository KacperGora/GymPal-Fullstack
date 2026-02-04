import { useQuery } from '@tanstack/react-query';

import { getRecentMeals } from '../api/nutrition.api';

export const useRecentMeals = () =>
  useQuery({
    queryKey: ['meals', 'recent'],
    queryFn: getRecentMeals,
  });
