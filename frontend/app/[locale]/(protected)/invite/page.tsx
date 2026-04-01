'use client';

import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Typography,
} from '@mui/material';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

import { useAcceptInvite } from '@/features/trainer/mutations';
import { useRouter } from '@/i18n/navigation';

const InvitePage = () => {
  const t = useTranslations('invite');
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
        <Alert severity="error">{t('invalidLink')}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 480, mx: 'auto', mt: 8, p: 3, textAlign: 'center' }}>
      <Typography variant="h5" gutterBottom>
        {t('title')}
      </Typography>

      {accepted ? (
        <Alert severity="success" sx={{ mt: 2 }}>
          {t('accepted')}
        </Alert>
      ) : (
        <>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            {t('description')}
          </Typography>

          {isError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {(error as Error)?.message ?? t('error')}
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
            {isPending ? <CircularProgress size={24} /> : t('accept')}
          </Button>
        </>
      )}
    </Box>
  );
};

export default InvitePage;
