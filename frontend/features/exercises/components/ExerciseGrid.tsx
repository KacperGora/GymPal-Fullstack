'use client';

import { Box, Skeleton, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';

import type { WgerExercise } from '../types';

import { ExerciseCard } from './ExerciseCard';

interface ExerciseGridProps {
  exercises: WgerExercise[];
  isLoading: boolean;
  favoriteIds: number[];
  onToggleFavorite: (exercise: WgerExercise) => void;
  onExerciseClick: (exercise: WgerExercise) => void;
}

export const ExerciseGrid = ({
  exercises,
  isLoading,
  favoriteIds,
  onToggleFavorite,
  onExerciseClick,
}: ExerciseGridProps) => {
  const t = useTranslations('exercises');

  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(3, 1fr)',
            lg: 'repeat(4, 1fr)',
          },
          gap: 2,
        }}
      >
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton
            key={i}
            variant="rounded"
            height={300}
            sx={{ borderRadius: 2 }}
          />
        ))}
      </Box>
    );
  }

  if (exercises.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h6" color="text.secondary">
          {t('noResults')}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          {t('tryDifferentFilter')}
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          sm: 'repeat(2, 1fr)',
          md: 'repeat(3, 1fr)',
          lg: 'repeat(4, 1fr)',
        },
        gap: 2,
      }}
    >
      {exercises.map((exercise) => (
        <ExerciseCard
          key={exercise.id}
          exercise={exercise}
          isFavorite={favoriteIds.includes(exercise.id)}
          onToggleFavorite={onToggleFavorite}
          onClick={onExerciseClick}
        />
      ))}
    </Box>
  );
};
