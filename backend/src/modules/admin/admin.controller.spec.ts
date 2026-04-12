import { Test, TestingModule } from '@nestjs/testing';
import { AdminController } from './admin.controller';
import { PrismaService } from '../../shared/db/prisma.service';
import { AdminService } from './admin.service';
import { IngredientSeederService } from '../../shared/services/ingredient-seeder.service';

describe('AdminController', () => {
  let controller: AdminController;
  let ingredientSeeder: jest.Mocked<
    Pick<IngredientSeederService, 'seedFromUsda'>
  >;

  beforeEach(async () => {
    ingredientSeeder = { seedFromUsda: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminController],
      providers: [
        { provide: PrismaService, useValue: {} },
        { provide: AdminService, useValue: {} },
        { provide: IngredientSeederService, useValue: ingredientSeeder },
      ],
    }).compile();

    controller = module.get<AdminController>(AdminController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('seedIngredients', () => {
    it('delegates to IngredientSeederService.seedFromUsda and returns the result', async () => {
      const mockResult = { seeded: 10, skipped: 2, failed: [] };
      ingredientSeeder.seedFromUsda.mockResolvedValue(mockResult);

      const result = await controller.seedIngredients();

      expect(ingredientSeeder.seedFromUsda).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockResult);
    });

    it('propagates errors thrown by IngredientSeederService', async () => {
      ingredientSeeder.seedFromUsda.mockRejectedValue(
        new Error('USDA unreachable'),
      );

      await expect(controller.seedIngredients()).rejects.toThrow(
        'USDA unreachable',
      );
    });
  });
});
