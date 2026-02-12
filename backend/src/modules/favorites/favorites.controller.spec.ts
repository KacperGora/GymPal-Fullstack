jest.mock('../../shared/db/prisma.service');

import { Test, TestingModule } from '@nestjs/testing';
import { FavoritesController } from './favorites.controller';
import { FavoritesService } from './favorites.service';

describe('FavoritesController', () => {
  let controller: FavoritesController;
  let service: FavoritesService;

  const mockFavoritesService = {
    findAll: jest.fn(),
    create: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FavoritesController],
      providers: [
        { provide: FavoritesService, useValue: mockFavoritesService },
      ],
    }).compile();

    controller = module.get<FavoritesController>(FavoritesController);
    service = module.get<FavoritesService>(FavoritesService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all favorites for user', async () => {
      const favorites = [{ id: 'fav-1', name: 'Chicken' }];
      mockFavoritesService.findAll.mockResolvedValue(favorites);

      const result = await controller.findAll(1);

      expect(result).toEqual(favorites);
      expect(service.findAll).toHaveBeenCalledWith(1);
    });
  });

  describe('create', () => {
    it('should create a favorite meal', async () => {
      const body = {
        name: 'Rice',
        calories: 200,
        proteins: 4,
        carbs: 45,
        fats: 0.5,
      };
      mockFavoritesService.create.mockResolvedValue({ id: 'fav-2', ...body });

      const result = await controller.create(1, body);

      expect(result.name).toBe('Rice');
      expect(service.create).toHaveBeenCalledWith(1, body);
    });
  });

  describe('remove', () => {
    it('should remove a favorite meal', async () => {
      mockFavoritesService.remove.mockResolvedValue({ count: 1 });

      const result = await controller.remove(1, 'fav-1');

      expect(result).toEqual({ count: 1 });
      expect(service.remove).toHaveBeenCalledWith(1, 'fav-1');
    });
  });
});
