import { useQuery } from '@tanstack/react-query';

import { getAdminUsers } from '../api/admin.api';

export const useAdminUsers = () =>
  useQuery({
    queryKey: ['adminUsers'],
    queryFn: getAdminUsers,
  });
