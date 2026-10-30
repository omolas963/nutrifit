import { UserProfile, FoodEntry, Recipe, WeightLog, MealPlan } from '../../types';

export interface IDataRepository {
  // Perfil de usuario
  getProfile(): Promise<UserProfile | null>;
  saveProfile(profile: UserProfile): Promise<void>;

  // Diario de alimentos
  getFoodEntriesByDate(date: string): Promise<FoodEntry[]>;
  getAllFoodEntries(): Promise<FoodEntry[]>;
  addFoodEntry(entry: Omit<FoodEntry, 'id'>): Promise<FoodEntry>;
  updateFoodEntry(entry: FoodEntry): Promise<void>;
  deleteFoodEntry(id: string): Promise<void>;

  // Registro de Agua
  getWaterByDate(date: string): Promise<number>;
  setWaterByDate(date: string, amountMl: number): Promise<void>;

  // Recetas
  getRecipes(): Promise<Recipe[]>;
  saveRecipe(recipe: Recipe): Promise<void>;
  deleteRecipe(id: string): Promise<void>;
  toggleFavoriteRecipe(id: string): Promise<void>;

  // Registro de Peso
  getWeightLogs(): Promise<WeightLog[]>;
  addWeightLog(log: WeightLog): Promise<void>;
  deleteWeightLog(id: string): Promise<void>;

  // Plan de Comidas
  getMealPlan(): Promise<MealPlan | null>;
  saveMealPlan(plan: MealPlan): Promise<void>;

  // Búsquedas recientes y alimentos favoritos
  getRecentSearches(): Promise<string[]>;
  addRecentSearch(query: string): Promise<void>;

  // Copia de seguridad y gestión
  exportData(): Promise<string>;
  importData(jsonData: string): Promise<boolean>;
  clearData(): Promise<void>;
  seedInitialData(): Promise<void>;
}
