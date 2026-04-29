import type { MealCategory } from "../schemas/meals.schema.js";

export interface Meal {
  id: string;
  name: string;
  calories: number;
  proteins: number;
  carbs: number;
  fats: number;
  category: MealCategory;
  date: string;
  userId: number;
  createdAt: string;
  updatedAt: string;
}

export interface DailyStats {
  date: string;
  totalCalories: number;
  totalProteins: number;
  totalCarbs: number;
  totalFats: number;
  mealsCount: number;
}

export interface TdeeResponse {
  tdee: number;
  bmr: number;
  targetCalories: number;
  targetProteins: number;
  targetCarbs: number;
  targetFats: number;
  goal: string;
}

export interface FavoriteMeal {
  id: string;
  name: string;
  calories: number;
  proteins: number;
  carbs: number;
  fats: number;
  category: MealCategory;
  userId: number;
  createdAt: string;
}

export interface RecentMeal {
  name: string;
  calories: number;
  proteins: number;
  carbs: number;
  fats: number;
  category: MealCategory;
}

export interface WeeklyStatsItem {
  date: string;
  calories: number;
}

export interface WaterIntakeResponse {
  glasses: number;
}
