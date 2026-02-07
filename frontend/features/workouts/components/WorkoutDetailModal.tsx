'use client';

import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Typography,
} from '@mui/material';
import { useTranslations } from 'next-intl';

import type { WorkoutSession, WorkoutExercise } from '../types';

interface WorkoutDetailModalProps {
  open: boolean;
  onClose: () => void;
  workout: WorkoutSession | null;
  onAddExercise: () => void;
  onDeleteExercise: (exerciseId: string) => void;
}

export const WorkoutDetailModal = ({
  open,
  onClose,
  workout,
  onAddExercise,
  onDeleteExercise,
}: WorkoutDetailModalProps) => {
  const t = useTranslations('workouts');

  if (!workout) return null;

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Box>
            <Typography variant="h6">{workout.name}</Typography>
            <Typography variant="body2" color="text.secondary">
              {formatDate(workout.date)}
            </Typography>
          </Box>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
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
        </Box>

        {workout.notes && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mb: 2, fontStyle: 'italic' }}
          >
            {workout.notes}
          </Typography>
        )}

        <Divider sx={{ my: 2 }} />

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 1,
          }}
        >
          <Typography variant="subtitle1" fontWeight="bold">
            {t('exercises')} ({workout.exercises?.length || 0})
          </Typography>
          <Button size="small" startIcon={<AddIcon />} onClick={onAddExercise}>
            {t('addExercise')}
          </Button>
        </Box>

        {workout.exercises && workout.exercises.length > 0 ? (
          <List dense>
            {workout.exercises.map((exercise: WorkoutExercise) => (
              <ListItem
                key={exercise.id}
                secondaryAction={
                  <IconButton
                    edge="end"
                    size="small"
                    color="error"
                    onClick={() => onDeleteExercise(exercise.id)}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                }
                sx={{
                  borderRadius: 1,
                  mb: 0.5,
                  '&:hover': {
                    backgroundColor: 'action.hover',
                  },
                }}
              >
                <ListItemText
                  primary={exercise.exerciseName || t('unknownExercise')}
                  secondary={
                    <Typography variant="caption" color="text.secondary">
                      {exercise.sets} {t('sets')} x {exercise.reps} {t('reps')}
                      {exercise.weight > 0 && ` @ ${exercise.weight} kg`}
                      {exercise.restTime > 0 &&
                        ` | ${t('rest')}: ${exercise.restTime}s`}
                    </Typography>
                  }
                />
              </ListItem>
            ))}
          </List>
        ) : (
          <Box sx={{ textAlign: 'center', py: 3 }}>
            <Typography color="text.secondary">
              {t('noExercisesYet')}
            </Typography>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};
