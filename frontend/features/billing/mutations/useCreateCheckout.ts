import { useMutation } from '@tanstack/react-query';

import { createCheckoutSession } from '../api/billing.api';

export const useCreateCheckout = () => {
  return useMutation({
    mutationFn: (priceId: string) => createCheckoutSession(priceId),
    onSuccess: ({ url }) => {
      window.location.href = url;
    },
  });
};
