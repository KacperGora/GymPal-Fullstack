import { useQuery } from '@tanstack/react-query';

import { getPlans } from '../api/billing.api';

interface UsePlansOptions {
  enabled?: boolean;
}

export const usePlans = ({ enabled = true }: UsePlansOptions = {}) => {
  return useQuery({
    queryKey: ['plans'],
    queryFn: getPlans,
    enabled,
  });
};
