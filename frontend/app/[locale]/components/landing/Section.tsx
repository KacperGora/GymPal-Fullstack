'use client';

import { Box } from '@mui/material';

import type { SxProps, Theme } from '@mui/material/styles';
import type { ReactNode } from 'react';

import { landingSectionSpacing } from './tokens';

type SectionProps = {
  children: ReactNode;
  sx?: SxProps<Theme>;
  spacing?: SxProps<Theme>;
};

export function Section({
  children,
  sx,
  spacing = landingSectionSpacing,
}: SectionProps) {
  return (
    <Box sx={[spacing, ...(Array.isArray(sx) ? sx : [sx])]}>{children}</Box>
  );
}
