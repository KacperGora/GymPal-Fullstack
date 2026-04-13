import { useMutation, useQueryClient } from '@tanstack/react-query';

import { authApi } from '../api/auth.api';

export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.login,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
    },
  });
};
