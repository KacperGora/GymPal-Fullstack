import { describe, it, expect, vi, beforeEach } from 'vitest';

import { login, register, getMe } from './auth.api';

const mockGet = vi.fn();
const mockPost = vi.fn();

vi.mock('@/shared/api/axios', () => ({
  api: {
    get: (...args: unknown[]) => mockGet(...args),
    post: (...args: unknown[]) => mockPost(...args),
  },
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe('auth.api', () => {
  describe('login', () => {
    it('should POST to /auth/login and return data', async () => {
      const body = { email: 'a@a.pl', password: '12345678' };
      const responseData = { id: 1, email: 'a@a.pl' };
      mockPost.mockResolvedValue({ data: responseData });

      const result = await login(body);

      expect(mockPost).toHaveBeenCalledWith('/auth/login', body, {
        skipGlobalErrorHandler: true,
      });
      expect(result).toEqual(responseData);
    });

    it('should propagate errors', async () => {
      mockPost.mockRejectedValue(new Error('401'));

      await expect(
        login({ email: 'a@a.pl', password: 'wrong' }),
      ).rejects.toThrow('401');
    });
  });

  describe('register', () => {
    it('should POST to /auth/register and return data', async () => {
      const body = {
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        password: '12345678',
      };
      const responseData = { id: 1, email: 'test@example.com' };
      mockPost.mockResolvedValue({ data: responseData });

      const result = await register(body);

      expect(mockPost).toHaveBeenCalledWith('/auth/register', body, {
        skipGlobalErrorHandler: true,
      });
      expect(result).toEqual(responseData);
    });
  });

  describe('getMe', () => {
    it('should GET /auth/me and return data', async () => {
      const responseData = { firstName: 'Test', lastName: 'User' };
      mockGet.mockResolvedValue({ data: responseData });

      const result = await getMe();

      expect(mockGet).toHaveBeenCalledWith('/auth/me');
      expect(result).toEqual(responseData);
    });
  });
});
