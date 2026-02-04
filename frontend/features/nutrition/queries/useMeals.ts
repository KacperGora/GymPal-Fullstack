import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { getMeals } from '../api/nutrition.api';

export const useMeals = (date: string) =>
  useQuery({
    queryKey: ['meals', date],
    queryFn: () => getMeals(date),
    placeholderData: keepPreviousData,
  });
