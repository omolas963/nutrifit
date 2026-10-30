import { UserProfile, FoodEntry, Recipe, WeightLog, MealPlan } from '../../types';

export function getEmptyUserData(): {
  profile: null;
  foodEntries: FoodEntry[];
  recipes: Recipe[];
  weightLogs: WeightLog[];
  waterAmount: number;
  mealPlan: null;
} {
  return {
    profile: null,
    foodEntries: [],
    recipes: [],
    weightLogs: [],
    waterAmount: 0,
    mealPlan: null,
  };
}
