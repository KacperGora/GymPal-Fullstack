jest.mock('../../shared/db/prisma.service');

import { Test, TestingModule } from '@nestjs/testing';
import { FavoritesService } from './favorites.service';
import { PrismaService } from '../../shared/db/prisma.service';

describe('FavoritesService', () => {
  let service: FavoritesService;
  let prisma: MockedPrismaService;

  type MockedPrismaService = {
    favoriteMeal: {
      findMany: jest.Mock;
      create: jest.Mock;
      deleteMany: jest.Mock;
    };
  };

  const mockFavorite = {
    id: 'fav-1',
    userId: 1,
    name: 'Chicken Breast',
    calories: 300,
    proteins: 31,
    carbs: 0,
    fats: 3.6,
    category: 'LUNCH',
    createdAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FavoritesService,
        {
          provide: PrismaService,
          useValue: {
            favoriteMeal: {
              findMany: jest.fn(),
              create: jest.fn(),
              deleteMany: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<FavoritesService>(FavoritesService);
    prisma = module.get(PrismaService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all favorites for user', async () => {
      prisma.favoriteMeal.findMany.mockResolvedValue([mockFavorite] as never);

      const result = await service.findAll(1);

      expect(result).toEqual([mockFavorite]);
      expect(prisma.favoriteMeal.findMany).toHaveBeenCalledWith({
        where: { userId: 1 },
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should return empty array when no favorites', async () => {
      prisma.favoriteMeal.findMany.mockResolvedValue([] as never);

      const result = await service.findAll(1);

      expect(result).toEqual([]);
    });
  });

  describe('create', () => {
    it('should create favorite with provided category', async () => {
      const dto = {
        name: 'Rice',
        calories: 200,
        proteins: 4,
        carbs: 45,
        fats: 0.5,
        category: 'LUNCH' as const,
      };
      prisma.favoriteMeal.create.mockResolvedValue({
        id: 'fav-2',
        userId: 1,
        ...dto,
      } as never);

      const result = await service.create(1, dto);

      expect(result.name).toBe('Rice');
      expect(prisma.favoriteMeal.create).toHaveBeenCalledWith({
        data: {
          userId: 1,
          name: 'Rice',
          calories: 200,
          proteins: 4,
          carbs: 45,
          fats: 0.5,
          category: 'LUNCH',
        },
      });
    });

    it('should default category to SNACK when not provided', async () => {
      const dto = {
        name: 'Apple',
        calories: 52,
        proteins: 0.3,
        carbs: 14,
        fats: 0.2,
      };
      prisma.favoriteMeal.create.mockResolvedValue({
        id: 'fav-3',
        userId: 1,
        ...dto,
        category: 'SNACK',
      } as never);

      await service.create(1, dto);

      expect(prisma.favoriteMeal.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ category: 'SNACK' }),
      });
    });
  });

  describe('remove', () => {
    it('should delete favorite by id and userId', async () => {
      prisma.favoriteMeal.deleteMany.mockResolvedValue({
        count: 1,
      } as never);

      const result = await service.remove(1, 'fav-1');

      expect(result).toEqual({ count: 1 });
      expect(prisma.favoriteMeal.deleteMany).toHaveBeenCalledWith({
        where: { id: 'fav-1', userId: 1 },
      });
    });

    it('should return count 0 when favorite not found', async () => {
      prisma.favoriteMeal.deleteMany.mockResolvedValue({
        count: 0,
      } as never);

      const result = await service.remove(1, 'nonexistent');

      expect(result).toEqual({ count: 0 });
    });
  });
});
