import { z } from 'zod';

import type { UpdateWorkoutSessionDto } from '@gympal/shared';

import { workoutFormSchema } from '../components/AddWorkoutModal';

export interface WorkoutExercise {
  id: string;
  workoutSessionId: string;
  wgerExerciseId: number;
  exerciseName: string;
  exerciseCategory?: string;
  sets: number;
  reps: number;
  weight: number;
  restTime: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkoutSession {
  id: string;
  userId: number;
  name: string;
  date: string;
  duration: number;
  caloriesBurned: number;
  notes?: string;
  exercises: WorkoutExercise[];
  createdAt: string;
  updatedAt: string;
}

export interface WorkoutQueryParams {
  startDate?: string;
  endDate?: string;
  limit?: number;
  page?: number;
}

export type WorkoutFormData = z.infer<typeof workoutFormSchema>;

export interface IAddWorkoutModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: WorkoutFormData) => void;
  onUpdate?: (id: string, data: UpdateWorkoutSessionDto) => void;
  isLoading?: boolean;
  editWorkout?: WorkoutSession | null;
}
