'use client';

import {
  Box,
  Card,
  CardContent,
  Divider,
  Skeleton,
  Typography,
} from '@mui/material';
import { useTranslations } from 'next-intl';

import { glassCardSx } from '@/shared/theme/glass';

interface GoalCardProps {
  tdee: number;
  bmr: number;
  targetCalories: number;
  goal: string;
  isLoading?: boolean;
}

export const GoalCard = ({
  tdee,
  bmr,
  targetCalories,
  goal,
  isLoading,
}: GoalCardProps) => {
  const t = useTranslations('nutrition');

  const getGoalLabel = (goalKey: string) => {
    const goalLabels: Record<string, string> = {
      LOSE: t('goalLose'),
      MAINTAIN: t('goalMaintain'),
      GAIN: t('goalGain'),
    };
    return goalLabels[goalKey] || goalKey;
  };

  const getGoalColor = (goalKey: string) => {
    const colors: Record<string, string> = {
      LOSE: 'error.main',
      MAINTAIN: 'warning.main',
      GAIN: 'success.main',
    };
    return colors[goalKey] || 'text.primary';
  };

  if (isLoading) {
    return (
      <Card sx={glassCardSx}>
        <CardContent>
          <Skeleton variant="text" width={100} height={32} />
          <Skeleton variant="rectangular" height={120} sx={{ mt: 2 }} />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={glassCardSx}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {t('yourGoal')}
        </Typography>

        <Divider sx={{ mb: 2 }} />

        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
          <Box>
            <Typography variant="body2" color="text.secondary">
              BMR
            </Typography>
            <Typography variant="body1" fontWeight="medium">
              {bmr} kcal
            </Typography>
          </Box>

          <Box>
            <Typography variant="body2" color="text.secondary">
              TDEE
            </Typography>
            <Typography variant="body1" fontWeight="medium">
              {tdee} kcal
            </Typography>
          </Box>

          <Box>
            <Typography variant="body2" color="text.secondary">
              {t('goal')}
            </Typography>
            <Typography
              variant="body1"
              fontWeight="medium"
              color={getGoalColor(goal)}
            >
              {getGoalLabel(goal)}
            </Typography>
          </Box>

          <Box>
            <Typography variant="body2" color="text.secondary">
              {t('target')}
            </Typography>
            <Typography variant="body1" fontWeight="bold" color="primary">
              {targetCalories} kcal
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};
