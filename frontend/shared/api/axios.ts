import axios, { type AxiosRequestConfig } from 'axios';

import { errorMessages } from '../i18n/errorMessages';
import { useSnackbarStore } from '../stores/useSnackbarStore';

import { endpointList } from './endpoint';

// Custom axios config to skip global error handler
declare module 'axios' {
  export interface AxiosRequestConfig {
    skipGlobalErrorHandler?: boolean;
  }
}

// Simple i18n helper for non-React contexts
const getErrorMessage = (key: keyof (typeof errorMessages)['en']): string => {
  const locale =
    typeof document !== 'undefined'
      ? document.documentElement.lang || 'en'
      : 'en';
  const activeLocale =
    (locale as 'en' | 'pl') in errorMessages ? (locale as 'en' | 'pl') : 'en';
  return errorMessages[activeLocale][key];
};

export const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
});

let refreshPromise: Promise<void> | null = null;
let didHandleSessionExpiry = false;

// Reset session expiry flag when navigating to login to allow handling it again next time
if (typeof window !== 'undefined') {
  window.addEventListener('navigateToLogin', () => {
    didHandleSessionExpiry = false;
  });
}

/**
 * TODO: Add comprehensive unit tests for this interceptor
 * Tests should cover:
 * - Single dispatch of navigateToLogin event on concurrent 401s
 * - Snackbar shown only once per session expiration
 * - Proper 401 handling for different endpoint types
 * - Non-401 error handling
 *
 * Current challenge: axios instance needs proper mocking setup in Vitest
 * Consider using axios mock adapter or creating integration tests instead
 */
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
          if (!didHandleSessionExpiry) {
            didHandleSessionExpiry = true;
            useSnackbarStore
              .getState()
              .showSnackbar(getErrorMessage('sessionExpired'), 'error');
            window.dispatchEvent(new CustomEvent('navigateToLogin'));
          }
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
        window.dispatchEvent(new CustomEvent('navigateToLogin'));
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
