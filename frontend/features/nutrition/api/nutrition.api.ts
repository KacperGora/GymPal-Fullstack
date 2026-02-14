import type {
  DailyStats,
  FavoriteMeal,
  Meal,
  RecentMeal,
  TdeeResponse,
} from '../types';
import type {
  CreateMealDto,
  MealSuggestionRequest,
  MealSuggestionsResponse,
  UpdateMealDto,
} from '@gympal/shared';

import { api } from '@/shared/api/axios';
import { endpointList } from '@/shared/api/endpoint';

export const getMeals = async (date?: string): Promise<Meal[]> => {
  const params = date ? { date } : {};
  const res = await api.get(endpointList.meals.list, { params });
  return res.data as Meal[];
};

export const createMeal = async (data: CreateMealDto): Promise<Meal> => {
  const res = await api.post(endpointList.meals.create, data);
  return res.data as Meal;
};

export const updateMeal = async (
  id: string,
  data: UpdateMealDto,
): Promise<Meal> => {
  const res = await api.patch(endpointList.meals.update(id), data);
  return res.data as Meal;
};

export const deleteMeal = async (id: string): Promise<void> => {
  await api.delete(endpointList.meals.delete(id));
};

export const getRecentMeals = async (): Promise<RecentMeal[]> => {
  const res = await api.get(endpointList.meals.recent);
  return res.data as RecentMeal[];
};

export const getDailyStats = async (date: string): Promise<DailyStats> => {
  const res = await api.get(endpointList.nutrition.dailyStats, {
    params: { date },
  });
  return res.data as DailyStats;
};

export const getTdee = async (): Promise<TdeeResponse> => {
  const res = await api.get(endpointList.nutrition.tdee);
  return res.data as TdeeResponse;
};

export interface WeeklyStatsItem {
  date: string;
  calories: number;
}

export const getWeeklyStats = async (
  date: string,
): Promise<WeeklyStatsItem[]> => {
  const res = await api.get(endpointList.nutrition.weeklyStats, {
    params: { date },
  });
  return res.data as WeeklyStatsItem[];
};

export interface WaterIntakeResponse {
  glasses: number;
}

export const getWaterIntake = async (
  date: string,
): Promise<WaterIntakeResponse> => {
  const res = await api.get(endpointList.water.get, { params: { date } });
  return res.data as WaterIntakeResponse;
};

export const addWaterGlass = async (
  date: string,
): Promise<WaterIntakeResponse> => {
  const res = await api.post(endpointList.water.add, null, {
    params: { date },
  });
  return res.data as WaterIntakeResponse;
};

export const removeWaterGlass = async (
  date: string,
): Promise<WaterIntakeResponse> => {
  const res = await api.post(endpointList.water.remove, null, {
    params: { date },
  });
  return res.data as WaterIntakeResponse;
};

// Favorites API
export const getFavorites = async (): Promise<FavoriteMeal[]> => {
  const res = await api.get(endpointList.favorites.list);
  return res.data as FavoriteMeal[];
};

export interface CreateFavoriteDto {
  name: string;
  calories: number;
  proteins: number;
  carbs: number;
  fats: number;
  category?: 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK';
}

export const createFavorite = async (
  data: CreateFavoriteDto,
): Promise<FavoriteMeal> => {
  const res = await api.post(endpointList.favorites.create, data);
  return res.data as FavoriteMeal;
};

export const deleteFavorite = async (id: string): Promise<void> => {
  await api.delete(endpointList.favorites.delete(id));
};

// AI Meal Suggestions
export const getMealSuggestions = async (
  data: MealSuggestionRequest,
): Promise<MealSuggestionsResponse> => {
  const res = await api.post(endpointList.ai.mealSuggestions, data);
  return res.data as MealSuggestionsResponse;
};
