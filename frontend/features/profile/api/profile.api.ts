import type { CreateUserProfileDto } from '@gympal/shared';

import { api } from '@/shared/api/axios';
import { endpointList } from '@/shared/api/endpoint';

import type { UserProfile } from '../types';

export const getUserProfile = async () => {
  const res = await api.get(endpointList.userProfile.get);
  return res.data as UserProfile;
};

export const upsertUserProfile = async (data: CreateUserProfileDto) => {
  const res = await api.put(endpointList.userProfile.upsert, data);
  return res.data as UserProfile;
};
