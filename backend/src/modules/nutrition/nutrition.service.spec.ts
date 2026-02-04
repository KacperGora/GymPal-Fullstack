import { Test, TestingModule } from '@nestjs/testing';

jest.mock('../../shared/db/prisma.service');

import { NutritionService } from './nutrition.service';
import { PrismaService } from '../../shared/db/prisma.service';

describe('NutritionService', () => {
  let service: NutritionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NutritionService,
        {
          provide: PrismaService,
          useValue: new PrismaService(),
        },
      ],
    }).compile();

    service = module.get<NutritionService>(NutritionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
