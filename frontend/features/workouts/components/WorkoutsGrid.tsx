'use client';

import AddIcon from '@mui/icons-material/Add';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import {
  Box,
  Button,
  Grid,
  Pagination,
  Skeleton,
  Typography,
} from '@mui/material';
import { useTranslations } from 'next-intl';

import type { WorkoutSession } from '../types';

import { WorkoutCard } from './WorkoutCard';

interface WorkoutsGridProps {
  workouts: WorkoutSession[];
  isLoading?: boolean;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onAddClick: () => void;
  onWorkoutClick: (workout: WorkoutSession) => void;
  onEditWorkout: (workout: WorkoutSession) => void;
  onDeleteWorkout: (id: string) => void;
}

export const WorkoutsGrid = ({
  workouts,
  isLoading,
  page,
  totalPages,
  onPageChange,
  onAddClick,
  onWorkoutClick,
  onEditWorkout,
  onDeleteWorkout,
}: WorkoutsGridProps) => {
  const t = useTranslations('workouts');

  if (isLoading) {
    return (
      <Grid container spacing={2}>
        {[1, 2, 3].map((i) => (
          <Grid key={i} size={{ xs: 12, sm: 6, md: 4 }}>
            <Skeleton variant="rounded" height={160} />
          </Grid>
        ))}
      </Grid>
    );
  }

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Typography variant="h5" fontWeight="bold">
          {t('title')}
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={onAddClick}
        >
          {t('addWorkout')}
        </Button>
      </Box>

      {workouts.length === 0 ? (
        <Box
          sx={{
            textAlign: 'center',
            py: 8,
          }}
        >
          <FitnessCenterIcon
            sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }}
          />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {t('noWorkoutsYet')}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {t('startFirstWorkout')}
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={onAddClick}
          >
            {t('addWorkout')}
          </Button>
        </Box>
      ) : (
        <Grid container spacing={2}>
          {workouts.map((workout) => (
            <Grid key={workout.id} size={{ xs: 12, sm: 6, md: 4 }}>
              <WorkoutCard
                workout={workout}
                onClick={() => onWorkoutClick(workout)}
                onEdit={() => onEditWorkout(workout)}
                onDelete={() => onDeleteWorkout(workout.id)}
              />
            </Grid>
          ))}
        </Grid>
      )}

      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, value) => onPageChange(value)}
            color="primary"
          />
        </Box>
      )}
    </Box>
  );
};
