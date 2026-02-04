'use client';

import { Box, Skeleton, Typography } from '@mui/material';
import dayjs, { Dayjs } from 'dayjs';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import {
  AddMealModal,
  CalorieCard,
  DayNavigation,
  GoalCard,
  MacrosCard,
  MealsCard,
  NutritionTipsCard,
  QuickAddMealsCard,
  WaterCard,
  WeeklyChart,
} from '@/features/nutrition/components';

import {
  useDeleteMeal,
  useAddMeal,
  useRemoveWater,
  useAddWater,
} from '@/features/nutrition/mutations';
import {
  useWeeklyStats,
  useWaterIntake,
  useTdee,
  useMeals,
} from '@/features/nutrition/queries';
import { useAuth } from '@/shared/hooks/useAuth';

const formatDateForApi = (date: Dayjs): string => {
  return date.format('YYYY-MM-DD');
};

const formatMealDateIso = (date: Dayjs): string =>
  `${date.format('YYYY-MM-DD')}T12:00:00.000Z`;

export default function Nutrition() {
  const t = useTranslations('nutrition');
  const { user, isLoading: isAuthLoading } = useAuth();

  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [addMealOpen, setAddMealOpen] = useState(false);

  const dateString = formatDateForApi(selectedDate);
  const mealDateIso = formatMealDateIso(selectedDate);

  const { data: meals = [], isLoading: isMealsLoading } = useMeals(dateString);

  const { data: tdeeData, isLoading: isTdeeLoading } = useTdee(
    !!user?.hasProfile,
  );

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
  const targetProteins = 150;
  const targetCarbs = 200;
  const targetFats = 65;
  const remainingProteins = targetProteins - dailyTotals.proteins;
  const remainingCarbs = targetCarbs - dailyTotals.carbs;
  const remainingFats = targetFats - dailyTotals.fats;
  const remainingCalories = targetCalories - dailyTotals.calories;

  const addMealMutation = useAddMeal({
    onSuccess: () => setAddMealOpen(false),
  });
  const deleteMealMutation = useDeleteMeal();

  const { data: waterData, isLoading: isWaterLoading } =
    useWaterIntake(dateString);
  const addWaterMutation = useAddWater(dateString);
  const removeWaterMutation = useRemoveWater(dateString);

  const { data: weeklyStats = [], isLoading: isWeeklyLoading } =
    useWeeklyStats(dateString);

  const handlePrevDay = () => {
    setSelectedDate((prev) => prev.subtract(1, 'day'));
  };

  const handleNextDay = () => {
    setSelectedDate((prev) => prev.add(1, 'day'));
  };

  const handleToday = () => {
    setSelectedDate(dayjs());
  };

  if (isAuthLoading) {
    return (
      <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
        <Skeleton variant="rectangular" height={400} />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      <Box sx={{ mb: 2 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {t('greeting', { name: user?.firstName ?? '' })}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {t('trackMeals')}
        </Typography>
      </Box>

      <DayNavigation
        date={selectedDate}
        onPrevDay={handlePrevDay}
        onNextDay={handleNextDay}
        onToday={handleToday}
      />

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
          gap: 3,
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <CalorieCard
            consumed={dailyTotals.calories}
            target={targetCalories}
            isLoading={isMealsLoading || isTdeeLoading}
          />
          <MealsCard
            meals={meals}
            isLoading={isMealsLoading}
            onAddClick={() => setAddMealOpen(true)}
            onDeleteMeal={(id) => deleteMealMutation.mutate(id)}
          />
          <QuickAddMealsCard
            onQuickAdd={(meal) =>
              addMealMutation.mutate({
                ...meal,
                date: mealDateIso,
              })
            }
          />
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <MacrosCard
            proteins={Math.round(dailyTotals.proteins)}
            carbs={Math.round(dailyTotals.carbs)}
            fats={Math.round(dailyTotals.fats)}
            targetProteins={targetProteins}
            targetCarbs={targetCarbs}
            targetFats={targetFats}
            isLoading={isMealsLoading}
          />
          <NutritionTipsCard
            remainingCalories={remainingCalories}
            remainingProteins={remainingProteins}
            remainingCarbs={remainingCarbs}
            remainingFats={remainingFats}
          />
          <WaterCard
            glasses={waterData?.glasses ?? 0}
            isLoading={isWaterLoading}
            onAdd={() => addWaterMutation.mutate()}
            onRemove={() => removeWaterMutation.mutate()}
          />
          <GoalCard
            tdee={tdeeData?.tdee ?? 0}
            bmr={tdeeData?.bmr ?? 0}
            targetCalories={targetCalories}
            goal={tdeeData?.goal ?? 'MAINTAIN'}
            isLoading={isTdeeLoading || !tdeeData}
          />
        </Box>
      </Box>

      <Box sx={{ mt: 3 }}>
        <WeeklyChart
          data={weeklyStats}
          targetCalories={targetCalories}
          isLoading={isWeeklyLoading}
        />
      </Box>

      <AddMealModal
        open={addMealOpen}
        onClose={() => setAddMealOpen(false)}
        onSubmit={(data) => addMealMutation.mutate(data)}
        isLoading={addMealMutation.isPending}
        selectedDate={mealDateIso}
      />
    </Box>
  );
}
