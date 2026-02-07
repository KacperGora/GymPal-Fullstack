import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { endpointList } from '@/shared/api/endpoint';

import { useAuth } from '../useAuth';

const mockRemoveQueries = vi.fn();
const mockClearUser = vi.fn();
const mockPost = vi.fn();

const storeState = {
  user: null as { id: number; email?: string } | null,
  isAuthenticated: false,
  isHydrated: false,
  clearUser: mockClearUser,
};

vi.mock('@tanstack/react-query', () => ({
  useQueryClient: () => ({ removeQueries: mockRemoveQueries }),
}));

vi.mock('@/shared/stores/auth.store', () => ({
  useAuthStore: () => storeState,
}));

vi.mock('@/shared/api/axios', () => ({
  api: {
    post: (...args: unknown[]) => mockPost(...args),
  },
}));

beforeEach(() => {
  vi.clearAllMocks();
  storeState.user = null;
  storeState.isAuthenticated = false;
  storeState.isHydrated = false;
});

describe('useAuth', () => {
  it('should expose user, auth state, and loading', () => {
    storeState.user = { id: 1, email: 'a@a.pl' };
    storeState.isAuthenticated = true;
    storeState.isHydrated = true;

    const { result } = renderHook(() => useAuth());

    expect(result.current.user).toEqual({ id: 1, email: 'a@a.pl' });
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.isLoading).toBe(false);
  });

  it('should set loading when not hydrated', () => {
    storeState.isHydrated = false;

    const { result } = renderHook(() => useAuth());

    expect(result.current.isLoading).toBe(true);
  });

  it('should logout and clear user', async () => {
    mockPost.mockResolvedValueOnce(undefined);

    const { result } = renderHook(() => useAuth());

    await result.current.logout();

    expect(mockPost).toHaveBeenCalledWith(endpointList.auth.logout);
    expect(mockClearUser).toHaveBeenCalled();
    expect(mockRemoveQueries).toHaveBeenCalledWith({ queryKey: ['me'] });
    expect(mockRemoveQueries).toHaveBeenCalledWith({
      queryKey: ['userProfile'],
    });
  });

  it('should clear user even if logout fails', async () => {
    mockPost.mockRejectedValueOnce(new Error('401'));

    const { result } = renderHook(() => useAuth());

    await expect(result.current.logout()).rejects.toThrow('401');

    expect(mockClearUser).toHaveBeenCalled();
    expect(mockRemoveQueries).toHaveBeenCalledWith({ queryKey: ['me'] });
    expect(mockRemoveQueries).toHaveBeenCalledWith({
      queryKey: ['userProfile'],
    });
  });
});
