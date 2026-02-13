'use client';

import { Snackbar, Alert } from '@mui/material';

import { useSnackbarStore } from '../stores/useSnackbarStore';

const SNACKBAR_HEIGHT = 68;

export function SnackbarManager() {
  const { snackbars, hideSnackbar } = useSnackbarStore();

  return (
    <>
      {snackbars.map((snackbar, index) => (
        <Snackbar
          key={snackbar.id}
          open={true}
          autoHideDuration={snackbar.autoHideDuration}
          onClose={() => hideSnackbar(snackbar.id)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          sx={{
            bottom: {
              xs: 16 + index * SNACKBAR_HEIGHT,
              sm: 24 + index * SNACKBAR_HEIGHT,
            },
          }}
        >
          <Alert
            onClose={() => hideSnackbar(snackbar.id)}
            severity={snackbar.severity}
            variant="filled"
            role="alert"
            aria-live="assertive"
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      ))}
    </>
  );
}
