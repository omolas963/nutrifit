import { FoodItem, Recipe, MealPlan } from '../types';

export interface FoodAnalysisResponse {
  foods: FoodItem[];
}

export async function apiAnalyzeFood(params: {
  imageBase64?: string;
  text?: string;
}): Promise<FoodItem[]> {
  try {
    const res = await fetch('/api/ai/analyze-food', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Error al analizar comida con IA');
    }

    const data = await res.json();
    return data.foods || [];
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
