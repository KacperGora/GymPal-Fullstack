import { useQuery } from '@tanstack/react-query';

import { getDailyStats } from '../api/nutrition.api';

export const useDailyStats = (date: string, clientId?: number) =>
  useQuery({
    queryKey: ['dailyStats', date, clientId],
    queryFn: () => getDailyStats(date, clientId),
  });
