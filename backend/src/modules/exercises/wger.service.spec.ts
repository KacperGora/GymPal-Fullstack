import { Test, TestingModule } from '@nestjs/testing';
import { HttpException } from '@nestjs/common';
import { WgerService } from './wger.service';

const mockFetch = jest.fn();

describe('WgerService', () => {
  let service: WgerService;
  let fetchSpy: jest.SpyInstance;

  const mockRawExercise = {
    id: 1,
    category: { id: 11, name: 'Chest' },
    muscles: [
      { id: 1, name: 'Klatka', name_en: 'Pectoralis major', is_front: true },
    ],
    muscles_secondary: [
      { id: 2, name: 'Triceps', name_en: 'Triceps brachii', is_front: true },
    ],
    equipment: [{ id: 1, name: 'Barbell' }],
    images: [{ id: 1, image: 'https://wger.de/img.jpg', is_main: true }],
    translations: [
      {
        id: 1,
        name: 'Bench Press',
        description: '<p>Push the bar up</p>',
        language: 2,
      },
    ],
  };

  beforeEach(async () => {
    fetchSpy = jest
      .spyOn(globalThis, 'fetch')
      .mockImplementation(mockFetch as unknown as typeof fetch);

    const module: TestingModule = await Test.createTestingModule({
      providers: [WgerService],
    }).compile();

    service = module.get<WgerService>(WgerService);

    jest.clearAllMocks();
  });

  afterEach(() => {
    fetchSpy.mockRestore();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('fetchExercises', () => {
    it('should fetch and transform exercises', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            count: 1,
            next: null,
            previous: null,
            results: [mockRawExercise],
          }),
      });

      const result = await service.fetchExercises(20, 0, 'en');

      expect(result.count).toBe(1);
      expect(result.results[0].name).toBe('Bench Press');
      expect(result.results[0].description).toBe('Push the bar up');
      expect(result.results[0].muscles).toEqual(['Pectoralis major']);
      expect(result.results[0].equipment).toEqual(['Barbell']);
    });

    it('should return cached result on second call', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            count: 1,
            next: null,
            previous: null,
            results: [mockRawExercise],
          }),
      });

      await service.fetchExercises(20, 0, 'en');
      await service.fetchExercises(20, 0, 'en');

      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('should throw HttpException on API error', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });

      await expect(service.fetchExercises()).rejects.toThrow(HttpException);
    });

    it('should throw SERVICE_UNAVAILABLE on network error', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      await expect(service.fetchExercises()).rejects.toThrow(HttpException);
    });
  });

  describe('fetchExerciseById', () => {
    it('should fetch and transform a single exercise', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockRawExercise),
      });

      const result = await service.fetchExerciseById(1, 'en');

      expect(result.id).toBe(1);
      expect(result.name).toBe('Bench Press');
      expect(result.category).toBe('Chest');
    });
  });

  describe('fetchCategories', () => {
    it('should fetch and map categories', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            count: 2,
            next: null,
            previous: null,
            results: [
              { id: 1, name: 'Arms' },
              { id: 2, name: 'Legs' },
            ],
          }),
      });

      const result = await service.fetchCategories();

      expect(result).toEqual([
        { id: 1, name: 'Arms' },
        { id: 2, name: 'Legs' },
      ]);
    });
  });

  describe('fetchMuscles', () => {
    it('should fetch and transform muscles', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            count: 1,
            next: null,
            previous: null,
            results: [
              {
                id: 1,
                name: 'Biceps',
                name_en: 'Biceps brachii',
                is_front: true,
              },
            ],
          }),
      });

      const result = await service.fetchMuscles();

      expect(result).toEqual([
        { id: 1, name: 'Biceps', nameEn: 'Biceps brachii', isFront: true },
      ]);
    });

    it('should fallback to name when name_en is empty', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            count: 1,
            next: null,
            previous: null,
            results: [{ id: 1, name: 'Biceps', name_en: '', is_front: true }],
          }),
      });

      const result = await service.fetchMuscles();

      expect(result[0].nameEn).toBe('Biceps');
    });
  });

  describe('fetchEquipment', () => {
    it('should fetch and map equipment', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            count: 1,
            next: null,
            previous: null,
            results: [{ id: 1, name: 'Barbell' }],
          }),
      });

      const result = await service.fetchEquipment();

      expect(result).toEqual([{ id: 1, name: 'Barbell' }]);
    });
  });

  describe('searchExercises', () => {
    it('should search and fetch exercise details', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () =>
            Promise.resolve({
              suggestions: [
                {
                  data: {
                    id: 10,
                    base_id: 1,
                    name: 'Bench Press',
                    category: 'Chest',
                    image: null,
                    image_thumbnail: null,
                  },
                },
              ],
            }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockRawExercise),
        });

      const result = await service.searchExercises('bench', 20, 'en');

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Bench Press');
    });

    it('should filter out failed exercise fetches', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () =>
            Promise.resolve({
              suggestions: [
                {
                  data: {
                    id: 10,
                    base_id: 1,
                    name: 'Bench',
                    category: 'Chest',
                    image: null,
                    image_thumbnail: null,
                  },
                },
                {
                  data: {
                    id: 20,
                    base_id: 2,
                    name: 'Squat',
                    category: 'Legs',
                    image: null,
                    image_thumbnail: null,
                  },
                },
              ],
            }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockRawExercise),
        })
        .mockRejectedValueOnce(new Error('Not found'));

      const result = await service.searchExercises('bench', 20, 'en');

      expect(result).toHaveLength(1);
    });
  });

  describe('transformExercise', () => {
    it('should strip HTML from description', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            ...mockRawExercise,
            translations: [
              {
                id: 1,
                name: 'Test',
                description: '<p>Some <strong>bold</strong> text</p>',
                language: 2,
              },
            ],
          }),
      });

      const result = await service.fetchExerciseById(999, 'en');
      expect(result.description).toBe('Some bold text');
    });

    it('should prefix relative image URLs with wger domain', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            ...mockRawExercise,
            images: [{ id: 1, image: '/media/img.jpg', is_main: true }],
          }),
      });

      const result = await service.fetchExerciseById(998, 'en');
      expect(result.images[0]).toBe('https://wger.de/media/img.jpg');
    });

    it('should use Polish translation when lang=pl', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            ...mockRawExercise,
            translations: [
              {
                id: 1,
                name: 'Bench Press',
                description: 'English',
                language: 2,
              },
              {
                id: 2,
                name: 'Wyciskanie',
                description: 'Po polsku',
                language: 14,
              },
            ],
          }),
      });

      const result = await service.fetchExerciseById(997, 'pl');
      expect(result.name).toBe('Wyciskanie');
      expect(result.description).toBe('Po polsku');
    });
  });
});
