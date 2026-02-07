'use client';

import AccessTimeIcon from '@mui/icons-material/AccessTime';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  IconButton,
  Typography,
} from '@mui/material';
import { useTranslations } from 'next-intl';

import type { WorkoutSession } from '../types';

import { glassCardSx } from '@/shared/theme/glass';

interface WorkoutCardProps {
  workout: WorkoutSession;
  onClick: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export const WorkoutCard = ({
  workout,
  onClick,
  onEdit,
  onDelete,
}: WorkoutCardProps) => {
  const t = useTranslations('workouts');

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Card sx={glassCardSx}>
      <CardActionArea onClick={onClick}>
        <CardContent>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              mb: 1,
            }}
          >
            <Box>
              <Typography variant="h6" component="div">
                {workout.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {formatDate(workout.date)}
              </Typography>
            </Box>
            <Box
              sx={{ display: 'flex', gap: 0.5 }}
              onClick={(e) => e.stopPropagation()}
            >
              <IconButton size="small" onClick={onEdit}>
                <EditIcon fontSize="small" />
              </IconButton>
              <IconButton size="small" color="error" onClick={onDelete}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 2 }}>
            <Chip
              icon={<AccessTimeIcon />}
              label={formatDuration(workout.duration)}
              size="small"
              variant="outlined"
            />
            <Chip
              icon={<LocalFireDepartmentIcon />}
              label={`${workout.caloriesBurned} kcal`}
              size="small"
              variant="outlined"
              color="error"
            />
            <Chip
              icon={<FitnessCenterIcon />}
              label={`${workout.exercises?.length || 0} ${t('exercises')}`}
              size="small"
              variant="outlined"
              color="primary"
            />
          </Box>

          {workout.notes && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 1.5, fontStyle: 'italic' }}
              noWrap
            >
              {workout.notes}
            </Typography>
          )}
        </CardContent>
      </CardActionArea>
    </Card>
  );
};
