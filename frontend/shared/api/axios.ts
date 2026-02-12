import axios, { type AxiosRequestConfig } from 'axios';

import { endpointList } from './endpoint';

export const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
});

let refreshPromise: Promise<void> | null = null;

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config as AxiosRequestConfig & { _retry?: boolean };
    const url = original?.url ?? '';
    const isAuthEndpoint = url.startsWith('/auth/');

    if (
      error.response?.status === 401 &&
      !isAuthEndpoint &&
      !original?._retry
    ) {
      original._retry = true;

      if (!refreshPromise) {
        refreshPromise = api
          .post(endpointList.auth.refresh)
          .then(() => undefined)
          .finally(() => {
            refreshPromise = null;
          });
      }

      try {
        await refreshPromise;
        return api(original);
      } catch (refreshError) {
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }

    if (
      error.response?.status === 401 &&
      isAuthEndpoint &&
      url !== '/auth/me'
    ) {
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  },
);
