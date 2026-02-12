jest.mock('../../shared/db/prisma.service');

import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { FavoriteExercisesService } from './favorite-exercises.service';
import { PrismaService } from '../../shared/db/prisma.service';

describe('FavoriteExercisesService', () => {
  let service: FavoriteExercisesService;
  let prisma: PrismaService;

  const mockFavorite = {
    id: 'fav-ex-1',
    userId: 1,
    wgerExerciseId: 42,
    name: 'Bench Press',
    category: 'Chest',
    muscles: 'Pectoralis major',
    equipment: 'Barbell',
    imageUrl: null,
    createdAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FavoriteExercisesService,
        {
          provide: PrismaService,
          useValue: {
            favoriteExercise: {
              findMany: jest.fn(),
              create: jest.fn(),
              deleteMany: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<FavoriteExercisesService>(FavoriteExercisesService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all favorite exercises for user', async () => {
      (prisma.favoriteExercise.findMany as jest.Mock).mockResolvedValue([
        mockFavorite,
      ]);

      const result = await service.findAll(1);

      expect(result).toEqual([mockFavorite]);
      expect(prisma.favoriteExercise.findMany).toHaveBeenCalledWith({
        where: { userId: 1 },
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should return empty array when no favorites', async () => {
      (prisma.favoriteExercise.findMany as jest.Mock).mockResolvedValue([]);

      const result = await service.findAll(1);

      expect(result).toEqual([]);
    });
  });

  describe('create', () => {
    it('should create favorite exercise', async () => {
      const dto = {
        wgerExerciseId: 42,
        name: 'Bench Press',
        category: 'Chest',
        muscles: 'Pectoralis major',
        equipment: 'Barbell',
        imageUrl: 'https://example.com/img.jpg',
      };
      (prisma.favoriteExercise.create as jest.Mock).mockResolvedValue({
        id: 'fav-ex-2',
        userId: 1,
        ...dto,
      });

      const result = await service.create(1, dto);

      expect(result.name).toBe('Bench Press');
      expect(prisma.favoriteExercise.create).toHaveBeenCalledWith({
        data: {
          userId: 1,
          wgerExerciseId: 42,
          name: 'Bench Press',
          category: 'Chest',
          muscles: 'Pectoralis major',
          equipment: 'Barbell',
          imageUrl: 'https://example.com/img.jpg',
        },
      });
    });
  });

  describe('remove', () => {
    it('should remove favorite and return id', async () => {
      (prisma.favoriteExercise.deleteMany as jest.Mock).mockResolvedValue({
        count: 1,
      });

      const result = await service.remove(1, 'fav-ex-1');

      expect(result).toEqual({ id: 'fav-ex-1' });
      expect(prisma.favoriteExercise.deleteMany).toHaveBeenCalledWith({
        where: { id: 'fav-ex-1', userId: 1 },
      });
    });

    it('should throw NotFoundException when favorite not found', async () => {
      (prisma.favoriteExercise.deleteMany as jest.Mock).mockResolvedValue({
        count: 0,
      });

      await expect(service.remove(1, 'nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getFavoriteIds', () => {
    it('should return array of wgerExerciseIds', async () => {
      (prisma.favoriteExercise.findMany as jest.Mock).mockResolvedValue([
        { wgerExerciseId: 42 },
        { wgerExerciseId: 99 },
      ]);

      const result = await service.getFavoriteIds(1);

      expect(result).toEqual([42, 99]);
      expect(prisma.favoriteExercise.findMany).toHaveBeenCalledWith({
        where: { userId: 1 },
        select: { wgerExerciseId: true },
      });
    });

    it('should return empty array when no favorites', async () => {
      (prisma.favoriteExercise.findMany as jest.Mock).mockResolvedValue([]);

      const result = await service.getFavoriteIds(1);

      expect(result).toEqual([]);
    });
  });
});
