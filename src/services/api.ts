import { FoodItem, Recipe, MealPlan } from '../types';

export interface IngredientItem {
  name: string;
  grams: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface EnrichedFoodItem extends FoodItem {
  type?: 'plato' | 'ingrediente' | 'producto_envasado' | 'bebida';
  cookingMethod?: string;
  markerPosition?: {
    xPercent: number;
    yPercent: number;
    index: number;
  };
  box2d?: [number, number, number, number];
  isComposite?: boolean;
  ingredientsBreakdown?: IngredientItem[];
  gramsRange?: [number, number];
  confidence?: number;
  confidenceBadge?: 'Alta' | 'Media' | 'Baja';
  confidencePercent?: number;
  visualReasoning?: string;
  isUncertain?: boolean;
  alternatives?: string[];
  caloriesPer100g?: number;
  proteinPer100g?: number;
  carbsPer100g?: number;
  fatPer100g?: number;
  portionName?: string;
  portionGrams?: number;
}

export interface VisionAnalysisResponse {
  success: boolean;
  isFood: boolean;
  imageQuality: 'good' | 'blurry' | 'too_dark' | 'unclear';
  rejectionReason?: string;
  isNutritionLabelOrReceipt?: boolean;
  ocrData?: {
    productName?: string;
    caloriesPer100g?: number;
    proteinPer100g?: number;
    carbsPer100g?: number;
    fatPer100g?: number;
    suggestedPortionGrams?: number;
    extractedTextSnippet?: string;
  };
  barcode?: string;
  confirmedItems: EnrichedFoodItem[];
  doubtfulItems: EnrichedFoodItem[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  foods: EnrichedFoodItem[];
}

export async function apiAnalyzeFood(params: {
  imageBase64?: string;
  text?: string;
}): Promise<VisionAnalysisResponse> {
  try {
    const res = await fetch('/api/ai/analyze-food', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || err.rejectionReason || 'Error al analizar comida con IA');
    }

    const data: VisionAnalysisResponse = await res.json();
    return data;
  } catch (error: any) {
    console.error('apiAnalyzeFood error:', error);
    throw error;
  }
}

export async function apiGenerateRecipe(params: {
  remainingCalories: number;
  remainingMacros: { protein: number; carbs: number; fat: number };
  ingredientsAvailable: string;
  goal: string;
}): Promise<Recipe> {
  try {
    const res = await fetch('/api/ai/generate-recipe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Error al generar la receta');
    }

    const data = await res.json();
    const r = data.recipe;
    return {
      id: `ai-rec-${Date.now()}`,
      title: r.title,
      description: r.description,
      prepTimeMinutes: r.prepTimeMinutes || 20,
      portions: r.portions || 1,
      isFavorite: false,
      ingredients: r.ingredients || [],
      steps: r.steps || [],
      caloriesPerPortion: r.caloriesPerPortion,
      proteinPerPortion: r.macrosPerPortion?.protein || 0,
      carbsPerPortion: r.macrosPerPortion?.carbs || 0,
      fatPerPortion: r.macrosPerPortion?.fat || 0,
      createdAt: new Date().toISOString(),
    };
  } catch (error: any) {
    console.error('apiGenerateRecipe error:', error);
    throw error;
  }
}

export async function apiGenerateMealPlan(params: {
  targetCalories: number;
  targetMacros: { protein: number; carbs: number; fat: number };
  goal: string;
}): Promise<MealPlan> {
  try {
    const res = await fetch('/api/ai/generate-meal-plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Error al generar el plan de comidas');
    }

    const data = await res.json();
    const plan = data.plan;
    return {
      id: `mealplan-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      summary: plan.summary,
      meals: plan.meals,
      groceryList: plan.groceryList,
    };
  } catch (error: any) {
    console.error('apiGenerateMealPlan error:', error);
    throw error;
  }
}

export async function apiSearchFood(query: string): Promise<any[]> {
  try {
    const res = await fetch(`/api/food/search?q=${encodeURIComponent(query)}`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.results || [];
  } catch (error) {
    console.error('apiSearchFood error:', error);
    return [];
  }
}

export async function apiEstimateFood(name: string): Promise<any | null> {
  try {
    const res = await fetch('/api/food/estimate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.food || null;
  } catch (error) {
    console.error('apiEstimateFood error:', error);
    return null;
  }
}

export async function apiSaveCustomFood(foodData: any): Promise<any | null> {
  try {
    const res = await fetch('/api/food/custom', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(foodData),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.food || null;
  } catch (error) {
    console.error('apiSaveCustomFood error:', error);
    return null;
  }
}

export async function apiChatAssistant(payload: {
  messages: Array<{ role: 'user' | 'assistant'; content: string }>;
  userProfile?: any;
  todaySummary?: any;
  recentEntries?: any[];
  savedRecipes?: any[];
  memories?: string[];
}): Promise<string> {
  try {
    const res = await fetch('/api/assistant/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Error en el asistente');
    }
    const data = await res.json();
    return data.reply || '';
  } catch (error: any) {
    console.error('apiChatAssistant error:', error);
    throw error;
  }
}

export async function apiLookupBarcode(barcode: string): Promise<any | null> {
  try {
    const res = await fetch(`/api/food/barcode/${encodeURIComponent(barcode)}`);
    if (!res.ok) return null;
    const data = await res.json();
    return data.product || null;
  } catch (error) {
    console.error('apiLookupBarcode error:', error);
    return null;
  }
}
