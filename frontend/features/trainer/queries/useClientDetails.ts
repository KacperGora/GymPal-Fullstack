import { useQuery } from '@tanstack/react-query';

import { getClientDetails } from '../api/trainer.api';

export const useClientDetails = (clientId: number) => {
  return useQuery({
    queryKey: ['clients', clientId],
    queryFn: () => getClientDetails(clientId),
  });
};
