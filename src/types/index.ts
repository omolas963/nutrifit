export type GoalType = 'lose' | 'maintain' | 'gain';
export type Gender = 'male' | 'female';
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'very_active' | 'athlete';
export type MealType = 'desayuno' | 'comida' | 'merienda' | 'cena' | 'snacks';

export type AuthProvider = 'google' | 'samsung' | 'email' | 'guest';

export interface UserAccount {
  id: string;
  email: string;
  name: string;
  provider: AuthProvider;
  avatarUrl?: string;
  hasCompletedAssessment: boolean;
  createdAt: string;
}

export type BodyFatLevel = 'low' | 'medium' | 'high' | 'unknown';
export type WorkType = 'sedentary' | 'standing' | 'physical';
export type WorkoutType = 'strength' | 'cardio' | 'hiit' | 'mixed' | 'none';
export type DietaryPreference = 'standard' | 'vegetarian' | 'vegan' | 'keto' | 'mediterranean' | 'gluten_free';
export type MacroExperience = 'beginner' | 'intermediate' | 'advanced';

export interface UserProfile {
  id: string;
  name: string;
  email?: string;
  provider?: AuthProvider;
  avatarUrl?: string;
  gender: Gender;
  age: number;
  heightCm: number;
  currentWeightKg: number;
  targetWeightKg: number;
  goal: GoalType;
  activityLevel: ActivityLevel;
  weeklyPaceKg: number;
  dailyCalorieTarget: number;
  dailyProteinTargetGrams: number;
  dailyCarbsTargetGrams: number;
  dailyFatTargetGrams: number;
  dailyWaterTargetMl: number;
  
  // Extended professional assessment fields
  bodyFatEstimate?: BodyFatLevel;
  workType?: WorkType;
  exerciseDaysPerWeek?: number;
  workoutType?: WorkoutType;
  dietaryPreference?: DietaryPreference;
  mealsPerDay?: number;
  macroExperience?: MacroExperience;
  mainMotivation?: string;

  theme: 'light' | 'dark';
  units: 'metric' | 'imperial';
  createdAt: string;
  updatedAt: string;
}

export interface FoodItem {
  id: string;
  name: string;
  nameCa?: string;
  grams: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  source: 'Open Food Facts' | 'USDA' | 'Estimado por IA' | 'Manual' | 'Base de datos oficial' | string;
  isEstimated: boolean;
  barcode?: string;
  brand?: string;
}

export interface FoodEntry extends FoodItem {
  mealType: MealType;
  date: string; // YYYY-MM-DD
  loggedAt: string; // ISO
}

export interface RecipeIngredient {
  name: string;
  grams: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  prepTimeMinutes: number;
  portions: number;
  isFavorite: boolean;
  ingredients: RecipeIngredient[];
  suggestedPantryItems?: string[];
  steps: string[];
  caloriesPerPortion: number;
  proteinPerPortion: number;
  carbsPerPortion: number;
  fatPerPortion: number;
  createdAt: string;
}

export interface MealPlanItem {
  type: MealType;
  title: string;
  description: string;
  calories: number;
  macros: { protein: number; carbs: number; fat: number };
  foods: Array<{
    name: string;
    grams: number;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  }>;
  alternatives: Array<{
    title: string;
    calories: number;
    macros: { protein: number; carbs: number; fat: number };
  }>;
}

export interface GroceryItem {
  name: string;
  quantity: string;
  checked: boolean;
}

export interface GroceryCategory {
  category: string;
  items: GroceryItem[];
}

export interface MealPlan {
  id: string;
  date: string;
  summary: string;
  meals: MealPlanItem[];
  groceryList: GroceryCategory[];
}

export interface WeightLog {
  id: string;
  date: string; // YYYY-MM-DD
  weightKg: number;
  notes?: string;
  createdAt: string;
}

export interface WaterLog {
  date: string; // YYYY-MM-DD
  amountMl: number;
}
