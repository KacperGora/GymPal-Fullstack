import type {
  WgerExercise,
  WgerPaginated,
  WgerCategory,
  WgerMuscle,
  WgerEquipment,
  FavoriteExercise,
} from '../types';
import type { CreateFavoriteExerciseDto } from '@gympal/shared';

import { api } from '@/shared/api/axios';
import { endpointList } from '@/shared/api/endpoint';

export interface ExerciseSearchParams {
  limit?: number;
  offset?: number;
  lang?: string;
}

export const getExercises = async (
  params?: ExerciseSearchParams,
): Promise<WgerPaginated> => {
  const res = await api.get(endpointList.exercisesApi.list, { params });
  return res.data as WgerPaginated;
};

export const getExerciseById = async (
  id: number,
  lang?: string,
): Promise<WgerExercise> => {
  const res = await api.get(endpointList.exercisesApi.exercise(id), {
    params: lang ? { lang } : undefined,
  });
  return res.data as WgerExercise;
};

export const getExercisesByCategory = async (
  categoryId: number,
  params?: ExerciseSearchParams,
): Promise<WgerPaginated> => {
  const res = await api.get(endpointList.exercisesApi.byCategory(categoryId), {
    params,
  });
  return res.data as WgerPaginated;
};

export const searchExercises = async (
  term: string,
  params?: ExerciseSearchParams,
): Promise<WgerExercise[]> => {
  const res = await api.get(endpointList.exercisesApi.search(term), {
    params,
  });
  return res.data as WgerExercise[];
};

export const getCategories = async (): Promise<WgerCategory[]> => {
  const res = await api.get(endpointList.exercisesApi.categories);
  return res.data as WgerCategory[];
};

export const getMuscles = async (): Promise<WgerMuscle[]> => {
  const res = await api.get(endpointList.exercisesApi.muscles);
  return res.data as WgerMuscle[];
};

export const getEquipmentList = async (): Promise<WgerEquipment[]> => {
  const res = await api.get(endpointList.exercisesApi.equipment);
  return res.data as WgerEquipment[];
};

export const getFavoriteExercises = async (): Promise<FavoriteExercise[]> => {
  const res = await api.get(endpointList.exercisesApi.favorites);
  return res.data as FavoriteExercise[];
};

export const getFavoriteExerciseIds = async (): Promise<number[]> => {
  const res = await api.get(endpointList.exercisesApi.favoriteIds);
  return res.data as number[];
};

export const addFavoriteExercise = async (
  data: CreateFavoriteExerciseDto,
): Promise<FavoriteExercise> => {
  const res = await api.post(endpointList.exercisesApi.favorites, data);
  return res.data as FavoriteExercise;
};

export const removeFavoriteExercise = async (id: string): Promise<void> => {
  await api.delete(endpointList.exercisesApi.deleteFavorite(id));
};
