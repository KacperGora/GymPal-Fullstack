'use client';

import {
  Box,
  Card,
  CardContent,
  LinearProgress,
  Skeleton,
  Typography,
} from '@mui/material';
import { useTranslations } from 'next-intl';

import { glassCardSx } from '@/shared/theme/glass';

interface MacroItemProps {
  label: string;
  value: number;
  target: number;
  color: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';
  unit?: string;
}

const MacroItem = ({
  label,
  value,
  target,
  color,
  unit = 'g',
}: MacroItemProps) => {
  const progress = target > 0 ? Math.min((value / target) * 100, 100) : 0;

  return (
    <Box sx={{ mb: 2 }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 0.5,
        }}
      >
        <Typography variant="body2" color="text.secondary">
          {label}
        </Typography>
        <Typography variant="body2" fontWeight="medium">
          {value}
          {unit} / {target}
          {unit}
        </Typography>
      </Box>
      <LinearProgress
        variant="determinate"
        value={progress}
        color={color}
        sx={{
          height: 8,
          borderRadius: 4,
          backgroundColor: 'action.hover',
        }}
      />
    </Box>
  );
};

interface MacrosCardProps {
  proteins: number;
  carbs: number;
  fats: number;
  targetProteins?: number;
  targetCarbs?: number;
  targetFats?: number;
  isLoading?: boolean;
}

export const MacrosCard = ({
  proteins,
  carbs,
  fats,
  targetProteins = 150,
  targetCarbs = 200,
  targetFats = 65,
  isLoading,
}: MacrosCardProps) => {
  const t = useTranslations('nutrition');

  if (isLoading) {
    return (
      <Card sx={glassCardSx}>
        <CardContent>
          <Skeleton variant="text" width={120} height={32} />
          <Skeleton variant="rectangular" height={100} sx={{ mt: 2 }} />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={glassCardSx}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {t('macros')}
        </Typography>

        <Box sx={{ mt: 2 }}>
          <MacroItem
            label={t('proteins')}
            value={proteins}
            target={targetProteins}
            color="primary"
          />
          <MacroItem
            label={t('carbs')}
            value={carbs}
            target={targetCarbs}
            color="warning"
          />
          <MacroItem
            label={t('fats')}
            value={fats}
            target={targetFats}
            color="error"
          />
        </Box>
      </CardContent>
    </Card>
  );
};
