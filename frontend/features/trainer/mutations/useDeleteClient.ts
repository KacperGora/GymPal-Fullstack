import { useMutation, useQueryClient } from '@tanstack/react-query';

import { deleteClient } from '../api/trainer.api';

export const useDeleteClient = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (clientId: number) => deleteClient(clientId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });
};
