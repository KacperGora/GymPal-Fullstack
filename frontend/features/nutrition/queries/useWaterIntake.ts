import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { getWaterIntake } from '../api/nutrition.api';

export const useWaterIntake = (date: string) =>
  useQuery({
    queryKey: ['water', date],
    queryFn: () => getWaterIntake(date),
    placeholderData: keepPreviousData,
  });
