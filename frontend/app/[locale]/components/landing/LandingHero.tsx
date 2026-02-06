'use client';

import {
  Box,
  Button,
  Chip,
  Grid,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import { useTranslations } from 'next-intl';

import { getFeatureCards, getHeroStats, getWorkoutRows } from './content';
import {
  glassCardSx,
  landingPaddings,
  landingRadii,
  softCardSx,
} from './tokens';

export function LandingHero() {
  const t = useTranslations('landing');
  const heroStats = getHeroStats(t);
  const workoutRows = getWorkoutRows(t);
  const featureCards = getFeatureCards(t);

  return (
    <Grid container spacing={{ xs: 6, md: 10 }} alignItems="center">
      <Grid size={{ xs: 12, md: 6 }}>
        <Stack spacing={3}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Chip
              label={t('hero.badge')}
              color="secondary"
              variant="outlined"
              sx={{ fontWeight: 600 }}
            />
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {t('hero.kicker')}
            </Typography>
          </Stack>
          <Typography
            variant="h2"
            component="h1"
            sx={{
              fontWeight: 700,
              letterSpacing: '-0.02em',
              lineHeight: 1.05,
              fontSize: { xs: '2.6rem', md: '3.6rem' },
            }}
          >
            {t('hero.title')}
          </Typography>
          <Typography
            variant="h6"
            sx={{ color: 'text.secondary', fontWeight: 400, maxWidth: 520 }}
          >
            {t('hero.subtitle')}
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <Button
              variant="contained"
              color="primary"
              size="large"
              sx={{ px: 3.5 }}
            >
              {t('hero.primaryCta')}
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              size="large"
              sx={{ px: 3.5 }}
            >
              {t('hero.secondaryCta')}
            </Button>
          </Stack>
          <Stack direction="row" spacing={4} sx={{ pt: 2 }}>
            {heroStats.map((stat) => (
              <Box key={stat.label}>
                <Typography
                  variant="h5"
                  sx={{ fontWeight: 700, color: 'primary.main' }}
                >
                  {stat.value}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {stat.label}
                </Typography>
              </Box>
            ))}
          </Stack>
        </Stack>
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <Stack spacing={3}>
          <Paper
            elevation={0}
            sx={(theme) => ({
              p: landingPaddings.panel,
              borderRadius: landingRadii.lg,
              ...glassCardSx(theme),
              backdropFilter: 'blur(10px)',
            })}
          >
            <Stack spacing={2}>
              <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                {t('workout.eyebrow')}
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                {t('workout.title')}
              </Typography>
              <Stack spacing={1.5}>
                {workoutRows.map((row) => (
                  <Stack
                    key={row.name}
                    direction="row"
                    justifyContent="space-between"
                    sx={(theme) => ({
                      ...softCardSx(theme),
                      borderRadius: landingRadii.sm,
                      px: 2,
                      py: 1.5,
                    })}
                  >
                    <Typography variant="body1">{row.name}</Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: 'text.secondary' }}
                    >
                      {row.sets}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            </Stack>
          </Paper>
          <Grid container spacing={2}>
            {featureCards.map((card) => (
              <Grid size={{ xs: 12, sm: 6 }} key={card.title}>
                <Paper
                  elevation={0}
                  sx={(theme) => ({
                    p: landingPaddings.card,
                    borderRadius: landingRadii.md,
                    ...softCardSx(theme),
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
        </Stack>
      </Grid>
    </Grid>
  );
}
