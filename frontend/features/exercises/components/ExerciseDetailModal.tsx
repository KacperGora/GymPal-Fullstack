'use client';

import CloseIcon from '@mui/icons-material/Close';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  Box,
  Chip,
  IconButton,
  CircularProgress,
  Button,
} from '@mui/material';
import { useTranslations } from 'next-intl';

import { useExercise } from '../queries/useExercise';

const PLACEHOLDER_IMG =
  'https://placehold.co/400x300/e0e0e0/757575?text=No+Image';

interface ExerciseDetailModalProps {
  exerciseId: number | null;
  open: boolean;
  onClose: () => void;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  lang?: string;
}

export const ExerciseDetailModal = ({
  exerciseId,
  open,
  onClose,
  isFavorite,
  onToggleFavorite,
  lang,
}: ExerciseDetailModalProps) => {
  const t = useTranslations('exercises');
  const { data: exercise, isLoading } = useExercise(exerciseId, lang);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          textTransform: 'capitalize',
        }}
      >
        {isLoading ? t('loading') : exercise?.name}
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        {isLoading ? (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: 300,
            }}
          >
            <CircularProgress />
          </Box>
        ) : exercise ? (
          <Box>
            <Box
              sx={{
                borderRadius: 2,
                overflow: 'hidden',
                mb: 2,
                backgroundColor: 'action.hover',
              }}
            >
              <Box
                component="img"
                src={exercise.images[0] ?? PLACEHOLDER_IMG}
                alt={exercise.name}
                sx={{
                  width: '100%',
                  maxHeight: 350,
                  objectFit: 'contain',
                  display: 'block',
                }}
              />
            </Box>

            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 1,
                mb: 2,
              }}
            >
              <Chip label={exercise.category} color="primary" />
              {exercise.muscles.map((muscle) => (
                <Chip key={muscle} label={muscle} color="secondary" />
              ))}
              {exercise.equipment.map((eq) => (
                <Chip key={eq} icon={<FitnessCenterIcon />} label={eq} />
              ))}
            </Box>

            {exercise.musclesSecondary.length > 0 && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  {t('secondaryMuscles')}
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {exercise.musclesSecondary.map((muscle) => (
                    <Chip
                      key={muscle}
                      label={muscle}
                      size="small"
                      variant="outlined"
                    />
                  ))}
                </Box>
              </Box>
            )}

            {exercise.description && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  {t('instructions')}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {exercise.description}
                </Typography>
              </Box>
            )}

            <Button
              fullWidth
              variant={isFavorite ? 'outlined' : 'contained'}
              startIcon={isFavorite ? <FavoriteIcon /> : <FavoriteBorderIcon />}
              onClick={onToggleFavorite}
              color={isFavorite ? 'error' : 'primary'}
            >
              {isFavorite ? t('removeFromFavorites') : t('addToFavorites')}
            </Button>
          </Box>
        ) : null}
      </DialogContent>
    </Dialog>
  );
};
