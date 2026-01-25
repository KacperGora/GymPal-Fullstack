import { Test, TestingModule } from '@nestjs/testing';

// Mock PrismaService before importing
jest.mock('../../shared/db/prisma.service');

import { MealsService } from './meals.service';
import { PrismaService } from '../../shared/db/prisma.service';

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
      ],
    }).compile();

    service = module.get<MealsService>(MealsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
