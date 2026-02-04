'use client';

import { Box, Button, Typography } from '@mui/material';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 'calc(100vh - 64px)',
        gap: 2,
      }}
    >
      <Typography variant="h2">Coś poszło nie tak</Typography>
      <Typography variant="body1" color="text.secondary">
        {error.message}
      </Typography>
      <Button variant="contained" onClick={reset}>
        Spróbuj ponownie
      </Button>
    </Box>
  );
}
