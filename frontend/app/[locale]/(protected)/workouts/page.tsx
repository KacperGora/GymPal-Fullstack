'use client';

import { Box, Skeleton, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import type { WorkoutSession } from '@/features/workouts/types';

import {
  AddExerciseModal,
  AddWorkoutModal,
  WorkoutDetailModal,
  WorkoutsGrid,
} from '@/features/workouts/components';

import {
  useAddExerciseToWorkout,
  useAddWorkout,
  useDeleteWorkout,
  useDeleteWorkoutExercise,
  useUpdateWorkout,
} from '@/features/workouts/mutations';
import { useWorkouts } from '@/features/workouts/queries';
import { useAuth } from '@/shared/hooks/useAuth';

export default function Workouts() {
  const t = useTranslations('workouts');
  const { user, isLoading: isAuthLoading } = useAuth();

  const [addWorkoutOpen, setAddWorkoutOpen] = useState(false);
  const [editWorkout, setEditWorkout] = useState<WorkoutSession | null>(null);
  const [selectedWorkout, setSelectedWorkout] = useState<WorkoutSession | null>(
    null,
  );
  const [addExerciseOpen, setAddExerciseOpen] = useState(false);

  const { data: workouts = [], isLoading: isWorkoutsLoading } = useWorkouts();

  const addWorkoutMutation = useAddWorkout({
    onSuccess: () => setAddWorkoutOpen(false),
  });

  const updateWorkoutMutation = useUpdateWorkout({
    onSuccess: () => setEditWorkout(null),
  });

  const deleteWorkoutMutation = useDeleteWorkout();

  const addExerciseMutation = useAddExerciseToWorkout({
    onSuccess: () => setAddExerciseOpen(false),
  });

  const deleteExerciseMutation = useDeleteWorkoutExercise();

  const handleEditWorkout = (workout: WorkoutSession) => {
    setEditWorkout(workout);
    setAddWorkoutOpen(true);
  };

  const handleCloseAddModal = () => {
    setAddWorkoutOpen(false);
    setEditWorkout(null);
  };

  const handleDeleteWorkout = (id: string) => {
    deleteWorkoutMutation.mutate(id);
  };

  const handleAddExercise = () => {
    setAddExerciseOpen(true);
  };

  const handleDeleteExercise = (exerciseId: string) => {
    if (selectedWorkout) {
      deleteExerciseMutation.mutate({
        workoutId: selectedWorkout.id,
        exerciseId,
      });
    }
  };

  if (isAuthLoading) {
    return (
      <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
        <Skeleton variant="rectangular" height={400} />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {t('greeting', { name: user?.firstName ?? '' })}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {t('trackWorkouts')}
        </Typography>
      </Box>

      <WorkoutsGrid
        workouts={workouts}
        isLoading={isWorkoutsLoading}
        onAddClick={() => setAddWorkoutOpen(true)}
        onWorkoutClick={setSelectedWorkout}
        onEditWorkout={handleEditWorkout}
        onDeleteWorkout={handleDeleteWorkout}
      />

      <AddWorkoutModal
        open={addWorkoutOpen}
        onClose={handleCloseAddModal}
        onSubmit={(data) => addWorkoutMutation.mutate(data)}
        onUpdate={(id, data) => updateWorkoutMutation.mutate({ id, data })}
        isLoading={
          addWorkoutMutation.isPending || updateWorkoutMutation.isPending
        }
        editWorkout={editWorkout}
      />

      <WorkoutDetailModal
        open={!!selectedWorkout}
        onClose={() => setSelectedWorkout(null)}
        workout={selectedWorkout}
        onAddExercise={handleAddExercise}
        onDeleteExercise={handleDeleteExercise}
      />

      <AddExerciseModal
        open={addExerciseOpen}
        onClose={() => setAddExerciseOpen(false)}
        onSubmit={(data) => {
          if (selectedWorkout) {
            addExerciseMutation.mutate({
              workoutId: selectedWorkout.id,
              data,
            });
          }
        }}
        isLoading={addExerciseMutation.isPending}
      />
    </Box>
  );
}
