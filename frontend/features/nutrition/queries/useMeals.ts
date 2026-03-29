import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { getMeals } from '../api/nutrition.api';

export const useMeals = (date: string, clientId?: number) =>
  useQuery({
    queryKey: ['meals', date, clientId],
    queryFn: () => getMeals(date, clientId),
    placeholderData: keepPreviousData,
  });
