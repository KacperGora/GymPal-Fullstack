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
  background:
    theme.palette.mode === 'dark'
      ? `
        radial-gradient(1200px 600px at 10% -10%, ${alpha(
          theme.palette.primary.main,
          0.35,
        )}, transparent 60%),
        radial-gradient(1000px 500px at 90% 0%, ${alpha(
          theme.palette.tertiary.main,
          0.25,
        )}, transparent 55%),
        linear-gradient(180deg, ${theme.palette.background.default} 0%, #0b0e12 45%, #0b0e12 100%)
      `
      : `
        radial-gradient(1200px 600px at 10% -10%, ${alpha(
          theme.palette.primary.main,
          0.24,
        )}, transparent 60%),
        radial-gradient(1000px 500px at 90% 0%, ${alpha(
          theme.palette.tertiary.main,
          0.2,
        )}, transparent 55%),
        radial-gradient(900px 420px at 50% 90%, ${alpha(
          theme.palette.common.white,
          0.65,
        )}, transparent 70%),
        linear-gradient(180deg, ${theme.palette.background.default} 0%, ${theme.palette.background.paper} 55%, ${theme.palette.background.default} 100%)
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
  background:
    theme.palette.mode === 'dark'
      ? alpha(theme.palette.background.paper, 0.85)
      : alpha(theme.palette.background.paper, 0.75),
  border:
    theme.palette.mode === 'dark'
      ? `1px solid ${alpha(theme.palette.common.white, 0.08)}`
      : `1px solid ${alpha(theme.palette.common.black, 0.08)}`,
  backdropFilter: 'blur(10px)',
  boxShadow:
    theme.palette.mode === 'dark'
      ? 'none'
      : `0 10px 30px ${alpha(theme.palette.common.black, 0.08)}`,
});

export const softCardSx = (theme: Theme) => ({
  background:
    theme.palette.mode === 'dark'
      ? alpha(theme.palette.common.white, 0.04)
      : alpha(theme.palette.common.white, 0.7),
  border:
    theme.palette.mode === 'dark'
      ? `1px solid ${alpha(theme.palette.common.white, 0.08)}`
      : `1px solid ${alpha(theme.palette.common.black, 0.06)}`,
  backdropFilter: 'blur(10px)',
  boxShadow:
    theme.palette.mode === 'dark'
      ? 'none'
      : `0 12px 28px ${alpha(theme.palette.common.black, 0.08)}`,
});

export const proofShellSx = (theme: Theme) => ({
  background:
    theme.palette.mode === 'dark'
      ? alpha(theme.palette.common.white, 0.02)
      : alpha(theme.palette.common.white, 0.75),
  border:
    theme.palette.mode === 'dark'
      ? `1px solid ${alpha(theme.palette.common.white, 0.08)}`
      : `1px solid ${alpha(theme.palette.common.black, 0.06)}`,
  backdropFilter: 'blur(10px)',
  boxShadow:
    theme.palette.mode === 'dark'
      ? 'none'
      : `0 16px 32px ${alpha(theme.palette.common.black, 0.08)}`,
});

export const proofMetricSx = (theme: Theme) => ({
  background:
    theme.palette.mode === 'dark'
      ? alpha(theme.palette.background.paper, 0.8)
      : alpha(theme.palette.background.paper, 0.9),
  border:
    theme.palette.mode === 'dark'
      ? `1px solid ${alpha(theme.palette.common.white, 0.08)}`
      : `1px solid ${alpha(theme.palette.common.black, 0.06)}`,
  backdropFilter: 'blur(10px)',
  boxShadow:
    theme.palette.mode === 'dark'
      ? 'none'
      : `0 10px 24px ${alpha(theme.palette.common.black, 0.07)}`,
});

export const footerDividerSx = (theme: Theme) => ({
  borderTop: `1px solid ${alpha(theme.palette.common.white, 0.08)}`,
});
