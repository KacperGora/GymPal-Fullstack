import { useQuery } from '@tanstack/react-query';

import { getMe } from '@/features/auth/api/auth.api';

export const useMe = () =>
  useQuery({
    queryKey: ['me'],
    queryFn: getMe,
    retry: false,
  });
