'use client';

import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Chip,
  Box,
  IconButton,
} from '@mui/material';

import type { WgerExercise } from '../types';

import { glassCardSx } from './glass';

interface ExerciseCardProps {
  exercise: WgerExercise;
  isFavorite: boolean;
  onToggleFavorite: (exercise: WgerExercise) => void;
  onClick: (exercise: WgerExercise) => void;
}

const PLACEHOLDER_IMG =
  'https://placehold.co/400x300/e0e0e0/757575?text=No+Image';

export const ExerciseCard = ({
  exercise,
  isFavorite,
  onToggleFavorite,
  onClick,
}: ExerciseCardProps) => {
  const imageUrl = exercise.images[0] ?? PLACEHOLDER_IMG;

  return (
    <Card
      sx={{
        ...glassCardSx,
        cursor: 'pointer',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4,
        },
      }}
      onClick={() => onClick(exercise)}
    >
      <CardMedia
        component="img"
        height={180}
        image={imageUrl}
        alt={exercise.name}
        sx={{ objectFit: 'cover', backgroundColor: 'action.hover' }}
      />
      <CardContent sx={{ pb: 1.5 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
          }}
        >
          <Typography
            variant="subtitle1"
            fontWeight="bold"
            sx={{
              textTransform: 'capitalize',
              flex: 1,
              mr: 1,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {exercise.name}
          </Typography>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(exercise);
            }}
            color={isFavorite ? 'error' : 'default'}
          >
            {isFavorite ? (
              <FavoriteIcon fontSize="small" />
            ) : (
              <FavoriteBorderIcon fontSize="small" />
            )}
          </IconButton>
        </Box>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
          <Chip
            label={exercise.category}
            size="small"
            color="primary"
            variant="outlined"
          />
          {exercise.muscles[0] && (
            <Chip
              label={exercise.muscles[0]}
              size="small"
              color="secondary"
              variant="outlined"
            />
          )}
          {exercise.equipment[0] && (
            <Chip
              icon={<FitnessCenterIcon sx={{ fontSize: 14 }} />}
              label={exercise.equipment[0]}
              size="small"
              variant="outlined"
            />
          )}
        </Box>
      </CardContent>
    </Card>
  );
};
