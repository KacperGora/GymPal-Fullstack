import { useMemo } from 'react';

import {
  calculateBMR,
  calculateTargetCalories,
  calculateTDEE,
} from '@/shared/utils';

import { ACTIVITY_LEVELS } from '../constants';
import type { UserProfile } from '../types';

interface UseProfileStatsResult {
  bmr: number;
  tdee: number;
  targetCalories: number;
  activityKey?: string;
}

export const useProfileStats = (
  profile?: UserProfile | null,
): UseProfileStatsResult =>
  useMemo(() => {
    if (!profile) {
      return {
        bmr: 0,
        tdee: 0,
        targetCalories: 0,
      };
    }

    const bmr = calculateBMR(profile.weight, profile.height, profile.age);
    const tdee = calculateTDEE(bmr, profile.activity);
    const targetCalories = calculateTargetCalories(tdee, profile.goal);
    const activityKey = ACTIVITY_LEVELS.find(
      (level) => level.value === profile.activity,
    )?.key;

    return { bmr, tdee, targetCalories, activityKey };
  }, [profile]);
