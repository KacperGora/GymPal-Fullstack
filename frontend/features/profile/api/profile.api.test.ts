import { describe, it, expect, vi, beforeEach } from 'vitest';

import { getUserProfile, upsertUserProfile } from './profile.api';

const mockGet = vi.fn();
const mockPut = vi.fn();

vi.mock('@/shared/api/axios', () => ({
  api: {
    get: (...args: unknown[]) => mockGet(...args),
    put: (...args: unknown[]) => mockPut(...args),
  },
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe('profile.api', () => {
  describe('getUserProfile', () => {
    it('should GET /user-profile and return data', async () => {
      const responseData = {
        height: 180,
        weight: 80,
        age: 30,
        activity: 1.55,
        goal: 'maintain',
      };
      mockGet.mockResolvedValue({ data: responseData });

      const result = await getUserProfile();

      expect(mockGet).toHaveBeenCalledWith('/user-profile');
      expect(result).toEqual(responseData);
    });
  });

  describe('upsertUserProfile', () => {
    it('should PUT /user-profile and return data', async () => {
      const body = {
        height: 180,
        weight: 80,
        age: 30,
        activity: 1.55,
        goal: 'gain',
      } as const;
      const responseData = { ...body };
      mockPut.mockResolvedValue({ data: responseData });

      const result = await upsertUserProfile(body);

      expect(mockPut).toHaveBeenCalledWith('/user-profile', body);
      expect(result).toEqual(responseData);
    });
  });
});
