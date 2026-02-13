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
import { useWorkout, useWorkouts } from '@/features/workouts/queries';
import { useAuth } from '@/shared/hooks/useAuth';

export default function Workouts() {
  const t = useTranslations('workouts');
  const { user, isLoading: isAuthLoading } = useAuth();

  const [addWorkoutOpen, setAddWorkoutOpen] = useState(false);
  const [editWorkout, setEditWorkout] = useState<WorkoutSession | null>(null);
  const [selectedWorkoutId, setSelectedWorkoutId] = useState<string | null>(
    null,
  );
  const [addExerciseOpen, setAddExerciseOpen] = useState(false);

  const [page, setPage] = useState(1);

  const { data: workoutsData, isLoading: isWorkoutsLoading } = useWorkouts({
    page,
    limit: 12,
  });
  const workouts = workoutsData?.data ?? [];
  const totalPages = workoutsData?.totalPages ?? 1;
  const { data: selectedWorkout } = useWorkout(selectedWorkoutId);

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
    if (selectedWorkoutId) {
      deleteExerciseMutation.mutate({
        workoutId: selectedWorkoutId,
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
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        onAddClick={() => setAddWorkoutOpen(true)}
        onWorkoutClick={(workout) => setSelectedWorkoutId(workout.id)}
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
        open={!!selectedWorkoutId}
        onClose={() => setSelectedWorkoutId(null)}
        workout={selectedWorkout ?? null}
        onAddExercise={handleAddExercise}
        onDeleteExercise={handleDeleteExercise}
      />

      <AddExerciseModal
        open={addExerciseOpen}
        onClose={() => setAddExerciseOpen(false)}
        onSubmit={(data) => {
          if (selectedWorkoutId) {
            addExerciseMutation.mutate({
              workoutId: selectedWorkoutId,
              data,
            });
          }
        }}
        isLoading={addExerciseMutation.isPending}
      />
    </Box>
  );
}
