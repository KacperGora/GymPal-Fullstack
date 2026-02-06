'use client';

import { Grid, Paper, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';

import { Section } from './Section';
import { getProofMetrics } from './content';
import {
  landingPaddings,
  landingRadii,
  proofMetricSx,
  proofShellSx,
} from './tokens';

export function ProofMetrics() {
  const t = useTranslations('landing');
  const proofMetrics = getProofMetrics(t);

  return (
    <Section>
      <Paper
        elevation={0}
        sx={(theme) => ({
          p: landingPaddings.panelResponsive,
          borderRadius: landingRadii.lg,
          ...proofShellSx(theme),
        })}
      >
        <Grid container spacing={3} alignItems="center">
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="h5" component="h2" sx={{ fontWeight: 700 }}>
              {t('proofMetrics.title')}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
              {t('proofMetrics.body')}
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Grid container spacing={2}>
              {proofMetrics.map((stat) => (
                <Grid size={6} key={stat.label}>
                  <Paper
                    elevation={0}
                    sx={(theme) => ({
                      p: landingPaddings.metric,
                      borderRadius: landingRadii.md,
                      ...proofMetricSx(theme),
                    })}
                  >
                    <Typography
                      variant="h6"
                      sx={{ fontWeight: 700, color: 'primary.main' }}
                    >
                      {stat.value}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ color: 'text.secondary' }}
                    >
                      {stat.label}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Grid>
      </Paper>
    </Section>
  );
}
