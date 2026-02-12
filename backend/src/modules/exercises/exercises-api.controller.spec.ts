jest.mock('../../shared/db/prisma.service');

import { Test, TestingModule } from '@nestjs/testing';
import { ExercisesApiController } from './exercises-api.controller';
import { WgerService } from './wger.service';
import { FavoriteExercisesService } from './favorite-exercises.service';

describe('ExercisesApiController', () => {
  let controller: ExercisesApiController;
  let wgerService: WgerService;
  let favService: FavoriteExercisesService;

  const mockWgerService = {
    fetchExercises: jest.fn(),
    fetchExerciseById: jest.fn(),
    fetchExercisesByCategory: jest.fn(),
    fetchExercisesByMuscle: jest.fn(),
    fetchExercisesByEquipment: jest.fn(),
    searchExercises: jest.fn(),
    fetchCategories: jest.fn(),
    fetchMuscles: jest.fn(),
    fetchEquipment: jest.fn(),
  };

  const mockFavService = {
    findAll: jest.fn(),
    getFavoriteIds: jest.fn(),
    create: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExercisesApiController],
      providers: [
        { provide: WgerService, useValue: mockWgerService },
        { provide: FavoriteExercisesService, useValue: mockFavService },
      ],
    }).compile();

    controller = module.get<ExercisesApiController>(ExercisesApiController);
    wgerService = module.get<WgerService>(WgerService);
    favService = module.get<FavoriteExercisesService>(FavoriteExercisesService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should call wgerService.fetchExercises with parsed params', async () => {
      const mockResult = { count: 1, next: null, previous: null, results: [] };
      mockWgerService.fetchExercises.mockResolvedValue(mockResult);

      const result = await controller.findAll('10', '5', 'pl');

      expect(result).toEqual(mockResult);
      expect(wgerService.fetchExercises).toHaveBeenCalledWith(10, 5, 'pl');
    });

    it('should use defaults when params not provided', async () => {
      mockWgerService.fetchExercises.mockResolvedValue({
        count: 0,
        results: [],
      });

      await controller.findAll();

      expect(wgerService.fetchExercises).toHaveBeenCalledWith(20, 0, undefined);
    });
  });

  describe('getCategories', () => {
    it('should return categories', async () => {
      const categories = [{ id: 1, name: 'Arms' }];
      mockWgerService.fetchCategories.mockResolvedValue(categories);

      expect(await controller.getCategories()).toEqual(categories);
    });
  });

  describe('getMuscles', () => {
    it('should return muscles', async () => {
      const muscles = [
        { id: 1, name: 'Biceps', nameEn: 'Biceps', isFront: true },
      ];
      mockWgerService.fetchMuscles.mockResolvedValue(muscles);

      expect(await controller.getMuscles()).toEqual(muscles);
    });
  });

  describe('getEquipment', () => {
    it('should return equipment', async () => {
      const equipment = [{ id: 1, name: 'Barbell' }];
      mockWgerService.fetchEquipment.mockResolvedValue(equipment);

      expect(await controller.getEquipment()).toEqual(equipment);
    });
  });

  describe('findByCategory', () => {
    it('should call fetchExercisesByCategory with parsed params', async () => {
      mockWgerService.fetchExercisesByCategory.mockResolvedValue({
        count: 0,
        results: [],
      });

      await controller.findByCategory(11, '10', '0', 'en');

      expect(wgerService.fetchExercisesByCategory).toHaveBeenCalledWith(
        11,
        10,
        0,
        'en',
      );
    });
  });

  describe('findByMuscle', () => {
    it('should call fetchExercisesByMuscle with parsed params', async () => {
      mockWgerService.fetchExercisesByMuscle.mockResolvedValue({
        count: 0,
        results: [],
      });

      await controller.findByMuscle(1, '20', '0', 'en');

      expect(wgerService.fetchExercisesByMuscle).toHaveBeenCalledWith(
        1,
        20,
        0,
        'en',
      );
    });
  });

  describe('findByEquipment', () => {
    it('should call fetchExercisesByEquipment', async () => {
      mockWgerService.fetchExercisesByEquipment.mockResolvedValue({
        count: 0,
        results: [],
      });

      await controller.findByEquipment(3);

      expect(wgerService.fetchExercisesByEquipment).toHaveBeenCalledWith(
        3,
        20,
        0,
        undefined,
      );
    });
  });

  describe('searchByName', () => {
    it('should call searchExercises with term', async () => {
      mockWgerService.searchExercises.mockResolvedValue([]);

      await controller.searchByName('bench', '10', 'en');

      expect(wgerService.searchExercises).toHaveBeenCalledWith(
        'bench',
        10,
        'en',
      );
    });
  });

  describe('getFavorites', () => {
    it('should return user favorites', async () => {
      const favorites = [{ id: 'fav-1', name: 'Bench Press' }];
      mockFavService.findAll.mockResolvedValue(favorites);

      expect(await controller.getFavorites(1)).toEqual(favorites);
      expect(favService.findAll).toHaveBeenCalledWith(1);
    });
  });

  describe('getFavoriteIds', () => {
    it('should return user favorite ids', async () => {
      mockFavService.getFavoriteIds.mockResolvedValue([42, 99]);

      expect(await controller.getFavoriteIds(1)).toEqual([42, 99]);
    });
  });

  describe('addFavorite', () => {
    it('should create favorite exercise', async () => {
      const body = {
        wgerExerciseId: 42,
        name: 'Bench Press',
        category: 'Chest',
        muscles: 'Pectoralis',
        equipment: 'Barbell',
      };
      mockFavService.create.mockResolvedValue({ id: 'fav-1', ...body });

      const result = await controller.addFavorite(1, body);

      expect(result.name).toBe('Bench Press');
      expect(favService.create).toHaveBeenCalledWith(1, body);
    });
  });

  describe('removeFavorite', () => {
    it('should remove favorite exercise', async () => {
      mockFavService.remove.mockResolvedValue({ id: 'fav-1' });

      expect(await controller.removeFavorite(1, 'fav-1')).toEqual({
        id: 'fav-1',
      });
      expect(favService.remove).toHaveBeenCalledWith(1, 'fav-1');
    });
  });

  describe('findOne', () => {
    it('should return exercise by id', async () => {
      const exercise = { id: 42, name: 'Squat' };
      mockWgerService.fetchExerciseById.mockResolvedValue(exercise);

      expect(await controller.findOne(42, 'en')).toEqual(exercise);
      expect(wgerService.fetchExerciseById).toHaveBeenCalledWith(42, 'en');
    });
  });
});
