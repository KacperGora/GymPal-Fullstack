'use client';

import { Box, Chip, Grid, Paper, Stack, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';

import { Section } from './Section';
import { getNutritionCards, getNutritionStats } from './content';
import { glassCardSx, landingPaddings, landingRadii } from './tokens';

export function NutritionSection() {
  const t = useTranslations('landing');
  const nutritionStats = getNutritionStats(t);
  const nutritionCards = getNutritionCards(t);

  return (
    <Section>
      <Grid container spacing={{ xs: 4, md: 6 }}>
        <Grid size={{ xs: 12, md: 5 }}>
          <Stack spacing={2.5}>
            <Chip
              label={t('nutrition.chip')}
              color="primary"
              variant="outlined"
            />
            <Typography variant="h4" component="h2" sx={{ fontWeight: 700 }}>
              {t('nutrition.title')}
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary' }}>
              {t('nutrition.body')}
            </Typography>
            <Stack direction="row" spacing={3}>
              {nutritionStats.map((stat) => (
                <Box key={stat.label}>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 700, color: 'secondary.main' }}
                  >
                    {stat.value}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ color: 'text.secondary' }}
                  >
                    {stat.label}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Stack>
        </Grid>
        <Grid size={{ xs: 12, md: 7 }}>
          <Grid container spacing={2}>
            {nutritionCards.map((card) => (
              <Grid size={{ xs: 12, sm: 6 }} key={card.title}>
                <Paper
                  elevation={0}
                  sx={(theme) => ({
                    p: landingPaddings.card,
                    borderRadius: landingRadii.md,
                    ...glassCardSx(theme),
                    height: '100%',
                  })}
                >
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    {card.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: 'text.secondary', mt: 1 }}
                  >
                    {card.text}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Grid>
      </Grid>
    </Section>
  );
}
