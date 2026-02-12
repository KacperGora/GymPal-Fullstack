jest.mock('../../shared/db/prisma.service');

import { Test, TestingModule } from '@nestjs/testing';
import { WaterService } from './water.service';
import { PrismaService } from '../../shared/db/prisma.service';

const DATE_STR = '2025-01-15';
const DATE_OBJ = new Date(DATE_STR);

describe('WaterService', () => {
  let service: WaterService;
  let prisma: MockedPrismaService;

  type MockedPrismaService = {
    waterIntake: {
      findUnique: jest.Mock;
      upsert: jest.Mock;
      update: jest.Mock;
    };
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WaterService,
        {
          provide: PrismaService,
          useValue: {
            waterIntake: {
              findUnique: jest.fn(),
              upsert: jest.fn(),
              update: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<WaterService>(WaterService);
    prisma = module.get(PrismaService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getWaterIntake', () => {
    it('should return glasses count when record exists', async () => {
      prisma.waterIntake.findUnique.mockResolvedValue({
        glasses: 5,
      } as never);

      const result = await service.getWaterIntake(1, DATE_STR);

      expect(result).toEqual({ glasses: 5 });
      expect(prisma.waterIntake.findUnique).toHaveBeenCalledWith({
        where: {
          userId_date: { userId: 1, date: DATE_OBJ },
        },
      });
    });

    it('should return 0 when no record exists', async () => {
      prisma.waterIntake.findUnique.mockResolvedValue(null as never);

      const result = await service.getWaterIntake(1, DATE_STR);

      expect(result).toEqual({ glasses: 0 });
    });
  });

  describe('updateWaterIntake', () => {
    it('should upsert water intake and return glasses', async () => {
      prisma.waterIntake.upsert.mockResolvedValue({
        glasses: 8,
      } as never);

      const result = await service.updateWaterIntake(1, DATE_STR, 8);

      expect(result).toEqual({ glasses: 8 });
      expect(prisma.waterIntake.upsert).toHaveBeenCalledWith({
        where: {
          userId_date: { userId: 1, date: DATE_OBJ },
        },
        update: { glasses: 8 },
        create: { userId: 1, date: DATE_OBJ, glasses: 8 },
      });
    });
  });

  describe('addGlass', () => {
    it('should increment glasses via upsert', async () => {
      prisma.waterIntake.upsert.mockResolvedValue({
        glasses: 3,
      } as never);

      const result = await service.addGlass(1, DATE_STR);

      expect(result).toEqual({ glasses: 3 });
      expect(prisma.waterIntake.upsert).toHaveBeenCalledWith({
        where: {
          userId_date: { userId: 1, date: DATE_OBJ },
        },
        update: { glasses: { increment: 1 } },
        create: { userId: 1, date: DATE_OBJ, glasses: 1 },
      });
    });
  });

  describe('removeGlass', () => {
    it('should decrement glasses when record exists with glasses > 0', async () => {
      prisma.waterIntake.findUnique.mockResolvedValue({
        glasses: 3,
      } as never);
      prisma.waterIntake.update.mockResolvedValue({
        glasses: 2,
      } as never);

      const result = await service.removeGlass(1, DATE_STR);

      expect(result).toEqual({ glasses: 2 });
      expect(prisma.waterIntake.update).toHaveBeenCalledWith({
        where: {
          userId_date: { userId: 1, date: DATE_OBJ },
        },
        data: { glasses: { decrement: 1 } },
      });
    });

    it('should return 0 when no record exists', async () => {
      prisma.waterIntake.findUnique.mockResolvedValue(null as never);

      const result = await service.removeGlass(1, DATE_STR);

      expect(result).toEqual({ glasses: 0 });
      expect(prisma.waterIntake.update).not.toHaveBeenCalled();
    });

    it('should return 0 when glasses is already 0', async () => {
      prisma.waterIntake.findUnique.mockResolvedValue({
        glasses: 0,
      } as never);

      const result = await service.removeGlass(1, DATE_STR);

      expect(result).toEqual({ glasses: 0 });
      expect(prisma.waterIntake.update).not.toHaveBeenCalled();
    });
  });
});
