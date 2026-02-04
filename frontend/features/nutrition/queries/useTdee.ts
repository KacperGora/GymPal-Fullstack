import { useQuery } from '@tanstack/react-query';

import { getTdee } from '../api/nutrition.api';

export const useTdee = (enabled = true) =>
  useQuery({
    queryKey: ['tdee'],
    queryFn: getTdee,
    enabled,
  });
