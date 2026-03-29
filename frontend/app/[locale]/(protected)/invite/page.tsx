'use client';

import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Typography,
} from '@mui/material';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import { useAcceptInvite } from '@/features/trainer/mutations';

const InvitePage = () => {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const router = useRouter();
  const [accepted, setAccepted] = useState(false);

  const { mutate, isPending, isError, error } = useAcceptInvite();

  useEffect(() => {
    if (accepted) {
      const timeout = setTimeout(() => router.replace('/dashboard'), 2000);
      return () => clearTimeout(timeout);
    }
  }, [accepted, router]);

  if (!token) {
    return (
      <Box sx={{ maxWidth: 480, mx: 'auto', mt: 8, p: 3 }}>
        <Alert severity="error">Nieprawidłowy link zaproszenia.</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 480, mx: 'auto', mt: 8, p: 3, textAlign: 'center' }}>
      <Typography variant="h5" gutterBottom>
        Zaproszenie od trenera
      </Typography>

      {accepted ? (
        <Alert severity="success" sx={{ mt: 2 }}>
          Zaproszenie zaakceptowane! Przekierowuję...
        </Alert>
      ) : (
        <>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Kliknij poniżej, aby połączyć się ze swoim trenerem.
          </Typography>

          {isError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {(error as Error)?.message ?? 'Wystąpił błąd. Spróbuj ponownie.'}
            </Alert>
          )}

          <Button
            variant="contained"
            size="large"
            disabled={isPending}
            onClick={() =>
              mutate(token, {
                onSuccess: () => setAccepted(true),
              })
            }
          >
            {isPending ? (
              <CircularProgress size={24} />
            ) : (
              'Akceptuj zaproszenie'
            )}
          </Button>
        </>
      )}
    </Box>
  );
};

export default InvitePage;
