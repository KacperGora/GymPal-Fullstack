'use client';

import { Grid, Paper, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';

import { Section } from './Section';
import { getProofHighlights } from './content';
import { landingPaddings, landingRadii, softCardSx } from './tokens';

export function ProofHighlights() {
  const t = useTranslations('landing');
  const proofHighlights = getProofHighlights(t);

  return (
    <Section>
      <Grid container spacing={{ xs: 3, md: 4 }}>
        {proofHighlights.map((card) => (
          <Grid size={{ xs: 12, md: 4 }} key={card.title}>
            <Paper
              elevation={0}
              sx={(theme) => ({
                p: landingPaddings.panel,
                borderRadius: landingRadii.lg,
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
    </Section>
  );
}
