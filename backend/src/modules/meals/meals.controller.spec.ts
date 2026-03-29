import { Test, TestingModule } from '@nestjs/testing';

jest.mock('../../shared/db/prisma.service');

import { MealsController } from './meals.controller';
import { MealsService } from './meals.service';
import { PrismaService } from '../../shared/db/prisma.service';

const mockMealsService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

describe('MealsController', () => {
  let controller: MealsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MealsController],
      providers: [
        { provide: MealsService, useValue: mockMealsService },
        {
          provide: PrismaService,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<MealsController>(MealsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
