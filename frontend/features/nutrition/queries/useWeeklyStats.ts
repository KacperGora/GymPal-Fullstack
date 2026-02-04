import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { getWeeklyStats } from '../api/nutrition.api';

export const useWeeklyStats = (date: string) =>
  useQuery({
    queryKey: ['weeklyStats', date],
    queryFn: () => getWeeklyStats(date),
    placeholderData: keepPreviousData,
  });
