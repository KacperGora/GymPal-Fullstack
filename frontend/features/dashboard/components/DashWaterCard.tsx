'use client';

import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import {
  Box,
  Card,
  CardContent,
  IconButton,
  LinearProgress,
  Skeleton,
  Typography,
} from '@mui/material';
import { useTranslations } from 'next-intl';

import { glassCardSx } from '@/shared/theme/glass';

interface DashWaterCardProps {
  glasses: number;
  target?: number;
  isLoading?: boolean;
  onAdd: () => void;
  onRemove: () => void;
}

export const DashWaterCard = ({
  glasses,
  target = 8,
  isLoading,
  onAdd,
  onRemove,
}: DashWaterCardProps) => {
  const t = useTranslations('dashboard');
  const progress = Math.min((glasses / target) * 100, 100);

  if (isLoading) {
    return (
      <Card sx={glassCardSx}>
        <CardContent>
          <Skeleton variant="text" width={100} height={28} />
          <Skeleton variant="rectangular" height={40} sx={{ mt: 2 }} />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={glassCardSx}>
      <CardContent>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            mb: 2,
          }}
        >
          <WaterDropIcon color="info" />
          <Typography variant="h6">{t('water')}</Typography>
        </Box>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton
              onClick={onRemove}
              disabled={glasses <= 0}
              size="small"
              color="primary"
            >
              <RemoveIcon />
            </IconButton>

            <Box sx={{ textAlign: 'center', minWidth: 70 }}>
              <Typography variant="h5" fontWeight="bold">
                {glasses}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                / {target} {t('glasses')}
              </Typography>
            </Box>

            <IconButton onClick={onAdd} size="small" color="primary">
              <AddIcon />
            </IconButton>
          </Box>
        </Box>

        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{
            height: 6,
            borderRadius: 3,
            backgroundColor: 'action.hover',
            '& .MuiLinearProgress-bar': {
              borderRadius: 3,
              backgroundColor: 'info.main',
            },
          }}
        />

        {glasses >= target && (
          <Typography
            variant="caption"
            color="success.main"
            sx={{ display: 'block', mt: 1, textAlign: 'center' }}
          >
            {t('waterGoalReached')}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};
