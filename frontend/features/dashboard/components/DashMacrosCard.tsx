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

import { glassCardSx } from './glass';

interface MacroRowProps {
  label: string;
  value: number;
  target: number;
  color: 'primary' | 'warning' | 'error';
}

const MacroRow = ({ label, value, target, color }: MacroRowProps) => {
  const progress = target > 0 ? Math.min((value / target) * 100, 100) : 0;

  return (
    <Box sx={{ mb: 1.5 }}>
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
          {value}g / {target}g
        </Typography>
      </Box>
      <LinearProgress
        variant="determinate"
        value={progress}
        color={color}
        sx={{
          height: 6,
          borderRadius: 3,
          backgroundColor: 'action.hover',
        }}
      />
    </Box>
  );
};

interface DashMacrosCardProps {
  proteins: number;
  carbs: number;
  fats: number;
  targetProteins: number;
  targetCarbs: number;
  targetFats: number;
  isLoading?: boolean;
}

export const DashMacrosCard = ({
  proteins,
  carbs,
  fats,
  targetProteins,
  targetCarbs,
  targetFats,
  isLoading,
}: DashMacrosCardProps) => {
  const t = useTranslations('dashboard');

  if (isLoading) {
    return (
      <Card sx={glassCardSx}>
        <CardContent>
          <Skeleton variant="text" width={100} height={28} />
          <Skeleton variant="rectangular" height={80} sx={{ mt: 2 }} />
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

        <Box sx={{ mt: 1 }}>
          <MacroRow
            label={t('proteins')}
            value={proteins}
            target={targetProteins}
            color="primary"
          />
          <MacroRow
            label={t('carbs')}
            value={carbs}
            target={targetCarbs}
            color="warning"
          />
          <MacroRow
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
