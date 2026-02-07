'use client';

import { Button, Grid, Paper, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useTranslations } from 'next-intl';

import { Section } from './Section';
import { landingPaddings, landingRadii } from './tokens';

export function SyncPanel() {
  const t = useTranslations('landing');

  return (
    <Section>
      <Paper
        elevation={0}
        sx={(theme) => ({
          p: landingPaddings.panelResponsive,
          borderRadius: landingRadii.lg,
          background:
            theme.palette.mode === 'dark'
              ? alpha(theme.palette.background.paper, 0.9)
              : alpha(theme.palette.background.paper, 0.8),
          border:
            theme.palette.mode === 'dark'
              ? `1px solid ${alpha(theme.palette.common.white, 0.1)}`
              : `1px solid ${alpha(theme.palette.common.black, 0.06)}`,
          backdropFilter: 'blur(10px)',
          boxShadow:
            theme.palette.mode === 'dark'
              ? 'none'
              : `0 16px 32px ${alpha(theme.palette.common.black, 0.08)}`,
        })}
      >
        <Grid container spacing={3} alignItems="center">
          <Grid size={{ xs: 12, md: 7 }}>
            <Typography variant="h5" component="h2" sx={{ fontWeight: 700 }}>
              {t('sync.title')}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
              {t('sync.body')}
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, md: 5 }}>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              justifyContent="flex-end"
            >
              <Button variant="contained" color="secondary">
                {t('sync.primaryCta')}
              </Button>
              <Button variant="outlined" color="primary">
                {t('sync.secondaryCta')}
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </Paper>
    </Section>
  );
}
