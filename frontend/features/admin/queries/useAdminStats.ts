import { useQuery } from '@tanstack/react-query';

import { getAdminStats } from '../api/admin.api';

export const useAdminStats = () =>
  useQuery({
    queryKey: ['adminStats'],
    queryFn: getAdminStats,
  });
