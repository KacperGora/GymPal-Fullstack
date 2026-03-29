import { useMutation, useQueryClient } from '@tanstack/react-query';

import { updateUserRole, type AdminUser } from '../api/admin.api';

export const useUpdateUserRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, role }: { id: number; role: AdminUser['role'] }) =>
      updateUserRole(id, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
    },
  });
};
