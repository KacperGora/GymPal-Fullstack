import { useQuery } from '@tanstack/react-query';

import { getMyTrainer } from '../api/trainer.api';

export const useMyTrainer = () =>
  useQuery({
    queryKey: ['myTrainer'],
    queryFn: getMyTrainer,
  });
