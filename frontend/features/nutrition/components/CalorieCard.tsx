'use client';

import {
  Box,
  Card,
  CardContent,
  CircularProgress,
  Typography,
} from '@mui/material';
import { useTranslations } from 'next-intl';

import { glassCardSx } from '@/shared/theme/glass';

interface CalorieCardProps {
  consumed: number;
  target: number;
  isLoading?: boolean;
}

export const CalorieCard = ({
  consumed,
  target,
  isLoading,
}: CalorieCardProps) => {
  const t = useTranslations('nutrition');
  const remaining = Math.max(0, target - consumed);
  const progress = target > 0 ? Math.min((consumed / target) * 100, 100) : 0;
  const isOverLimit = consumed > target;

  if (isLoading) {
    return (
      <Card sx={glassCardSx}>
        <CardContent>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: 200,
            }}
          >
            <CircularProgress />
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={glassCardSx}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {t('calories')}
        </Typography>

        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            py: 2,
          }}
        >
          <Box sx={{ position: 'relative', display: 'inline-flex' }}>
            <CircularProgress
              variant="determinate"
              value={100}
              size={160}
              thickness={4}
              sx={{ color: 'action.hover' }}
            />
            <CircularProgress
              variant="determinate"
              value={progress}
              size={160}
              thickness={4}
              sx={{
                position: 'absolute',
                left: 0,
                color: isOverLimit ? 'error.main' : 'primary.main',
              }}
            />
            <Box
              sx={{
                top: 0,
                left: 0,
                bottom: 0,
                right: 0,
                position: 'absolute',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Typography
                variant="h4"
                component="div"
                fontWeight="bold"
                color={isOverLimit ? 'error.main' : 'text.primary'}
              >
                {consumed}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                / {target} kcal
              </Typography>
            </Box>
          </Box>

          <Box sx={{ mt: 2, textAlign: 'center' }}>
            {isOverLimit ? (
              <Typography color="error.main" fontWeight="medium">
                +{consumed - target} kcal {t('overLimit')}
              </Typography>
            ) : (
              <Typography color="text.secondary">
                {remaining} kcal {t('remaining')}
              </Typography>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};
