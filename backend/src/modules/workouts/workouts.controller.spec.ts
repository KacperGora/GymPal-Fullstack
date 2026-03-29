import { Test, TestingModule } from '@nestjs/testing';

// Mock dependencies before importing
jest.mock('./workouts.service');
jest.mock('@gympal/shared');

import { WorkoutsController } from './workouts.controller';
import { WorkoutsService } from './workouts.service';
import { PrismaService } from '../../shared/db/prisma.service';

const mockWorkoutsService = {
  createWorkoutSession: jest.fn(),
  findAllWorkoutSessions: jest.fn(),
  findWorkoutSessionById: jest.fn(),
  updateWorkoutSession: jest.fn(),
  deleteWorkoutSession: jest.fn(),
  addExerciseToWorkout: jest.fn(),
  updateWorkoutExercise: jest.fn(),
  removeExerciseFromWorkout: jest.fn(),
};

describe('WorkoutsController', () => {
  let controller: WorkoutsController;

  const mockWorkout = {
    id: 'workout-1',
    userId: 1,
    name: 'Chest Day',
    date: new Date(),
    duration: 60,
    caloriesBurned: 350,
    notes: 'Great session',
    exercises: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WorkoutsController],
      providers: [
        {
          provide: WorkoutsService,
          useValue: mockWorkoutsService,
        },
        {
          provide: PrismaService,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<WorkoutsController>(WorkoutsController);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createWorkout', () => {
    it('should create a workout', async () => {
      const dto = {
        name: 'Morning Workout',
        duration: 45,
        caloriesBurned: 250,
      };

      mockWorkoutsService.createWorkoutSession.mockResolvedValue({
        ...mockWorkout,
        ...dto,
      });

      const result = await controller.createWorkout(1, dto);

      expect(result).toEqual({ ...mockWorkout, ...dto });
      expect(mockWorkoutsService.createWorkoutSession).toHaveBeenCalledWith(
        1,
        dto,
      );
    });
  });

  describe('findAllWorkouts', () => {
    it('should return all workouts', async () => {
      const workouts = [mockWorkout];
      mockWorkoutsService.findAllWorkoutSessions.mockResolvedValue(workouts);

      const result = await controller.findAllWorkouts(1, undefined, undefined);

      expect(result).toEqual(workouts);
      expect(mockWorkoutsService.findAllWorkoutSessions).toHaveBeenCalledWith(
        1,
        undefined,
      );
    });

    it('should return workouts with query filters', async () => {
      const query = {
        startDate: '2026-01-01T00:00:00Z',
        endDate: '2026-01-31T23:59:59Z',
        limit: 10,
      };

      mockWorkoutsService.findAllWorkoutSessions.mockResolvedValue([]);

      await controller.findAllWorkouts(1, undefined, query);

      expect(mockWorkoutsService.findAllWorkoutSessions).toHaveBeenCalledWith(
        1,
        query,
      );
    });
  });

  describe('findOneWorkout', () => {
    it('should return a single workout', async () => {
      mockWorkoutsService.findWorkoutSessionById.mockResolvedValue(mockWorkout);

      const result = await controller.findOneWorkout(1, 'workout-1');

      expect(result).toEqual(mockWorkout);
      expect(mockWorkoutsService.findWorkoutSessionById).toHaveBeenCalledWith(
        1,
        'workout-1',
      );
    });
  });

  describe('updateWorkout', () => {
    it('should update a workout', async () => {
      const dto = { name: 'Updated Name' };
      const updatedWorkout = { ...mockWorkout, ...dto };

      mockWorkoutsService.updateWorkoutSession.mockResolvedValue(
        updatedWorkout,
      );

      const result = await controller.updateWorkout(1, 'workout-1', dto);

      expect(result).toEqual(updatedWorkout);
      expect(mockWorkoutsService.updateWorkoutSession).toHaveBeenCalledWith(
        1,
        'workout-1',
        dto,
      );
    });
  });

  describe('removeWorkout', () => {
    it('should delete a workout', async () => {
      mockWorkoutsService.deleteWorkoutSession.mockResolvedValue({
        id: 'workout-1',
      });

      const result = await controller.removeWorkout(1, 'workout-1');

      expect(result).toEqual({ id: 'workout-1' });
      expect(mockWorkoutsService.deleteWorkoutSession).toHaveBeenCalledWith(
        1,
        'workout-1',
      );
    });
  });

  describe('addExerciseToWorkout', () => {
    it('should add an exercise to a workout', async () => {
      const dto = {
        exerciseId: 'exercise-1',
        sets: 3,
        reps: 12,
        weight: 60,
        restTime: 60,
      };

      const workoutExercise = {
        id: 'workout-exercise-1',
        ...dto,
        workoutSessionId: 'workout-1',
      };

      mockWorkoutsService.addExerciseToWorkout.mockResolvedValue(
        workoutExercise,
      );

      const result = await controller.addExerciseToWorkout(1, 'workout-1', dto);

      expect(result).toEqual(workoutExercise);
      expect(mockWorkoutsService.addExerciseToWorkout).toHaveBeenCalledWith(
        1,
        'workout-1',
        dto,
      );
    });
  });

  describe('updateWorkoutExercise', () => {
    it('should update a workout exercise', async () => {
      const dto = { sets: 4, reps: 15 };
      const updatedExercise = {
        id: 'workout-exercise-1',
        ...dto,
        weight: 60,
        restTime: 60,
      };

      mockWorkoutsService.updateWorkoutExercise.mockResolvedValue(
        updatedExercise,
      );

      const result = await controller.updateWorkoutExercise(
        1,
        'workout-1',
        'exercise-1',
        dto,
      );

      expect(result).toEqual(updatedExercise);
      expect(mockWorkoutsService.updateWorkoutExercise).toHaveBeenCalledWith(
        1,
        'workout-1',
        'exercise-1',
        dto,
      );
    });
  });

  describe('removeExerciseFromWorkout', () => {
    it('should remove an exercise from a workout', async () => {
      mockWorkoutsService.removeExerciseFromWorkout.mockResolvedValue({
        id: 'exercise-1',
      });

      const result = await controller.removeExerciseFromWorkout(
        1,
        'workout-1',
        'exercise-1',
      );

      expect(result).toEqual({ id: 'exercise-1' });
      expect(
        mockWorkoutsService.removeExerciseFromWorkout,
      ).toHaveBeenCalledWith(1, 'workout-1', 'exercise-1');
    });
  });
});
