import axios, { type AxiosRequestConfig } from 'axios';

import { useSnackbarStore } from '../stores/useSnackbarStore';

import { endpointList } from './endpoint';

// Custom axios config to skip global error handler
declare module 'axios' {
  export interface AxiosRequestConfig {
    skipGlobalErrorHandler?: boolean;
  }
}

// Simple i18n helper for non-React contexts
const getErrorMessage = (key: keyof typeof errorMessages): string => {
  const locale =
    typeof document !== 'undefined'
      ? document.documentElement.lang || 'en'
      : 'en';
  return errorMessages[key][locale as 'en' | 'pl'] || errorMessages[key].en;
};

const errorMessages = {
  sessionExpired: {
    en: 'Session expired. Please log in again.',
    pl: 'Sesja wygasła. Zaloguj się ponownie.',
  },
  invalidCredentials: {
    en: 'Invalid login credentials',
    pl: 'Nieprawidłowe dane logowania',
  },
  unexpectedError: {
    en: 'An unexpected error occurred',
    pl: 'Wystąpił nieoczekiwany błąd',
  },
};

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
    const skipGlobalHandler = original?.skipGlobalErrorHandler;

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
        if (typeof window !== 'undefined' && !skipGlobalHandler) {
          useSnackbarStore
            .getState()
            .showSnackbar(getErrorMessage('sessionExpired'), 'error');
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
      if (typeof window !== 'undefined' && !skipGlobalHandler) {
        useSnackbarStore
          .getState()
          .showSnackbar(getErrorMessage('invalidCredentials'), 'error');
        window.location.href = '/login';
      }
    }

    // Show snackbar for other errors (excluding 401 handled above)
    if (
      error.response?.status !== 401 &&
      typeof window !== 'undefined' &&
      !skipGlobalHandler
    ) {
      const message =
        error.response?.data?.message ||
        error.message ||
        getErrorMessage('unexpectedError');
      useSnackbarStore.getState().showSnackbar(message, 'error');
    }

    return Promise.reject(error);
  },
);
