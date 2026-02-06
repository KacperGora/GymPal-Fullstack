'use client';

import { Box, Grid, Stack, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';

import { Section } from './Section';
import { getFooterColumns } from './content';
import { footerDividerSx } from './tokens';

export function LandingFooter() {
  const t = useTranslations('landing');
  const footerColumns = getFooterColumns(t);

  return (
    <Section>
      <Box
        component="footer"
        sx={(theme) => ({
          pt: { xs: 4, md: 6 },
          pb: { xs: 5, md: 7 },
          ...footerDividerSx(theme),
        })}
      >
        <Grid container spacing={4}>
          <Grid size={{ xs: 12, md: 5 }}>
            <Stack spacing={1.5}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                GymPal
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                {t('footer.description')}
              </Typography>
            </Stack>
          </Grid>
          <Grid size={{ xs: 12, md: 7 }}>
            <Grid container spacing={2}>
              {footerColumns.map((col) => (
                <Grid size={{ xs: 6, md: 4 }} key={col.title}>
                  <Stack spacing={1}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      {col.title}
                    </Typography>
                    {col.items.map((item) => (
                      <Typography
                        key={item}
                        variant="body2"
                        sx={{ color: 'text.secondary' }}
                      >
                        {item}
                      </Typography>
                    ))}
                  </Stack>
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Grid>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          sx={{ mt: { xs: 4, md: 6 }, color: 'text.secondary' }}
        >
          <Typography variant="caption">{t('footer.copyright')}</Typography>
          <Typography variant="caption">{t('footer.tagline')}</Typography>
        </Stack>
      </Box>
    </Section>
  );
}
