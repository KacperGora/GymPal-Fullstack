import { useQuery } from '@tanstack/react-query';

import { getDailyStats } from '../api/nutrition.api';

export const useDailyStats = (date: string) =>
  useQuery({
    queryKey: ['dailyStats', date],
    queryFn: () => getDailyStats(date),
  });
