'use client';

import { Box, Skeleton, Typography } from '@mui/material';
import dayjs from 'dayjs';
import { useTranslations } from 'next-intl';

import {
  DashCalorieCard,
  DashGoalCard,
  DashMacrosCard,
  DashWaterCard,
  DashWeeklyChart,
  WorkoutFrequencyChart,
  MacroBreakdownChart,
} from '@/features/dashboard/components';

import { useAddWater, useRemoveWater } from '@/features/nutrition/mutations';
import {
  useMeals,
  useTdee,
  useWaterIntake,
  useWeeklyStats,
} from '@/features/nutrition/queries';
import { useWeeklyWorkoutStats } from '@/features/workouts/queries';
import { useAuth } from '@/shared/hooks/useAuth';

export default function Dashboard() {
  const t = useTranslations('dashboard');
  const { user, isLoading: isAuthLoading } = useAuth();

  const today = dayjs().format('YYYY-MM-DD');

  const { data: meals = [], isLoading: isMealsLoading } = useMeals(today);
  const { data: tdeeData, isLoading: isTdeeLoading } = useTdee(
    !!user?.hasProfile,
  );
  const { data: waterData, isLoading: isWaterLoading } = useWaterIntake(today);
  const { data: weeklyStats = [], isLoading: isWeeklyLoading } =
    useWeeklyStats(today);
  const { data: workoutStats = [], isLoading: isWorkoutStatsLoading } =
    useWeeklyWorkoutStats();

  const addWaterMutation = useAddWater(today);
  const removeWaterMutation = useRemoveWater(today);

  const dailyTotals = meals.reduce(
    (acc, meal) => ({
      calories: acc.calories + meal.calories,
      proteins: acc.proteins + meal.proteins,
      carbs: acc.carbs + meal.carbs,
      fats: acc.fats + meal.fats,
    }),
    { calories: 0, proteins: 0, carbs: 0, fats: 0 },
  );

  const targetCalories = tdeeData?.targetCalories ?? 2000;
  const targetProteins = tdeeData?.targetProteins ?? 150;
  const targetCarbs = tdeeData?.targetCarbs ?? 200;
  const targetFats = tdeeData?.targetFats ?? 65;

  if (isAuthLoading) {
    return (
      <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
        <Skeleton variant="rectangular" height={400} />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {t('greeting', { name: user?.firstName ?? '' })}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {t('subtitle')}
        </Typography>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
          gap: 3,
        }}
      >
        <DashCalorieCard
          consumed={dailyTotals.calories}
          target={targetCalories}
          isLoading={isMealsLoading || isTdeeLoading}
        />

        <DashGoalCard
          tdee={tdeeData?.tdee ?? 0}
          bmr={tdeeData?.bmr ?? 0}
          targetCalories={targetCalories}
          goal={tdeeData?.goal ?? 'MAINTAIN'}
          isLoading={isTdeeLoading || !tdeeData}
        />

        <DashMacrosCard
          proteins={Math.round(dailyTotals.proteins)}
          carbs={Math.round(dailyTotals.carbs)}
          fats={Math.round(dailyTotals.fats)}
          targetProteins={targetProteins}
          targetCarbs={targetCarbs}
          targetFats={targetFats}
          isLoading={isMealsLoading || isTdeeLoading}
        />

        <DashWaterCard
          glasses={waterData?.glasses ?? 0}
          isLoading={isWaterLoading}
          onAdd={() => addWaterMutation.mutate()}
          onRemove={() => removeWaterMutation.mutate()}
        />

        <Box sx={{ gridColumn: '1 / -1' }}>
          <DashWeeklyChart
            data={weeklyStats}
            targetCalories={targetCalories}
            isLoading={isWeeklyLoading}
          />
        </Box>

        <WorkoutFrequencyChart
          data={workoutStats}
          isLoading={isWorkoutStatsLoading}
        />

        <MacroBreakdownChart
          proteins={Math.round(dailyTotals.proteins)}
          carbs={Math.round(dailyTotals.carbs)}
          fats={Math.round(dailyTotals.fats)}
          isLoading={isMealsLoading || isTdeeLoading}
        />
      </Box>
    </Box>
  );
}
