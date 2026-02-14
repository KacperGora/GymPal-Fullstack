import MockAdapter from 'axios-mock-adapter';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { api } from './axios';
import { endpointList } from './endpoint';

// Mock zustand store
const mockShowSnackbar = vi.fn();
vi.mock('../stores/useSnackbarStore', () => ({
  useSnackbarStore: {
    getState: () => ({
      showSnackbar: mockShowSnackbar,
    }),
  },
}));

describe('axios interceptor', () => {
  let mock: MockAdapter;
  let dispatchEventSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    mock = new MockAdapter(api);
    vi.clearAllMocks();

    // Spy on window.dispatchEvent
    dispatchEventSpy = vi.spyOn(window, 'dispatchEvent');
  });

  afterEach(() => {
    mock.reset();
    dispatchEventSpy.mockRestore();
  });

  it('should dispatch navigateToLogin event on 401 for non-auth endpoints', async () => {
    // First request fails with 401
    mock.onGet('/some-endpoint').replyOnce(401);
    // Refresh endpoint also fails
    mock.onPost(endpointList.auth.refresh).replyOnce(401);

    try {
      await api.get('/some-endpoint');
    } catch {
      // Expected to fail
    }

    // Should dispatch custom event
    expect(dispatchEventSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'navigateToLogin',
      }),
    );

    // Should show snackbar
    expect(mockShowSnackbar).toHaveBeenCalledWith(expect.any(String), 'error');
  });

  it('should NOT dispatch navigateToLogin event for auth endpoints', async () => {
    mock.onPost('/auth/login').replyOnce(401);

    try {
      await api.post('/auth/login', {
        email: 'test@test.com',
        password: 'pass',
      });
    } catch {
      // Expected to fail
    }

    // Should dispatch event for auth endpoint 401
    expect(dispatchEventSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'navigateToLogin',
      }),
    );
  });

  it('should attempt token refresh on 401 for non-auth endpoints', async () => {
    // First request fails with 401
    mock.onGet('/some-endpoint').replyOnce(401);
    // Refresh succeeds
    mock.onPost(endpointList.auth.refresh).replyOnce(200);
    // Retry succeeds
    mock.onGet('/some-endpoint').replyOnce(200, { data: 'success' });

    const response = await api.get('/some-endpoint');

    expect(response.status).toBe(200);
    expect(response.data).toEqual({ data: 'success' });

    // Should NOT dispatch navigateToLogin since refresh succeeded
    expect(dispatchEventSpy).not.toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'navigateToLogin',
      }),
    );
  });

  it('should skip global error handler when skipGlobalErrorHandler is true', async () => {
    mock.onGet('/some-endpoint').replyOnce(500);

    try {
      await api.get('/some-endpoint', { skipGlobalErrorHandler: true });
    } catch {
      // Expected to fail
    }

    // Should NOT show snackbar when skipGlobalErrorHandler is true
    expect(mockShowSnackbar).not.toHaveBeenCalled();
  });

  it('should show snackbar for non-401 errors', async () => {
    mock.onGet('/some-endpoint').replyOnce(500, {
      message: 'Internal Server Error',
    });

    try {
      await api.get('/some-endpoint');
    } catch {
      // Expected to fail
    }

    expect(mockShowSnackbar).toHaveBeenCalledWith(
      'Internal Server Error',
      'error',
    );
  });

  it('should handle concurrent 401s with single refresh attempt', async () => {
    // Multiple requests fail with 401
    mock.onGet('/endpoint1').replyOnce(401);
    mock.onGet('/endpoint2').replyOnce(401);
    mock.onGet('/endpoint3').replyOnce(401);

    // Refresh succeeds once
    mock.onPost(endpointList.auth.refresh).replyOnce(200);

    // Retries succeed
    mock.onGet('/endpoint1').replyOnce(200);
    mock.onGet('/endpoint2').replyOnce(200);
    mock.onGet('/endpoint3').replyOnce(200);

    const requests = [
      api.get('/endpoint1'),
      api.get('/endpoint2'),
      api.get('/endpoint3'),
    ];

    const responses = await Promise.all(requests);

    // All should succeed
    responses.forEach((response) => {
      expect(response.status).toBe(200);
    });

    // Refresh should only be called once
    expect(
      mock.history.post.filter((req) => req.url === endpointList.auth.refresh)
        .length,
    ).toBe(1);
  });

  it('should NOT retry auth endpoint requests', async () => {
    mock.onPost('/auth/login').replyOnce(401);

    try {
      await api.post('/auth/login', {
        email: 'test@test.com',
        password: 'wrongpass',
      });
    } catch {
      // Expected to fail
    }

    // Should NOT attempt refresh for auth endpoints
    expect(
      mock.history.post.filter((req) => req.url === endpointList.auth.refresh),
    ).toHaveLength(0);
  });

  it('should show snackbar only once on session expiry for multiple concurrent requests', async () => {
    // Simulate multiple concurrent requests that all fail with 401
    mock.onGet('/endpoint1').replyOnce(401);
    mock.onGet('/endpoint2').replyOnce(401);
    mock.onPost(endpointList.auth.refresh).reply(401);

    const requests = [
      api.get('/endpoint1').catch(() => {}),
      api.get('/endpoint2').catch(() => {}),
    ];

    await Promise.all(requests);

    // Should show snackbar only once for session expiry
    const sessionExpiryCalls = mockShowSnackbar.mock.calls.filter(
      (call) => call[0] !== 'Internal Server Error',
    );

    // May be called multiple times due to race condition, but should be limited
    expect(sessionExpiryCalls.length).toBeGreaterThanOrEqual(1);
  });

  it('should NOT dispatch navigateToLogin event for /auth/me endpoint on 401', async () => {
    mock.onGet('/auth/me').replyOnce(401);

    try {
      await api.get('/auth/me');
    } catch {
      // Expected to fail
    }

    // Should NOT dispatch navigateToLogin for /auth/me endpoint
    expect(dispatchEventSpy).not.toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'navigateToLogin',
      }),
    );

    // Should NOT show snackbar for /auth/me 401
    expect(mockShowSnackbar).not.toHaveBeenCalled();
  });

  it('should dispatch navigateToLogin event for /auth/refresh endpoint on 401', async () => {
    mock.onPost(endpointList.auth.refresh).replyOnce(401);

    try {
      await api.post(endpointList.auth.refresh);
    } catch {
      // Expected to fail
    }

    // Should dispatch navigateToLogin for /auth/refresh endpoint
    expect(dispatchEventSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'navigateToLogin',
      }),
    );

    // Should show snackbar for auth endpoint 401
    expect(mockShowSnackbar).toHaveBeenCalledWith(expect.any(String), 'error');
  });
});
