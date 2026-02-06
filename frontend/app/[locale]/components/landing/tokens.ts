import { alpha } from '@mui/material/styles';

import type { Theme } from '@mui/material/styles';

export const landingSectionSpacing = { mt: { xs: 6, md: 10 } };
export const landingSectionTight = { mt: { xs: 4, md: 6 } };
export const landingSectionWide = { mt: { xs: 8, md: 12 } };

export const landingContainerSx = {
  position: 'relative',
  py: { xs: 8, md: 12 },
};

export const landingShellSx = (theme: Theme) => ({
  minHeight: 'calc(100vh - 64px)',
  background: `
    radial-gradient(1200px 600px at 10% -10%, ${alpha(
      theme.palette.primary.main,
      0.35,
    )}, transparent 60%),
    radial-gradient(1000px 500px at 90% 0%, ${alpha(
      theme.palette.tertiary.main,
      0.25,
    )}, transparent 55%),
    linear-gradient(180deg, ${theme.palette.background.default} 0%, #0b0e12 45%, #0b0e12 100%)
  `,
  color: theme.palette.text.primary,
  position: 'relative',
  overflow: 'hidden',
});

export const landingGridOverlaySx = (theme: Theme) => ({
  position: 'absolute',
  inset: 0,
  backgroundImage: `linear-gradient(${alpha(
    theme.palette.common.white,
    0.04,
  )} 1px, transparent 1px), linear-gradient(90deg, ${alpha(
    theme.palette.common.white,
    0.04,
  )} 1px, transparent 1px)`,
  backgroundSize: '48px 48px',
  opacity: 0.25,
  pointerEvents: 'none',
});

export const landingRadii = {
  sm: 2,
  md: 2.5,
  lg: 3,
};

export const landingPaddings = {
  card: 2.5,
  panel: 3,
  panelResponsive: { xs: 3, md: 4 },
  metric: 2,
};

export const glassCardSx = (theme: Theme) => ({
  background: alpha(theme.palette.background.paper, 0.85),
  border: `1px solid ${alpha(theme.palette.common.white, 0.08)}`,
});

export const softCardSx = (theme: Theme) => ({
  background: alpha(theme.palette.common.white, 0.04),
  border: `1px solid ${alpha(theme.palette.common.white, 0.08)}`,
});

export const proofShellSx = (theme: Theme) => ({
  background: alpha(theme.palette.common.white, 0.02),
  border: `1px solid ${alpha(theme.palette.common.white, 0.08)}`,
});

export const proofMetricSx = (theme: Theme) => ({
  background: alpha(theme.palette.background.paper, 0.8),
  border: `1px solid ${alpha(theme.palette.common.white, 0.08)}`,
});

export const footerDividerSx = (theme: Theme) => ({
  borderTop: `1px solid ${alpha(theme.palette.common.white, 0.08)}`,
});
