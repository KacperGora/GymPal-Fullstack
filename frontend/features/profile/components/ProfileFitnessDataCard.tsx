import EditIcon from '@mui/icons-material/Edit';
import {
  Alert,
  Box,
  Card,
  CardContent,
  Divider,
  IconButton,
  Typography,
} from '@mui/material';
import { useTranslations } from 'next-intl';

import type { UserProfile } from '../types';

interface ProfileFitnessDataCardProps {
  activityLabel?: string;
  profile?: UserProfile | null;
  showEdit: boolean;
  onEdit: () => void;
  bmr: number;
  tdee: number;
  targetCalories: number;
}

export const ProfileFitnessDataCard = ({
  activityLabel,
  profile,
  showEdit,
  onEdit,
  bmr,
  tdee,
  targetCalories,
}: ProfileFitnessDataCardProps) => {
  const t = useTranslations('profile');

  return (
    <Card>
      <CardContent>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Typography variant="h6" gutterBottom>
            {t('fitnessData')}
          </Typography>
          {showEdit && (
            <IconButton
              onClick={onEdit}
              size="small"
              title={t('editFitnessData')}
            >
              <EditIcon />
            </IconButton>
          )}
        </Box>
        <Divider sx={{ mb: 2 }} />

        {!profile ? (
          <Alert severity="info">{t('noProfile')}</Alert>
        ) : (
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            <Box>
              <Typography variant="body2" color="text.secondary">
                {t('height')}
              </Typography>
              <Typography variant="body1">{profile.height} cm</Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">
                {t('weight')}
              </Typography>
              <Typography variant="body1">{profile.weight} kg</Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">
                {t('age')}
              </Typography>
              <Typography variant="body1">
                {t('ageYears', { count: profile.age })}
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">
                {t('activity')}
              </Typography>
              <Typography variant="body1">{activityLabel || '-'}</Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">
                {t('goal')}
              </Typography>
              <Typography variant="body1">
                {t(`goals.${profile.goal}`)}
              </Typography>
            </Box>

            <Divider sx={{ gridColumn: '1 / -1', my: 1 }} />

            <Box>
              <Typography variant="body2" color="text.secondary">
                {t('bmr')}
              </Typography>
              <Typography variant="body1" fontWeight="bold">
                {bmr} kcal
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">
                {t('tdee')}
              </Typography>
              <Typography variant="body1" fontWeight="bold">
                {tdee} kcal
              </Typography>
            </Box>
            <Box sx={{ gridColumn: '1 / -1' }}>
              <Typography variant="body2" color="text.secondary">
                {t('targetCalories')}
              </Typography>
              <Typography variant="h5" color="primary" fontWeight="bold">
                {targetCalories} kcal
              </Typography>
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};
