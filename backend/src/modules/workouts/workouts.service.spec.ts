import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';

// Mock PrismaService before any imports that use it
jest.mock('../../shared/db/prisma.service');

import { WorkoutsService } from './workouts.service';
import { PrismaService } from '../../shared/db/prisma.service';

describe('WorkoutsService', () => {
  let service: WorkoutsService;
  let mockPrismaService: any;

  const mockWorkout = {
    id: 'workout-1',
    userId: 1,
    name: 'Chest Day',
    date: new Date(),
    duration: 60,
    caloriesBurned: 350,
    notes: 'Great session',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockWorkoutExercise = {
    id: 'workout-exercise-1',
    workoutSessionId: 'workout-1',
    wgerExerciseId: 123,
    exerciseName: 'Bench Press',
    exerciseCategory: 'STRENGTH',
    sets: 4,
    reps: 10,
    weight: 80,
    restTime: 90,
    notes: 'Felt strong',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    mockPrismaService = {
      workoutSession: {
        create: jest.fn(),
        findMany: jest.fn(),
        findFirst: jest.fn(),
        updateMany: jest.fn(),
        deleteMany: jest.fn(),
      },
      workoutExercise: {
        create: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
        deleteMany: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkoutsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<WorkoutsService>(WorkoutsService);

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createWorkoutSession', () => {
    it('should create a workout without exercises', async () => {
      const dto = {
        name: 'Morning Workout',
        duration: 45,
        caloriesBurned: 250,
      };

      const createdWorkout = { ...mockWorkout, ...dto, exercises: [] };
      mockPrismaService.workoutSession.create.mockResolvedValue(createdWorkout);

      const result = await service.createWorkoutSession(1, dto);

      expect(result).toEqual(createdWorkout);
      expect(mockPrismaService.workoutSession.create).toHaveBeenCalledWith({
        data: {
          ...dto,
          userId: 1,
          exercises: undefined,
        },
        include: {
          exercises: true,
        },
      });
    });

    it('should create a workout with exercises', async () => {
      const dto = {
        name: 'Chest Day',
        duration: 60,
        caloriesBurned: 350,
        exercises: [
          {
            wgerExerciseId: 123,
            exerciseName: 'Bench Press',
            sets: 4,
            reps: 10,
            weight: 80,
            restTime: 90,
          },
        ],
      };

      const createdWorkout = {
        ...mockWorkout,
        exercises: [mockWorkoutExercise],
      };
      mockPrismaService.workoutSession.create.mockResolvedValue(createdWorkout);

      const result = await service.createWorkoutSession(1, dto);

      expect(result).toEqual(createdWorkout);
      expect(mockPrismaService.workoutSession.create).toHaveBeenCalledWith({
        data: {
          name: dto.name,
          duration: dto.duration,
          caloriesBurned: dto.caloriesBurned,
          userId: 1,
          exercises: {
            create: dto.exercises,
          },
        },
        include: {
          exercises: true,
        },
      });
    });
  });

  describe('findAllWorkoutSessions', () => {
    it('should return all workouts for a user', async () => {
      const workouts = [
        {
          ...mockWorkout,
          exercises: [mockWorkoutExercise],
        },
      ];
      mockPrismaService.workoutSession.findMany.mockResolvedValue(workouts);

      const result = await service.findAllWorkoutSessions(1);

      expect(result).toEqual(workouts);
      expect(mockPrismaService.workoutSession.findMany).toHaveBeenCalledWith({
        where: { userId: 1 },
        include: {
          exercises: true,
        },
        orderBy: { date: 'desc' },
        take: 50,
      });
    });

    it('should filter workouts by date range', async () => {
      const query = {
        startDate: '2026-01-01T00:00:00Z',
        endDate: '2026-01-31T23:59:59Z',
        limit: 10,
      };

      mockPrismaService.workoutSession.findMany.mockResolvedValue([]);

      await service.findAllWorkoutSessions(1, query);

      expect(mockPrismaService.workoutSession.findMany).toHaveBeenCalledWith({
        where: {
          userId: 1,
          date: {
            gte: new Date(query.startDate),
            lte: new Date(query.endDate),
          },
        },
        include: {
          exercises: true,
        },
        orderBy: { date: 'desc' },
        take: 10,
      });
    });
  });

  describe('findWorkoutSessionById', () => {
    it('should return a workout by id', async () => {
      const workout = {
        ...mockWorkout,
        exercises: [mockWorkoutExercise],
      };
      mockPrismaService.workoutSession.findFirst.mockResolvedValue(workout);

      const result = await service.findWorkoutSessionById(1, 'workout-1');

      expect(result).toEqual(workout);
      expect(mockPrismaService.workoutSession.findFirst).toHaveBeenCalledWith({
        where: { id: 'workout-1', userId: 1 },
        include: {
          exercises: {
            orderBy: { createdAt: 'asc' },
          },
        },
      });
    });

    it('should throw NotFoundException if workout not found', async () => {
      mockPrismaService.workoutSession.findFirst.mockResolvedValue(null);

      await expect(
        service.findWorkoutSessionById(1, 'non-existent'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateWorkoutSession', () => {
    it('should update a workout', async () => {
      const dto = { name: 'Updated Name', duration: 50 };

      mockPrismaService.workoutSession.updateMany.mockResolvedValue({
        count: 1,
      });

      const updatedWorkout = { ...mockWorkout, ...dto };
      mockPrismaService.workoutSession.findFirst.mockResolvedValue(
        updatedWorkout,
      );

      const result = await service.updateWorkoutSession(1, 'workout-1', dto);

      expect(result).toEqual(updatedWorkout);
      expect(mockPrismaService.workoutSession.updateMany).toHaveBeenCalledWith({
        where: { userId: 1, id: 'workout-1' },
        data: dto,
      });
    });

    it('should throw NotFoundException if workout not found', async () => {
      mockPrismaService.workoutSession.updateMany.mockResolvedValue({
        count: 0,
      });

      await expect(
        service.updateWorkoutSession(1, 'non-existent', { name: 'Test' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteWorkoutSession', () => {
    it('should delete a workout', async () => {
      mockPrismaService.workoutSession.deleteMany.mockResolvedValue({
        count: 1,
      });

      const result = await service.deleteWorkoutSession(1, 'workout-1');

      expect(result).toEqual({ id: 'workout-1' });
      expect(mockPrismaService.workoutSession.deleteMany).toHaveBeenCalledWith({
        where: { userId: 1, id: 'workout-1' },
      });
    });

    it('should throw NotFoundException if workout not found', async () => {
      mockPrismaService.workoutSession.deleteMany.mockResolvedValue({
        count: 0,
      });

      await expect(
        service.deleteWorkoutSession(1, 'non-existent'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('addExerciseToWorkout', () => {
    it('should add an exercise to a workout', async () => {
      const dto = {
        wgerExerciseId: 123,
        exerciseName: 'Bench Press',
        sets: 3,
        reps: 12,
        weight: 60,
        restTime: 60,
      };

      mockPrismaService.workoutSession.findFirst.mockResolvedValue(mockWorkout);

      const createdExercise = {
        ...mockWorkoutExercise,
        ...dto,
      };
      mockPrismaService.workoutExercise.create.mockResolvedValue(
        createdExercise,
      );

      const result = await service.addExerciseToWorkout(1, 'workout-1', dto);

      expect(result).toEqual(createdExercise);
      expect(mockPrismaService.workoutExercise.create).toHaveBeenCalledWith({
        data: {
          ...dto,
          workoutSessionId: 'workout-1',
        },
      });
    });
  });

  describe('updateWorkoutExercise', () => {
    it('should update a workout exercise', async () => {
      const dto = { sets: 4, reps: 15 };

      mockPrismaService.workoutSession.findFirst.mockResolvedValue(mockWorkout);
      mockPrismaService.workoutExercise.findFirst.mockResolvedValue(
        mockWorkoutExercise,
      );

      const updatedExercise = { ...mockWorkoutExercise, ...dto };
      mockPrismaService.workoutExercise.update.mockResolvedValue(
        updatedExercise,
      );

      const result = await service.updateWorkoutExercise(
        1,
        'workout-1',
        'exercise-1',
        dto,
      );

      expect(result).toEqual(updatedExercise);
    });

    it('should throw NotFoundException if workout exercise not found', async () => {
      mockPrismaService.workoutSession.findFirst.mockResolvedValue(mockWorkout);
      mockPrismaService.workoutExercise.findFirst.mockResolvedValue(null);

      await expect(
        service.updateWorkoutExercise(1, 'workout-1', 'non-existent', {
          sets: 4,
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('removeExerciseFromWorkout', () => {
    it('should remove an exercise from a workout', async () => {
      mockPrismaService.workoutSession.findFirst.mockResolvedValue(mockWorkout);
      mockPrismaService.workoutExercise.deleteMany.mockResolvedValue({
        count: 1,
      });

      const result = await service.removeExerciseFromWorkout(
        1,
        'workout-1',
        'exercise-1',
      );

      expect(result).toEqual({ id: 'exercise-1' });
    });

    it('should throw NotFoundException if workout exercise not found', async () => {
      mockPrismaService.workoutSession.findFirst.mockResolvedValue(mockWorkout);
      mockPrismaService.workoutExercise.deleteMany.mockResolvedValue({
        count: 0,
      });

      await expect(
        service.removeExerciseFromWorkout(1, 'workout-1', 'non-existent'),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
