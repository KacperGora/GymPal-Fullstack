'use client';

import { Box, CircularProgress, Typography } from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { useEffect } from 'react';

import { useRouter } from '@/i18n/navigation';
import { useAuth } from '@/shared/hooks/useAuth';

import { CalorieForm } from './components/CalorieForm';

export default function Home() {
  const t = useTranslations('welcome');
  const { user, isLoading } = useAuth();
  const queryClient = useQueryClient();
  const router = useRouter();

  const handleProfileCreated = async () => {
    await queryClient.invalidateQueries({ queryKey: ['me'] });
    router.replace('/profile');
  };

  useEffect(() => {
    if (user?.hasProfile) {
      router.replace('/profile');
    }
  }, [router, user?.hasProfile]);

  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: 'calc(100vh - 64px)',
          p: 2,
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!user?.hasProfile) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: 'calc(100vh - 64px)',
          p: 2,
        }}
      >
        <CalorieForm onSuccess={handleProfileCreated} />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 'calc(100vh - 64px)',
      }}
    >
      <Typography variant="h1">
        {t('title')}, {user?.firstName}!
      </Typography>
    </Box>
  );
}
