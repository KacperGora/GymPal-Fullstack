'use client';

import PersonIcon from '@mui/icons-material/Person';
import { Box, Card, CardContent, Skeleton, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';

import { useMyTrainer } from '@/features/trainer/queries';

const TrainerInfoPage = () => {
  const t = useTranslations('trainerInfo');
  const { data: trainer, isLoading } = useMyTrainer();

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', p: 3 }}>
      <Typography variant="h5" gutterBottom>
        {t('title')}
      </Typography>

      {isLoading ? (
        <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 2 }} />
      ) : trainer ? (
        <Card>
          <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <PersonIcon sx={{ fontSize: 48, color: 'text.secondary' }} />
            <Box>
              <Typography variant="h6">
                {trainer.firstName} {trainer.lastName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {trainer.email}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      ) : (
        <Typography variant="body1" color="text.secondary">
          {t('noTrainer')}
        </Typography>
      )}
    </Box>
  );
};

export default TrainerInfoPage;
