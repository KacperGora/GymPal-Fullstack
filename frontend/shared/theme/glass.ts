import { alpha } from '@mui/material/styles';

import type { Theme } from '@mui/material/styles';

export const glassCardSx = (theme: Theme) => ({
  position: 'relative',
  overflow: 'hidden',
  border: 'none',
  background: alpha(theme.palette.background.paper, 0.85),
  backdropFilter: 'blur(4px)',
  '&::before': {
    content: '""',
    position: 'absolute',
    inset: 0,
    background: `radial-gradient(420px circle at 20% 0%, ${alpha(
      theme.palette.primary.main,
      0.06,
    )}, transparent 55%)`,
    pointerEvents: 'none',
  },
  '& > .MuiCardContent-root': {
    position: 'relative',
  },
});
