import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { UserProfile } from '../types';
import type { CreateUserProfileDto } from '@gympal/shared';

import { upsertUserProfile } from '../api/profile.api';

interface UseUpsertUserProfileOptions {
  onSuccess?: (profile: UserProfile) => void;
}

export const useUpsertUserProfile = (
  options: UseUpsertUserProfileOptions = {},
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateUserProfileDto) => upsertUserProfile(data),
    onSuccess: (profile) => {
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      options.onSuccess?.(profile);
    },
  });
};
