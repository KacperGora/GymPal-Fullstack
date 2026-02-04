'use client';

import { Box, Card, CardContent, Divider, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';

interface NutritionTipsCardProps {
  remainingCalories: number;
  remainingProteins: number;
  remainingCarbs: number;
  remainingFats: number;
}

const clamp = (value: number) => Math.round(value);

export const NutritionTipsCard = ({
  remainingCalories,
  remainingProteins,
  remainingCarbs,
  remainingFats,
}: NutritionTipsCardProps) => {
  const t = useTranslations('nutrition');

  const tips: string[] = [];

  if (remainingCalories < -50) {
    tips.push(
      t('tips.overCalories', { value: Math.abs(clamp(remainingCalories)) }),
    );
  } else if (remainingCalories <= 100) {
    tips.push(t('tips.onTrack'));
  }

  if (remainingProteins > 20) {
    tips.push(t('tips.moreProtein', { value: clamp(remainingProteins) }));
  }
  if (remainingCarbs > 30) {
    tips.push(t('tips.moreCarbs', { value: clamp(remainingCarbs) }));
  }
  if (remainingFats > 15) {
    tips.push(t('tips.moreFats', { value: clamp(remainingFats) }));
  }

  if (tips.length === 0) {
    tips.push(t('tips.allDone'));
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h6">{t('tips.title')}</Typography>
        <Divider sx={{ my: 1.5 }} />
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {tips.map((tip) => (
            <Typography key={tip} variant="body2" color="text.secondary">
              {tip}
            </Typography>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
};
