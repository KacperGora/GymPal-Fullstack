import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { useProfileStats } from './useProfileStats';

describe('useProfileStats', () => {
  it('should return zeros when profile is missing', () => {
    const { result } = renderHook(() => useProfileStats(null));

    expect(result.current).toEqual({
      bmr: 0,
      tdee: 0,
      targetCalories: 0,
    });
  });

  it('should calculate stats and activity key', () => {
    const profile = {
      height: 180,
      weight: 80,
      age: 30,
      activity: 1.55,
      goal: 'lose' as const,
    };

    const { result } = renderHook(() => useProfileStats(profile));

    expect(result.current.bmr).toBe(1780);
    expect(result.current.tdee).toBe(2759);
    expect(result.current.targetCalories).toBe(2259);
    expect(result.current.activityKey).toBe('moderate');
  });
});
