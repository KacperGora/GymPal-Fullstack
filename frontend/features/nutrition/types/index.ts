export type MealCategory = 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK';

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
