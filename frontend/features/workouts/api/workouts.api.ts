import type {
  WorkoutSession,
  WorkoutExercise,
  WorkoutQueryParams,
} from '../types';
import type {
  CreateWorkoutSessionDto,
  UpdateWorkoutSessionDto,
  CreateWorkoutExerciseDto,
  UpdateWorkoutExerciseDto,
} from '@gympal/shared';

import { api } from '@/shared/api/axios';
import { endpointList } from '@/shared/api/endpoint';

// Workout Sessions
export const getWorkouts = async (
  params?: WorkoutQueryParams,
): Promise<WorkoutSession[]> => {
  const res = await api.get(endpointList.workouts.list, { params });
  return res.data as WorkoutSession[];
};

export const getWorkout = async (id: string): Promise<WorkoutSession> => {
  const res = await api.get(endpointList.workouts.get(id));
  return res.data as WorkoutSession;
};

export const createWorkout = async (
  data: CreateWorkoutSessionDto,
): Promise<WorkoutSession> => {
  const res = await api.post(endpointList.workouts.create, data);
  return res.data as WorkoutSession;
};

export const updateWorkout = async (
  id: string,
  data: UpdateWorkoutSessionDto,
): Promise<WorkoutSession> => {
  const res = await api.patch(endpointList.workouts.update(id), data);
  return res.data as WorkoutSession;
};

export const deleteWorkout = async (id: string): Promise<void> => {
  await api.delete(endpointList.workouts.delete(id));
};

// Workout Exercises
export const addExerciseToWorkout = async (
  workoutId: string,
  data: CreateWorkoutExerciseDto,
): Promise<WorkoutExercise> => {
  const res = await api.post(
    endpointList.workouts.addExercise(workoutId),
    data,
  );
  return res.data as WorkoutExercise;
};

export const updateWorkoutExercise = async (
  workoutId: string,
  exerciseId: string,
  data: UpdateWorkoutExerciseDto,
): Promise<WorkoutExercise> => {
  const res = await api.patch(
    endpointList.workouts.updateExercise(workoutId, exerciseId),
    data,
  );
  return res.data as WorkoutExercise;
};

export const deleteWorkoutExercise = async (
  workoutId: string,
  exerciseId: string,
): Promise<void> => {
  await api.delete(endpointList.workouts.deleteExercise(workoutId, exerciseId));
};

// Workout Stats
export interface WeeklyWorkoutStats {
  week: string;
  workouts: number;
}

export const getWeeklyWorkoutStats = async (): Promise<
  WeeklyWorkoutStats[]
> => {
  const res = await api.get(endpointList.workouts.weeklyStats);
  return res.data as WeeklyWorkoutStats[];
};
