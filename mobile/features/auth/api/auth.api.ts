import { endpointList } from '@gympal/shared';
import type { LoginDto, RegisterDto } from '@gympal/shared';

import { api } from '../../../shared/api/axios';
import { tokenStorage } from '../../../shared/api/tokenStorage';

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

export const authApi = {
  login: async (data: LoginDto): Promise<AuthTokens> => {
    const response = await api.post<AuthTokens>(endpointList.auth.login, data);
    await tokenStorage.setTokens(response.data.accessToken, response.data.refreshToken);
    return response.data;
  },

  register: async (data: RegisterDto): Promise<AuthTokens> => {
    const response = await api.post<AuthTokens>(endpointList.auth.register, data);
    await tokenStorage.setTokens(response.data.accessToken, response.data.refreshToken);
    return response.data;
  },

  logout: async (): Promise<void> => {
    await api.post(endpointList.auth.logout);
    await tokenStorage.clearTokens();
  },

  getMe: () => api.get(endpointList.auth.getMe).then((r) => r.data),
};
