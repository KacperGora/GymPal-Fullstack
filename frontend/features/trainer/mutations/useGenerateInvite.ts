import { useMutation } from '@tanstack/react-query';

import { generateInvite } from '../api/trainer.api';

export const useGenerateInvite = () => {
  return useMutation({
    mutationFn: () => generateInvite(),
  });
};
