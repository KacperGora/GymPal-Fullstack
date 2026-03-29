import { Test, TestingModule } from '@nestjs/testing';

jest.mock('../../shared/db/prisma.service');

import { NutritionController } from './nutrition.controller';
import { NutritionService } from './nutrition.service';
import { PrismaService } from '../../shared/db/prisma.service';

const mockNutritionService = {
  getDailyNutrition: jest.fn(),
  getDateRangeNutrition: jest.fn(),
};

describe('NutritionController', () => {
  let controller: NutritionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NutritionController],
      providers: [
        {
          provide: NutritionService,
          useValue: mockNutritionService,
        },
        {
          provide: PrismaService,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<NutritionController>(NutritionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
