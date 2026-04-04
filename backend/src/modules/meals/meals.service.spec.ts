import { Test, TestingModule } from '@nestjs/testing';
import { EventEmitter2 } from '@nestjs/event-emitter';

jest.mock('../../shared/db/prisma.service');

import { MealsService } from './meals.service';
import { PrismaService } from '../../shared/db/prisma.service';
import { NutritionStatsProducer } from '../jobs/nutrition-stats.producer';

const mockNutritionStatsProducer = {
  scheduleRecalculation: jest.fn().mockResolvedValue(undefined),
};

describe('MealsService', () => {
  let service: MealsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MealsService,
        {
          provide: PrismaService,
          useValue: new PrismaService(),
        },
        {
          provide: NutritionStatsProducer,
          useValue: mockNutritionStatsProducer,
        },
        {
          provide: EventEmitter2,
          useValue: { emit: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<MealsService>(MealsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
