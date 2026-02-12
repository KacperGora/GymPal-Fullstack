jest.mock('../../shared/db/prisma.service');

import { Test, TestingModule } from '@nestjs/testing';
import { WaterController } from './water.controller';
import { WaterService } from './water.service';

describe('WaterController', () => {
  let controller: WaterController;
  let service: WaterService;

  const mockWaterService = {
    getWaterIntake: jest.fn(),
    addGlass: jest.fn(),
    removeGlass: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WaterController],
      providers: [{ provide: WaterService, useValue: mockWaterService }],
    }).compile();

    controller = module.get<WaterController>(WaterController);
    service = module.get<WaterService>(WaterService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getWaterIntake', () => {
    it('should call service with userId and date', async () => {
      mockWaterService.getWaterIntake.mockResolvedValue({ glasses: 5 });

      const result = await controller.getWaterIntake(1, '2025-01-15');

      expect(result).toEqual({ glasses: 5 });
      expect(service.getWaterIntake).toHaveBeenCalledWith(1, '2025-01-15');
    });
  });

  describe('addGlass', () => {
    it('should call service with userId and date', async () => {
      mockWaterService.addGlass.mockResolvedValue({ glasses: 3 });

      const result = await controller.addGlass(1, '2025-01-15');

      expect(result).toEqual({ glasses: 3 });
      expect(service.addGlass).toHaveBeenCalledWith(1, '2025-01-15');
    });
  });

  describe('removeGlass', () => {
    it('should call service with userId and date', async () => {
      mockWaterService.removeGlass.mockResolvedValue({ glasses: 2 });

      const result = await controller.removeGlass(1, '2025-01-15');

      expect(result).toEqual({ glasses: 2 });
      expect(service.removeGlass).toHaveBeenCalledWith(1, '2025-01-15');
    });
  });
});
