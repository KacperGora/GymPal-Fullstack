'use client';

import { Paper } from '@mui/material';

export function AuthCard({ children }: { children: React.ReactNode }) {
  return (
    <Paper
      variant="glass"
      sx={{
        // maxWidth: { xs: 480, sm: 560 },
        mx: 'auto',
        mt: 2,
        p: 4,
      }}
    >
      {children}
    </Paper>
  );
}
