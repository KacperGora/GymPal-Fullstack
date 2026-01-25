import { Test, TestingModule } from '@nestjs/testing';

// Mock WorkoutsService before importing
jest.mock('./workouts.service');

import { ExercisesController } from './exercises.controller';
import { WorkoutsService } from './workouts.service';

describe('ExercisesController', () => {
  let controller: ExercisesController;

  const mockWorkoutsService = {
    findAllExercises: jest.fn(),
    findExercisesByCategory: jest.fn(),
    findExerciseById: jest.fn(),
  };

  const mockExercise = {
    id: 'exercise-1',
    name: 'Bench Press',
    category: 'STRENGTH',
    muscleGroup: 'Chest',
    equipment: 'Barbell',
    description: 'Classic chest exercise',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExercisesController],
      providers: [
        {
          provide: WorkoutsService,
          useValue: mockWorkoutsService,
        },
      ],
    }).compile();

    controller = module.get<ExercisesController>(ExercisesController);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAllExercises', () => {
    it('should return all exercises when no category provided', async () => {
      const exercises = [mockExercise];
      mockWorkoutsService.findAllExercises.mockResolvedValue(exercises);

      const result = await controller.findAllExercises();

      expect(result).toEqual(exercises);
      expect(mockWorkoutsService.findAllExercises).toHaveBeenCalled();
      expect(
        mockWorkoutsService.findExercisesByCategory,
      ).not.toHaveBeenCalled();
    });

    it('should return filtered exercises when category provided', async () => {
      const exercises = [mockExercise];
      mockWorkoutsService.findExercisesByCategory.mockResolvedValue(exercises);

      const result = await controller.findAllExercises('STRENGTH');

      expect(result).toEqual(exercises);
      expect(mockWorkoutsService.findExercisesByCategory).toHaveBeenCalledWith(
        'STRENGTH',
      );
      expect(mockWorkoutsService.findAllExercises).not.toHaveBeenCalled();
    });
  });

  describe('findOneExercise', () => {
    it('should return a single exercise', async () => {
      mockWorkoutsService.findExerciseById.mockResolvedValue(mockExercise);

      const result = await controller.findOneExercise('exercise-1');

      expect(result).toEqual(mockExercise);
      expect(mockWorkoutsService.findExerciseById).toHaveBeenCalledWith(
        'exercise-1',
      );
    });
  });
});
