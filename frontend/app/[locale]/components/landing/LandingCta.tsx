'use client';

import { Button, Grid, Paper, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useTranslations } from 'next-intl';

import { Section } from './Section';
import { landingPaddings, landingRadii, landingSectionWide } from './tokens';

export function LandingCta() {
  const t = useTranslations('landing');

  return (
    <Section spacing={landingSectionWide}>
      <Paper
        elevation={0}
        sx={(theme) => ({
          p: landingPaddings.panelResponsive,
          borderRadius: landingRadii.lg,
          background: `linear-gradient(135deg, ${alpha(
            theme.palette.primary.main,
            0.22,
          )}, ${alpha(theme.palette.tertiary.main, 0.18)})`,
          border: `1px solid ${alpha(theme.palette.common.white, 0.12)}`,
        })}
      >
        <Grid container spacing={3} alignItems="center">
          <Grid size={{ xs: 12, md: 8 }}>
            <Typography variant="h4" component="h2" sx={{ fontWeight: 700 }}>
              {t('cta.title')}
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', mt: 1 }}>
              {t('cta.body')}
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              justifyContent="flex-end"
            >
              <Button fullWidth variant="contained" color="primary">
                {t('cta.primaryCta')}
              </Button>
              <Button fullWidth variant="outlined" color="secondary">
                {t('cta.secondaryCta')}
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </Paper>
    </Section>
  );
}
