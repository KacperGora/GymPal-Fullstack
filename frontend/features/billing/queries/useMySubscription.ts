import { useQuery } from '@tanstack/react-query';

import { getMySubscription } from '../api/billing.api';

export const useMySubscription = (enabled = true) => {
  return useQuery({
    queryKey: ['subscription', 'me'],
    queryFn: getMySubscription,
    enabled,
  });
};
