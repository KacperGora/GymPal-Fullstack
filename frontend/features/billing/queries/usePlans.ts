import { useQuery } from '@tanstack/react-query';

import { getPlans } from '../api/billing.api';

export const usePlans = () => {
  return useQuery({
    queryKey: ['plans'],
    queryFn: getPlans,
  });
};
