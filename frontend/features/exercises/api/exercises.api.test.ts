import { describe, it, expect, vi, beforeEach } from 'vitest';

import { endpointList } from '@/shared/api/endpoint';

import {
  getExercises,
  getExerciseById,
  getExercisesByCategory,
  searchExercises,
  getCategories,
  getMuscles,
  getEquipmentList,
  getFavoriteExercises,
  getFavoriteExerciseIds,
  addFavoriteExercise,
  removeFavoriteExercise,
} from './exercises.api';

const mockGet = vi.fn();
const mockPost = vi.fn();
const mockDelete = vi.fn();

vi.mock('@/shared/api/axios', () => ({
  api: {
    get: (...args: unknown[]) => mockGet(...args),
    post: (...args: unknown[]) => mockPost(...args),
    delete: (...args: unknown[]) => mockDelete(...args),
  },
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe('exercises.api', () => {
  describe('getExercises', () => {
    it('should GET list with params and return data', async () => {
      const responseData = { results: [], count: 0 };
      const params = { limit: 10, offset: 20, lang: 'en' };
      mockGet.mockResolvedValueOnce({ data: responseData });

      const result = await getExercises(params);

      expect(mockGet).toBeCalledWith(endpointList.exercisesApi.list, {
        params,
      });
      expect(result).toEqual(responseData);
    });

    it('should GET list without params', async () => {
      mockGet.mockResolvedValueOnce({ data: { results: [], count: 0 } });

      await getExercises();

      expect(mockGet).toBeCalledWith(endpointList.exercisesApi.list, {
        params: undefined,
      });
    });

    it('should propagate errors', async () => {
      mockGet.mockRejectedValueOnce(new Error('500'));

      await expect(getExercises()).rejects.toThrow('500');
    });
  });

  describe('getExerciseById', () => {
    it('should GET by id with lang and return data', async () => {
      const responseData = { id: 123, name: 'Push-up' };
      mockGet.mockResolvedValueOnce({ data: responseData });

      const result = await getExerciseById(123, 'pl');

      expect(mockGet).toBeCalledWith(endpointList.exercisesApi.exercise(123), {
        params: { lang: 'pl' },
      });
      expect(result).toEqual(responseData);
    });

    it('should GET by id without lang', async () => {
      mockGet.mockResolvedValueOnce({ data: { id: 1 } });

      await getExerciseById(1);

      expect(mockGet).toBeCalledWith(endpointList.exercisesApi.exercise(1), {
        params: undefined,
      });
    });
  });

  describe('getExercisesByCategory', () => {
    it('should GET by category with params and return data', async () => {
      const responseData = { results: [{ id: 1 }], count: 1 };
      const params = { limit: 5 };
      mockGet.mockResolvedValueOnce({ data: responseData });

      const result = await getExercisesByCategory(10, params);

      expect(mockGet).toBeCalledWith(endpointList.exercisesApi.byCategory(10), {
        params,
      });
      expect(result).toEqual(responseData);
    });
  });

  describe('searchExercises', () => {
    it('should GET search by term with params and return data', async () => {
      const responseData = [{ id: 1, name: 'Pull-up' }];
      const params = { lang: 'en' };
      mockGet.mockResolvedValueOnce({ data: responseData });

      const result = await searchExercises('pull', params);

      expect(mockGet).toBeCalledWith(endpointList.exercisesApi.search('pull'), {
        params,
      });
      expect(result).toEqual(responseData);
    });

    it('should propagate errors', async () => {
      mockGet.mockRejectedValueOnce(new Error('500'));

      await expect(searchExercises('pull')).rejects.toThrow('500');
    });
  });

  describe('getCategories', () => {
    it('should GET categories and return data', async () => {
      const responseData = [{ id: 1, name: 'Chest' }];
      mockGet.mockResolvedValueOnce({ data: responseData });

      const result = await getCategories();

      expect(mockGet).toBeCalledWith(endpointList.exercisesApi.categories);
      expect(result).toEqual(responseData);
    });
  });

  describe('getMuscles', () => {
    it('should GET muscles and return data', async () => {
      const responseData = [{ id: 1, name: 'Biceps' }];
      mockGet.mockResolvedValueOnce({ data: responseData });

      const result = await getMuscles();

      expect(mockGet).toBeCalledWith(endpointList.exercisesApi.muscles);
      expect(result).toEqual(responseData);
    });
  });

  describe('getEquipmentList', () => {
    it('should GET equipment and return data', async () => {
      const responseData = [{ id: 1, name: 'Barbell' }];
      mockGet.mockResolvedValueOnce({ data: responseData });

      const result = await getEquipmentList();

      expect(mockGet).toBeCalledWith(endpointList.exercisesApi.equipment);
      expect(result).toEqual(responseData);
    });
  });

  describe('getFavoriteExercises', () => {
    it('should GET favorites and return data', async () => {
      const responseData = [{ id: 'fav1', exerciseId: 1 }];
      mockGet.mockResolvedValueOnce({ data: responseData });

      const result = await getFavoriteExercises();

      expect(mockGet).toBeCalledWith(endpointList.exercisesApi.favorites);
      expect(result).toEqual(responseData);
    });
  });

  describe('getFavoriteExerciseIds', () => {
    it('should GET favorite ids and return data', async () => {
      const responseData = [1, 2, 3];
      mockGet.mockResolvedValueOnce({ data: responseData });

      const result = await getFavoriteExerciseIds();

      expect(mockGet).toBeCalledWith(endpointList.exercisesApi.favoriteIds);
      expect(result).toEqual(responseData);
    });
  });

  describe('addFavoriteExercise', () => {
    it('should POST favorites and return data', async () => {
      const body = { exerciseId: 11 };
      const responseData = { id: 'fav1', exerciseId: 11 };
      mockPost.mockResolvedValueOnce({ data: responseData });

      const result = await addFavoriteExercise(body);

      expect(mockPost).toBeCalledWith(
        endpointList.exercisesApi.favorites,
        body,
      );
      expect(result).toEqual(responseData);
    });

    it('should propagate errors', async () => {
      mockPost.mockRejectedValueOnce(new Error('400'));

      await expect(addFavoriteExercise({ exerciseId: 11 })).rejects.toThrow(
        '400',
      );
    });
  });

  describe('removeFavoriteExercise', () => {
    it('should DELETE favorite by id', async () => {
      mockDelete.mockResolvedValueOnce(undefined);

      await removeFavoriteExercise('fav1');

      expect(mockDelete).toBeCalledWith(
        endpointList.exercisesApi.deleteFavorite('fav1'),
      );
    });
  });
});
