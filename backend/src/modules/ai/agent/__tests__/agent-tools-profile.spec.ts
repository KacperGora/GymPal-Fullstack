import { NotFoundException } from '@nestjs/common';
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
const mockMealsService = { create: jest.fn() };
const mockWgerService = { searchExercises: jest.fn() };
const mockUserProfileService = { getProfile: jest.fn() };

describe('AgentToolsService — get_user_profile', () => {
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

  it('returns profile with computed BMI', async () => {
    mockUserProfileService.getProfile.mockResolvedValueOnce({
      height: 180,
      weight: 80,
      age: 28,
      activity: 1.55,
      goal: 'GAIN',
    });

    const result = (await service.executeTool(
      42,
      'get_user_profile',
      {},
    )) as Record<string, unknown>;

    expect(mockUserProfileService.getProfile).toHaveBeenCalledWith(42);
    expect(result.height).toBe(180);
    expect(result.weight).toBe(80);
    expect(result.age).toBe(28);
    expect(result.goal).toBe('GAIN');
    expect(typeof result.bmi).toBe('number');
    expect((result.bmi as number).toFixed(1)).toBe('24.7');
  });

  it('returns error object when profile not found (no throw)', async () => {
    mockUserProfileService.getProfile.mockRejectedValueOnce(
      new NotFoundException('User profile not found'),
    );

    const result = (await service.executeTool(
      1,
      'get_user_profile',
      {},
    )) as Record<string, unknown>;

    expect(result).toEqual({ error: 'Profile not configured' });
  });

  it('returns error object on unexpected error', async () => {
    mockUserProfileService.getProfile.mockRejectedValueOnce(
      new Error('DB error'),
    );

    const result = (await service.executeTool(
      1,
      'get_user_profile',
      {},
    )) as Record<string, unknown>;

    expect(result).toEqual({ error: 'Profile not configured' });
  });
});
