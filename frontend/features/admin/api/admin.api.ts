import { api } from '@/shared/api/axios';
import { endpointList } from '@/shared/api/endpoint';

export interface AdminUser {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: 'ADMIN' | 'TRAINER' | 'CLIENT';
}

export interface AdminStats {
  total: number;
  byRole: { ADMIN?: number; TRAINER?: number; CLIENT?: number };
  activeTrainerClientRelations: number;
}

export const getAdminUsers = async (): Promise<AdminUser[]> => {
  const res = await api.get(endpointList.admin.users);
  return res.data as AdminUser[];
};

export const updateUserRole = async (
  id: number,
  role: AdminUser['role'],
): Promise<AdminUser> => {
  const res = await api.patch(endpointList.admin.updateRole(id), { role });
  return res.data as AdminUser;
};

export const getAdminStats = async (): Promise<AdminStats> => {
  const res = await api.get(endpointList.admin.stats);
  return res.data as AdminStats;
};
