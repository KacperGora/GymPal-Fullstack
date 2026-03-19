import { useMutation } from '@tanstack/react-query';

import { createPortalSession } from '../api/billing.api';

export const useCreatePortal = () => {
  return useMutation({
    mutationFn: createPortalSession,
    onSuccess: ({ url }) => {
      window.location.href = url;
    },
  });
};
