import { describe, it, expect, vi, beforeEach } from 'vitest';

import { endpointList } from '@/shared/api/endpoint';

import {
  getWorkouts,
  getWorkout,
  createWorkout,
  updateWorkout,
  deleteWorkout,
  addExerciseToWorkout,
  updateWorkoutExercise,
  deleteWorkoutExercise,
} from './workouts.api';

const mockGet = vi.fn();
const mockPost = vi.fn();
const mockPatch = vi.fn();
const mockDelete = vi.fn();

vi.mock('@/shared/api/axios', () => ({
  api: {
    get: (...args: unknown[]) => mockGet(...args),
    post: (...args: unknown[]) => mockPost(...args),
    patch: (...args: unknown[]) => mockPatch(...args),
    delete: (...args: unknown[]) => mockDelete(...args),
  },
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe('workouts.api', () => {
  describe('getWorkouts', () => {
    it('should GET list with params and return data', async () => {
      const responseData = [{ id: 'w1' }];
      const params = { startDate: '2024-01-01', endDate: '2024-01-31' };
      mockGet.mockResolvedValueOnce({ data: responseData });

      const result = await getWorkouts(params);

      expect(mockGet).toHaveBeenCalledWith(endpointList.workouts.list, {
        params,
      });
      expect(result).toEqual(responseData);
    });

    it('should GET list without params', async () => {
      mockGet.mockResolvedValueOnce({ data: [] });

      await getWorkouts();

      expect(mockGet).toBeCalledWith(endpointList.workouts.list, {
        params: undefined,
      });
    });

    it('should propagate errors', async () => {
      mockGet.mockRejectedValueOnce(new Error('500'));

      await expect(getWorkouts()).rejects.toThrow('500');
    });
  });

  describe('getWorkout', () => {
    it('should GET by id and return data', async () => {
      const responseData = { id: 'w1' };
      mockGet.mockResolvedValueOnce({ data: responseData });

      const result = await getWorkout('w1');

      expect(mockGet).toBeCalledWith(endpointList.workouts.get('w1'));
      expect(result).toEqual(responseData);
    });
  });

  describe('createWorkout', () => {
    it('should POST and return data', async () => {
      const body = {
        name: 'Leg day',
        startedAt: '2024-01-01T10:00:00Z',
        duration: 60,
        caloriesBurned: 600,
      };
      const responseData = { id: 'w1', ...body };
      mockPost.mockResolvedValueOnce({ data: responseData });

      const result = await createWorkout(body);

      expect(mockPost).toBeCalledWith(endpointList.workouts.create, body);
      expect(result).toEqual(responseData);
    });

    it('should propagate errors', async () => {
      mockPost.mockRejectedValueOnce(new Error('400'));

      await expect(createWorkout({ name: 'Leg day' } as never)).rejects.toThrow(
        '400',
      );
    });
  });

  describe('updateWorkout', () => {
    it('should PATCH by id and return data', async () => {
      const body = { name: 'Upper body' };
      const responseData = { id: 'w1', ...body };
      mockPatch.mockResolvedValueOnce({ data: responseData });

      const result = await updateWorkout('w1', body);

      expect(mockPatch).toBeCalledWith(
        endpointList.workouts.update('w1'),
        body,
      );
      expect(result).toEqual(responseData);
    });
  });

  describe('deleteWorkout', () => {
    it('should DELETE by id', async () => {
      mockDelete.mockResolvedValueOnce(undefined);

      await deleteWorkout('w1');

      expect(mockDelete).toBeCalledWith(endpointList.workouts.delete('w1'));
    });
  });

  describe('addExerciseToWorkout', () => {
    it('should POST exercise and return data', async () => {
      const body = {
        wgerExerciseId: 1,
        exerciseName: 'abc',
        sets: 4,
        reps: 12,
        weight: 60,
        restTime: 90,
      };
      const responseData = { id: 'we1', ...body };
      mockPost.mockResolvedValueOnce({ data: responseData });

      const result = await addExerciseToWorkout('w1', body);

      expect(mockPost).toBeCalledWith(
        endpointList.workouts.addExercise('w1'),
        body,
      );
      expect(result).toEqual(responseData);
    });
  });

  describe('updateWorkoutExercise', () => {
    it('should PATCH exercise and return data', async () => {
      const body = { reps: 12 };
      const responseData = { id: 'we1', ...body };
      mockPatch.mockResolvedValueOnce({ data: responseData });

      const result = await updateWorkoutExercise('w1', 'we1', body);

      expect(mockPatch).toBeCalledWith(
        endpointList.workouts.updateExercise('w1', 'we1'),
        body,
      );
      expect(result).toEqual(responseData);
    });

    it('should propagate errors', async () => {
      mockPatch.mockRejectedValueOnce(new Error('400'));

      await expect(
        updateWorkoutExercise('w1', 'we1', { reps: 12 } as never),
      ).rejects.toThrow('400');
    });
  });

  describe('deleteWorkoutExercise', () => {
    it('should DELETE exercise by id', async () => {
      mockDelete.mockResolvedValueOnce(undefined);

      await deleteWorkoutExercise('w1', 'we1');

      expect(mockDelete).toBeCalledWith(
        endpointList.workouts.deleteExercise('w1', 'we1'),
      );
    });
  });
});
