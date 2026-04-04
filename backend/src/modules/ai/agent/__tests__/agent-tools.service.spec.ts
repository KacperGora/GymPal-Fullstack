import { Test, TestingModule } from '@nestjs/testing';
import { AgentToolsService } from '../agent-tools.service';
import { WorkoutsService } from '../../../workouts/workouts.service';
import { MealsService } from '../../../meals/meals.service';
import { WgerService } from '../../../exercises/wger.service';
import { UserProfileService } from '../../../user-profile/user-profile.service';

const mockWorkoutsService = {
  findAllWorkoutSessions: jest.fn(),
  createWorkoutSession: jest.fn(),
};

const mockMealsService = {
  create: jest.fn(),
};

const mockWgerService = {
  searchExercises: jest.fn(),
};

const mockUserProfileService = {
  getProfile: jest.fn(),
};

describe('AgentToolsService', () => {
  let service: AgentToolsService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AgentToolsService,
        { provide: WorkoutsService, useValue: mockWorkoutsService },
        { provide: MealsService, useValue: mockMealsService },
        { provide: WgerService, useValue: mockWgerService },
        { provide: UserProfileService, useValue: mockUserProfileService },
      ],
    }).compile();

    service = module.get(AgentToolsService);
  });

  describe('executeTool', () => {
    describe('get_training_history', () => {
      it('returns paginated workout sessions', async () => {
        mockWorkoutsService.findAllWorkoutSessions.mockResolvedValueOnce({
          data: [{ id: 'w1', name: 'Chest Day' }],
          total: 1,
        });

        const result = await service.executeTool(42, 'get_training_history', {
          limit: 5,
        });

        expect(mockWorkoutsService.findAllWorkoutSessions).toHaveBeenCalledWith(
          42,
          {
            startDate: undefined,
            endDate: undefined,
            limit: 5,
            page: 1,
          },
        );
        expect(result).toMatchObject({ total: 1, fetched: 1 });
      });

      it('defaults limit to 10 when not provided', async () => {
        mockWorkoutsService.findAllWorkoutSessions.mockResolvedValueOnce({
          data: [],
          total: 0,
        });

        await service.executeTool(1, 'get_training_history', {});

        expect(mockWorkoutsService.findAllWorkoutSessions).toHaveBeenCalledWith(
          1,
          expect.objectContaining({ limit: 10 }),
        );
      });
    });

    describe('update_plan', () => {
      it('creates a workout session and returns summary', async () => {
        mockWorkoutsService.createWorkoutSession.mockResolvedValueOnce({
          id: 'session-1',
          name: 'Push Day',
          date: new Date('2026-04-03'),
          exercises: [{ id: 'ex1' }],
        });

        const result = await service.executeTool(42, 'update_plan', {
          name: 'Push Day',
          duration: 60,
          exercises: [
            {
              exerciseName: 'Bench Press',
              sets: 4,
              reps: 8,
              weight: 80,
              restTime: 90,
            },
          ],
        });

        expect(result).toMatchObject({
          created: true,
          sessionId: 'session-1',
          exerciseCount: 1,
        });
        const callArg =
          mockWorkoutsService.createWorkoutSession.mock.calls[0][1];
        expect(callArg.exercises[0].wgerExerciseId).toBeUndefined();
      });
    });

    describe('search_exercises', () => {
      it('returns mapped exercise list', async () => {
        mockWgerService.searchExercises.mockResolvedValueOnce([
          {
            id: 1,
            name: 'Squat',
            description: 'Compound leg exercise',
            category: 'Legs',
            muscles: ['Quadriceps'],
            equipment: ['Barbell'],
          },
        ]);

        const result = (await service.executeTool(1, 'search_exercises', {
          query: 'squat',
          limit: 3,
        })) as unknown[];

        expect(mockWgerService.searchExercises).toHaveBeenCalledWith(
          'squat',
          3,
          'en',
        );
        expect(result).toHaveLength(1);
        expect((result[0] as Record<string, unknown>).id).toBe(1);
      });

      it('defaults limit to 5 and language to en', async () => {
        mockWgerService.searchExercises.mockResolvedValueOnce([]);

        await service.executeTool(1, 'search_exercises', { query: 'bench' });

        expect(mockWgerService.searchExercises).toHaveBeenCalledWith(
          'bench',
          5,
          'en',
        );
      });
    });

    describe('log_meal', () => {
      it('creates a meal and returns summary', async () => {
        mockMealsService.create.mockResolvedValueOnce({
          id: 'meal-1',
          name: 'Oatmeal',
          calories: 350,
          category: 'BREAKFAST',
        });

        const result = await service.executeTool(42, 'log_meal', {
          name: 'Oatmeal',
          calories: 350,
          proteins: 12,
          carbs: 60,
          fats: 5,
          category: 'BREAKFAST',
        });

        expect(result).toMatchObject({
          logged: true,
          mealId: 'meal-1',
          calories: 350,
        });
        expect(mockMealsService.create).toHaveBeenCalledWith(
          42,
          expect.objectContaining({ name: 'Oatmeal', category: 'BREAKFAST' }),
        );
      });

      it('defaults category to SNACK when not provided', async () => {
        mockMealsService.create.mockResolvedValueOnce({
          id: 'm2',
          name: 'Apple',
          calories: 80,
          category: 'SNACK',
        });

        await service.executeTool(1, 'log_meal', {
          name: 'Apple',
          calories: 80,
          proteins: 0,
          carbs: 20,
          fats: 0,
        });

        expect(mockMealsService.create).toHaveBeenCalledWith(
          1,
          expect.objectContaining({ category: 'SNACK' }),
        );
      });
    });

    it('throws on unknown tool name', async () => {
      await expect(service.executeTool(1, 'unknown_tool', {})).rejects.toThrow(
        'Unknown tool: unknown_tool',
      );
    });
  });
});
