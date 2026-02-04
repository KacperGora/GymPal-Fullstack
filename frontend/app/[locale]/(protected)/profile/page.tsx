'use client';

import { Box, Typography, Skeleton, CircularProgress } from '@mui/material';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

import {
  EditFitnessDataModal,
  ProfileFitnessDataCard,
  ProfilePersonalInfoCard,
} from '@/features/profile/components';

import { useProfileStats } from '@/features/profile/hooks/useProfileStats';
import { useUserProfile } from '@/features/profile/queries/useUserProfile';
import { useRouter } from '@/i18n/navigation';
import { useAuth } from '@/shared/hooks/useAuth';

export default function Profile() {
  const t = useTranslations('profile');
  const { user, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);

  const { data: profile, isLoading: isProfileLoading } = useUserProfile(
    !!user?.hasProfile,
  );

  const { bmr, tdee, targetCalories, activityKey } = useProfileStats(profile);

  const handleEditOpen = () => {
    setEditOpen(true);
  };

  useEffect(() => {
    if (!isAuthLoading && user && !user.hasProfile) {
      router.replace('/welcome');
    }
  }, [isAuthLoading, router, user]);

  if (isAuthLoading || isProfileLoading) {
    return (
      <Box sx={{ maxWidth: 600, mx: 'auto', p: 3 }}>
        <Skeleton variant="rectangular" height={400} />
      </Box>
    );
  }

  if (!isAuthLoading && user && !user.hasProfile) {
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

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', p: 3 }}>
      <Typography variant="h4" gutterBottom>
        {t('title')}
      </Typography>
      <EditFitnessDataModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        profile={profile}
      />
      <ProfilePersonalInfoCard user={user} />
      <ProfileFitnessDataCard
        activityLabel={
          activityKey ? t(`activityLevels.${activityKey}`) : undefined
        }
        profile={profile}
        showEdit={!!user?.hasProfile}
        onEdit={handleEditOpen}
        bmr={bmr}
        tdee={tdee}
        targetCalories={targetCalories}
      />
    </Box>
  );
}
