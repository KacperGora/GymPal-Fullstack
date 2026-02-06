'use client';

import { Box, Container } from '@mui/material';

import type { ReactNode } from 'react';

import {
  landingContainerSx,
  landingGridOverlaySx,
  landingShellSx,
} from './tokens';

export function LandingShell({ children }: { children: ReactNode }) {
  return (
    <Box component="main" sx={(theme) => landingShellSx(theme)}>
      <Box aria-hidden sx={(theme) => landingGridOverlaySx(theme)} />
      <Container sx={landingContainerSx}>{children}</Container>
    </Box>
  );
}
