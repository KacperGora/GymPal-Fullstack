'use client';

import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from '@mui/material';
import { useTranslations } from 'next-intl';
import { useEffect } from 'react';
import { z } from 'zod';

import type { IAddWorkoutModalProps, WorkoutFormData } from '../types';

import { useZodForm } from '@/shared/hooks/useZodForm';

export const workoutFormSchema = z.object({
  name: z.string().min(1, 'Workout name is required'),
  duration: z.coerce.number().int().positive('Duration must be positive'),
  caloriesBurned: z.coerce
    .number()
    .nonnegative('Calories must be non-negative')
    .default(0),
  notes: z.string().optional(),
});

const defaultValues: WorkoutFormData = {
  name: '',
  duration: 0,
  caloriesBurned: 0,
  notes: '',
};

export const AddWorkoutModal = ({
  open,
  onClose,
  onSubmit,
  onUpdate,
  isLoading,
  editWorkout,
}: IAddWorkoutModalProps) => {
  const t = useTranslations('workouts');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useZodForm(workoutFormSchema, { defaultValues });

  const onFormSubmit = (data: WorkoutFormData) => {
    const payload = {
      ...data,
      notes: data.notes?.trim() || undefined,
    };

    if (editWorkout && onUpdate) {
      onUpdate(editWorkout.id, payload);
    } else {
      onSubmit(payload);
    }
  };

  const handleClose = () => {
    reset(defaultValues);
    onClose();
  };

  useEffect(() => {
    if (open) {
      if (editWorkout) {
        reset({
          name: editWorkout.name,
          duration: editWorkout.duration,
          caloriesBurned: editWorkout.caloriesBurned ?? 0,
          notes: editWorkout.notes ?? '',
        });
      } else {
        reset(defaultValues);
      }
    }
  }, [open, editWorkout, reset]);

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <form onSubmit={handleSubmit(onFormSubmit)}>
        <DialogTitle>
          {editWorkout ? t('editWorkout') : t('addWorkout')}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label={t('workoutName')}
              {...register('name')}
              error={!!errors.name}
              helperText={errors.name?.message}
              required
              fullWidth
            />
            <TextField
              label={t('duration')}
              type="number"
              {...register('duration')}
              error={!!errors.duration}
              helperText={errors.duration?.message || t('durationMinutes')}
              required
              fullWidth
              inputProps={{ min: 1 }}
            />
            <TextField
              label={t('caloriesBurned')}
              type="number"
              {...register('caloriesBurned')}
              error={!!errors.caloriesBurned}
              helperText={errors.caloriesBurned?.message}
              fullWidth
              inputProps={{ min: 0 }}
            />
            <TextField
              label={t('notes')}
              {...register('notes')}
              fullWidth
              multiline
              rows={3}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={isLoading}>
            {t('cancel')}
          </Button>
          <Button type="submit" variant="contained" disabled={isLoading}>
            {editWorkout ? t('save') : t('add')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
