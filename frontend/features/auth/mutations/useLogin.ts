import { LoginDto } from '@gympal/shared';
import { useQueryClient, useMutation } from '@tanstack/react-query';

import { login, getMe } from '@/features/auth/api/auth.api';
import { useRouter } from '@/i18n/navigation';

export const useLogin = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (data: LoginDto) => login(data),
    onSuccess: async () => {
      const me = await queryClient.fetchQuery({
        queryKey: ['me'],
        queryFn: getMe,
      });

      if (me.role === 'TRAINER') {
        router.push('/trainer/dashboard');
      } else if (me.role === 'ADMIN') {
        router.push('/admin');
      } else if (me.hasProfile) {
        router.push('/dashboard');
      } else {
        router.push('/welcome');
      }
    },
  });
};
