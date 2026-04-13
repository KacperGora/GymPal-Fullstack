import { useQuery } from '@tanstack/react-query';

import { authApi } from '../api/auth.api';

export const useMe = () =>
  useQuery({
    queryKey: ['auth', 'me'],
    queryFn: authApi.getMe,
    retry: false,
  });
