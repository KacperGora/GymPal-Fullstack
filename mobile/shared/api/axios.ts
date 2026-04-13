import axios, { type AxiosRequestConfig } from 'axios';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

import { endpointList } from '@gympal/shared';

import { tokenStorage } from './tokenStorage';

const BACKEND_PORT = 4000;

function getDevBaseUrl(): string {
  // Physical device via Expo Go — use the same host Metro is running on
  const metroHost = Constants.expoConfig?.hostUri?.split(':')[0];
  if (metroHost && metroHost !== 'localhost') {
    return `http://${metroHost}:${BACKEND_PORT}`;
  }
  // Android emulator
  if (Platform.OS === 'android') return `http://10.0.2.2:${BACKEND_PORT}`;
  // iOS simulator / web
  return `http://localhost:${BACKEND_PORT}`;
}

const envUrl = process.env.EXPO_PUBLIC_API_URL;

if (!envUrl && !__DEV__) {
  throw new Error('EXPO_PUBLIC_API_URL must be set in production');
}

const BASE_URL = envUrl ?? getDevBaseUrl();

export const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json', 'X-Client-Type': 'mobile' },
});

// Dev: log all requests/responses to console
if (__DEV__) {
  api.interceptors.request.use((config) => {
    console.log(`[API] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`, config.data ?? '');
    return config;
  });
  api.interceptors.response.use(
    (response) => {
      console.log(`[API] ${response.status} ${response.config.url}`, response.data);
      return response;
    },
    (error) => {
      console.warn(`[API] ERR ${error.response?.status} ${error.config?.url}`, error.response?.data);
      return Promise.reject(error);
    },
  );
}

// Attach access token to every request
api.interceptors.request.use(async (config) => {
  const token = await tokenStorage.getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let refreshPromise: Promise<string> | null = null;

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config as AxiosRequestConfig & { _retry?: boolean };
    const url = original?.url ?? '';
    const noRefreshEndpoints = [
      endpointList.auth.login,
      endpointList.auth.register,
      endpointList.auth.refresh,
    ];
    const isNoRefreshEndpoint = noRefreshEndpoints.includes(url);

    if (error.response?.status === 401 && !isNoRefreshEndpoint && !original._retry) {
      original._retry = true;

      if (!refreshPromise) {
        refreshPromise = (async () => {
          const refreshToken = await tokenStorage.getRefreshToken();
          if (!refreshToken) {
            await tokenStorage.clearTokens();
            throw new Error('NO_REFRESH_TOKEN');
          }
          const response = await axios.post<{ accessToken: string; refreshToken: string }>(
            `${BASE_URL}${endpointList.auth.refresh}`,
            { refreshToken },
            { headers: { 'Content-Type': 'application/json', 'X-Client-Type': 'mobile' } },
          );
          await tokenStorage.setTokens(
            response.data.accessToken,
            response.data.refreshToken,
          );
          return response.data.accessToken;
        })()
          .catch(async (err) => {
            await tokenStorage.clearTokens();
            throw err;
          })
          .finally(() => {
            refreshPromise = null;
          });
      }

      try {
        const newToken = await refreshPromise;
        original.headers = { ...original.headers, Authorization: `Bearer ${newToken}` };
        return api(original);
      } catch {
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  },
);
