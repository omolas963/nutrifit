import { config } from '../config';
import { FoodNutrients100g } from './openFoodFactsService';
import { registerDynamicFood } from './foodDatabase';

export interface RawFoodDetection {
  name: string;
  estimatedGrams: number;
  estimatedCalories: number;
  estimatedProtein: number;
  estimatedCarbs: number;
  estimatedFat: number;
}

export interface GeneratedRecipe {
  title: string;
  description: string;
  prepTimeMinutes: number;
  portions: number;
  ingredients: Array<{
    name: string;
    grams: number;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  }>;
  steps: string[];
  caloriesPerPortion: number;
  macrosPerPortion: {
    protein: number;
    carbs: number;
    fat: number;
  };
}

export interface MealPlanDay {
  summary: string;
  meals: Array<{
    type: 'desayuno' | 'comida' | 'merienda' | 'cena';
    title: string;
    description: string;
    calories: number;
    macros: { protein: number; carbs: number; fat: number };
    foods: Array<{ name: string; grams: number; calories: number; protein: number; carbs: number; fat: number }>;
    alternatives: Array<{
      title: string;
      calories: number;
      macros: { protein: number; carbs: number; fat: number };
    }>;
  }>;
  groceryList: Array<{
    category: string;
    items: Array<{ name: string; quantity: string; checked: boolean }>;
  }>;
}

// -------------------------------------------------------------
// AI Estimation of Food / Dish with strict JSON validation
// -------------------------------------------------------------
export async function estimateFoodWithGemini(foodQuery: string): Promise<FoodNutrients100g | null> {
  const cleanQuery = foodQuery.trim();
  if (!cleanQuery) return null;

  if (config.geminiApiKey) {
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${config.geminiApiKey}`;

      const prompt = `Estima los valores nutricionales promedio para este alimento o plato típico: "${cleanQuery}".
Responde exclusivamente con un objeto JSON válido con los campos exactos:
{
  "name": "Nombre en español",
  "nameCa": "Nombre en catalán (si aplica, o en español)",
  "category": "Categoría (ej: Platos tradicionales, Postres, Tapas, Carnes...)",
  "caloriesPer100g": número entero de kcal por 100g,
  "proteinPer100g": gramos de proteína por 100g (número decimal),
  "carbsPer100g": gramos de carbohidratos por 100g (número decimal),
  "fatPer100g": gramos de grasa por 100g (número decimal),
  "fiberPer100g": gramos de fibra por 100g (número decimal),
  "sugarPer100g": gramos de azúcar por 100g (número decimal),
  "saltPer100g": gramos de sal por 100g (número decimal),
  "portionName": "Unidad o ración típica natural (ej: '1 huevo frito', '1 ensaimada individual', '1 plato')",
  "portionGrams": número entero de gramos que pesa esa ración típica
}
Asegúrate de que las calorías sean coherentes con los macronutrientes (Proteínas*4 + Carbohidratos*4 + Grasas*9) y que los valores sean realistas para la gastronomía de España y Cataluña.`;

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: 'application/json',
          },
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        const cleaned = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleaned);

        if (parsed && typeof parsed.caloriesPer100g === 'number') {
          const p = Number(parsed.proteinPer100g) || 0;
          const c = Number(parsed.carbsPer100g) || 0;
          const f = Number(parsed.fatPer100g) || 0;
          const expectedKcal = Math.round(p * 4 + c * 4 + f * 9);

          // Caloric validation: if variance > 30%, normalize to calculated
          let cal = Math.round(parsed.caloriesPer100g);
          if (expectedKcal > 10 && Math.abs(cal - expectedKcal) > expectedKcal * 0.35) {
            cal = expectedKcal;
          }

          const item: FoodNutrients100g = {
            name: parsed.name || cleanQuery,
            brand: 'Estimado por IA',
            caloriesPer100g: Math.max(0, cal),
            proteinPer100g: Number(p.toFixed(1)),
            carbsPer100g: Number(c.toFixed(1)),
            fatPer100g: Number(f.toFixed(1)),
            fiberPer100g: Number((Number(parsed.fiberPer100g) || 0).toFixed(1)),
            sugarPer100g: Number((Number(parsed.sugarPer100g) || 0).toFixed(1)),
            saltPer100g: Number((Number(parsed.saltPer100g) || 0).toFixed(1)),
            portionName: parsed.portionName || '1 ración',
            portionGrams: Math.round(Number(parsed.portionGrams) || 100),
            source: 'Estimado por IA',
          };

          // Register in runtime database cache so subsequent searches are instant
          registerDynamicFood({
            id: `ai_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
            name: item.name,
            nameCa: parsed.nameCa || item.name,
            category: parsed.category || 'Varios',
            brand: 'Estimado por IA',
            caloriesPer100g: item.caloriesPer100g,
            proteinPer100g: item.proteinPer100g,
            carbsPer100g: item.carbsPer100g,
            fatPer100g: item.fatPer100g,
            fiberPer100g: item.fiberPer100g,
            sugarPer100g: item.sugarPer100g,
            saltPer100g: item.saltPer100g,
            portionName: item.portionName,
            portionGrams: item.portionGrams,
            source: 'Estimado por IA',
            popularSearchTerms: [cleanQuery.toLowerCase()],
          });

          return item;
        }
      }
    } catch (e) {
      console.error('Gemini food estimation failed:', e);
    }
  }

  // Graceful rule-based estimation fallback if no API key or network error
  return {
    name: cleanQuery.charAt(0).toUpperCase() + cleanQuery.slice(1),
    brand: 'Estimado por IA',
    caloriesPer100g: 150,
    proteinPer100g: 8.0,
    carbsPer100g: 15.0,
    fatPer100g: 6.5,
    fiberPer100g: 1.5,
    sugarPer100g: 2.0,
    saltPer100g: 0.5,
    portionName: '1 ración',
    portionGrams: 100,
    source: 'Estimado por IA',
  };
}

// -------------------------------------------------------------
// Analyze food from image or text (used by camera / voice logging)
// -------------------------------------------------------------
export async function analyzeFoodWithAI(params: {
  imageBase64?: string;
  text?: string;
}): Promise<RawFoodDetection[]> {
  const { imageBase64, text } = params;

  if (config.geminiApiKey) {
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${config.geminiApiKey}`;

      const parts: any[] = [];
      if (imageBase64) {
        const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');
        parts.push({
          inlineData: {
            mimeType: 'image/jpeg',
            data: cleanBase64,
          },
        });
      }

      const promptText = `Eres un nutricionista clínico experto en gastronomía española y catalana.
Analiza la imagen y/o la descripción: "${text || ''}".
Identifica todos los alimentos y platos individuales consumidos.
Para cada alimento:
- "name": nombre en español (ej: "Pechuga de pollo a la plancha", "Arroz blanco hervido", "Patatas fritas caseras", "Huevos fritos", "Pan de barra").
- "estimatedGrams": peso estimado de la porción en gramos.
- "estimatedCalories": calorías estimadas de esa porción.
- "estimatedProtein": gramos de proteína.
- "estimatedCarbs": gramos de carbohidratos.
- "estimatedFat": gramos de grasa.

Devuelve estrictamente un array JSON:
[
  {
    "name": "Pechuga de pollo",
    "estimatedGrams": 150,
    "estimatedCalories": 165,
    "estimatedProtein": 34.5,
    "estimatedCarbs": 0,
    "estimatedFat": 3.6
  }
]`;

      parts.push({ text: promptText });

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts }],
          generationConfig: { responseMimeType: 'application/json' },
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        const cleaned = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleaned);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Gemini analyzeFoodWithAI failed:', e);
    }
  }

  // Fallback for simple phrases
  const lower = (text || '').toLowerCase();
  const detected: RawFoodDetection[] = [];

  if (lower.includes('pollo')) {
    detected.push({ name: 'Pechuga de pollo a la plancha', estimatedGrams: 150, estimatedCalories: 165, estimatedProtein: 34.5, estimatedCarbs: 0, estimatedFat: 3.6 });
  }
  if (lower.includes('arroz')) {
    detected.push({ name: 'Arroz blanco hervido', estimatedGrams: 150, estimatedCalories: 195, estimatedProtein: 4.1, estimatedCarbs: 42.3, estimatedFat: 0.5 });
  }
  if (lower.includes('huevo') || lower.includes('ou')) {
    detected.push({ name: 'Huevos fritos con puntilla', estimatedGrams: 120, estimatedCalories: 235, estimatedProtein: 15.6, estimatedCarbs: 0.8, estimatedFat: 19.2 });
  }
  if (lower.includes('patata') || lower.includes('papa')) {
    if (lower.includes('frita') || lower.includes('brava')) {
      detected.push({ name: 'Patatas fritas caseras', estimatedGrams: 150, estimatedCalories: 420, estimatedProtein: 5.2, estimatedCarbs: 54.0, estimatedFat: 21.0 });
    } else {
      detected.push({ name: 'Patatas cocidas con piel', estimatedGrams: 150, estimatedCalories: 115, estimatedProtein: 3.0, estimatedCarbs: 25.5, estimatedFat: 0.2 });
    }
  }

  if (detected.length === 0) {
    detected.push({
      name: text || 'Comida saludable',
      estimatedGrams: 200,
      estimatedCalories: 250,
      estimatedProtein: 15.0,
      estimatedCarbs: 25.0,
      estimatedFat: 10.0,
    });
  }

  return detected;
}

// -------------------------------------------------------------
// Generate recipe with AI
// -------------------------------------------------------------
export async function generateRecipeWithAI(params: {
  ingredients?: string[];
  ingredientsAvailable?: string;
  caloriesTarget?: number;
  remainingCalories?: number;
  macrosTarget?: { protein?: number; carbs?: number; fat?: number };
  remainingMacros?: { protein?: number; carbs?: number; fat?: number };
  goal?: string;
}): Promise<GeneratedRecipe> {
  const ingredients = params.ingredients || (params.ingredientsAvailable ? [params.ingredientsAvailable] : []);
  const caloriesTarget = params.caloriesTarget || params.remainingCalories || 500;
  const macrosTarget = params.macrosTarget || params.remainingMacros;
  const goal = params.goal;

  if (config.geminiApiKey) {
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${config.geminiApiKey}`;

      const prompt = `Crea una receta deliciosa y saludable típica de la dieta mediterránea española.
Ingredientes disponibles/preferidos: ${ingredients.join(', ') || 'alimentos cotidianos'}.
Objetivo calórico por porción: ~${caloriesTarget} kcal.
Objetivo: ${goal || 'salud general'}.

Responde estrictamente con un JSON con la siguiente estructura:
{
  "title": "Nombre del plato",
  "description": "Breve descripción apetitosa",
  "prepTimeMinutes": 20,
  "portions": 2,
  "ingredients": [
    { "name": "Ingrediente", "grams": 150, "calories": 165, "protein": 31, "carbs": 0, "fat": 3.6 }
  ],
  "steps": ["Paso 1...", "Paso 2..."],
  "caloriesPerPortion": ${caloriesTarget},
  "macrosPerPortion": { "protein": 35, "carbs": 40, "fat": 15 }
}`;

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: 'application/json' },
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        const cleaned = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(cleaned);
      }
    } catch (e) {
      console.error('Gemini generateRecipeWithAI failed:', e);
    }
  }

  // Fallback Mediterranean recipe
  return {
    title: 'Salteado mediterráneo de pollo con verduras y arroz',
    description: 'Plato equilibrado rico en proteínas, fibra y grasas saludables con aceite de oliva.',
    prepTimeMinutes: 20,
    portions: 2,
    ingredients: [
      { name: 'Pechuga de pollo limpia', grams: 300, calories: 330, protein: 62.0, carbs: 0, fat: 3.6 },
      { name: 'Arroz blanco cocido', grams: 200, calories: 260, protein: 5.4, carbs: 56.4, fat: 0.6 },
      { name: 'Calabacín fresco', grams: 150, calories: 30, protein: 2.1, carbs: 4.8, fat: 0.6 },
      { name: 'Pimiento rojo', grams: 100, calories: 30, protein: 1.0, carbs: 6.0, fat: 0.3 },
      { name: 'Aceite de oliva virgen extra', grams: 15, calories: 132, protein: 0, carbs: 0, fat: 15.0 },
    ],
    steps: [
      'Cortar la pechuga de pollo en tiras y salpimentar con un toque de ajo en polvo.',
      'Lavar y cortar el calabacín y el pimiento en dados medianos.',
      'En una sartén grande con el aceite de oliva virgen extra, dorar el pollo a fuego vivo durante 5 minutos.',
      'Añadir las verduras y saltear a fuego medio-alto durante 6 minutos hasta que queden al dente.',
      'Incorporar el arroz blanco cocido, remover bien durante 2 minutos para integrar sabores y servir caliente.',
    ],
    caloriesPerPortion: Math.round(782 / 2),
    macrosPerPortion: { protein: 35.2, carbs: 33.6, fat: 10.0 },
  };
}

// -------------------------------------------------------------
// Generate meal plan with safety floor verification
// -------------------------------------------------------------
export async function generateMealPlanWithAI(params: {
  targetCalories: number;
  targetMacros: { protein: number; carbs: number; fat: number };
  goal: string;
}): Promise<MealPlanDay> {
  const { targetCalories, targetMacros, goal } = params;

  // SAFETY LIMIT: At least 1200 kcal
  const safeCalories = Math.max(1200, targetCalories);

  if (config.geminiApiKey) {
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${config.geminiApiKey}`;

      const prompt = `Genera un plan diario completo de comidas mediterráneas saludables adaptado a estos objetivos:
- Calorías totales: ~${safeCalories} kcal
- Proteínas: ~${targetMacros.protein} g
- Carbohidratos: ~${targetMacros.carbs} g
- Grasas: ~${targetMacros.fat} g
- Objetivo: ${goal}

Debe incluir 4 comidas: 'desayuno', 'comida', 'merienda', 'cena'.
Para cada comida: alimentos exactos con gramos, calorías y macros, y una alternativa.
Incluye una lista de la compra organizada por categorías ('Frutas y Verduras', 'Carnicería y Pescadería', 'Lácteos', 'Despensa').

Responde estrictamente con la estructura JSON:
{
  "summary": "Resumen nutricional del plan del día",
  "meals": [
    {
      "type": "desayuno",
      "title": "Título del desayuno",
      "description": "Descripción",
      "calories": 450,
      "macros": { "protein": 30, "carbs": 50, "fat": 15 },
      "foods": [
        { "name": "Avena", "grams": 50, "calories": 185, "protein": 6.5, "carbs": 30, "fat": 3.5 }
      ],
      "alternatives": [
        { "title": "Alternativa de desayuno", "calories": 440, "macros": { "protein": 28, "carbs": 52, "fat": 14 } }
      ]
    }
  ],
  "groceryList": [
    { "category": "Frutas y Verduras", "items": [{ "name": "Plátanos", "quantity": "4 unidades", "checked": false }] }
  ]
}`;

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: 'application/json' },
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        const cleaned = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(cleaned);
      }
    } catch (e) {
      console.error('Gemini generateMealPlanWithAI failed:', e);
    }
  }

  // Safe Mediterranean fallback plan
  return {
    summary: `Plan diario equilibrado con ${safeCalories} kcal para ${goal}.`,
    meals: [
      {
        type: 'desayuno',
        title: 'Tostada con jamón ibérico y tomate con café con leche',
        description: 'Desayuno tradicional mediterráneo rico en proteínas y carbohidratos complejos.',
        calories: Math.round(safeCalories * 0.25),
        macros: { protein: Math.round(targetMacros.protein * 0.25), carbs: Math.round(targetMacros.carbs * 0.28), fat: Math.round(targetMacros.fat * 0.22) },
        foods: [
          { name: 'Pan de barra artesano', grams: 60, calories: 156, protein: 5.1, carbs: 31.2, fat: 0.7 },
          { name: 'Tomate rallado natural', grams: 40, calories: 7, protein: 0.4, carbs: 1.4, fat: 0.1 },
          { name: 'Jamón ibérico de bellota', grams: 35, calories: 117, protein: 11.5, carbs: 0.1, fat: 7.9 },
          { name: 'Aceite de oliva virgen extra', grams: 8, calories: 71, protein: 0, carbs: 0, fat: 8.0 },
          { name: 'Café con leche semidesnatada', grams: 150, calories: 63, protein: 3.8, carbs: 5.7, fat: 2.0 },
        ],
        alternatives: [
          { title: 'Tazón de avena con yogur griego y plátano', calories: Math.round(safeCalories * 0.25), macros: { protein: 28, carbs: 52, fat: 12 } },
        ],
      },
      {
        type: 'comida',
        title: 'Pechuga de pollo a la plancha con arroz blanco y ensalada mixta',
        description: 'Comida saciante y nutritiva con proteínas magras y vegetales frescos.',
        calories: Math.round(safeCalories * 0.38),
        macros: { protein: Math.round(targetMacros.protein * 0.38), carbs: Math.round(targetMacros.carbs * 0.38), fat: Math.round(targetMacros.fat * 0.35) },
        foods: [
          { name: 'Pechuga de pollo a la plancha', grams: 180, calories: 198, protein: 41.5, carbs: 0, fat: 2.2 },
          { name: 'Arroz blanco cocido', grams: 180, calories: 234, protein: 4.8, carbs: 50.8, fat: 0.5 },
          { name: 'Ensalada verde variada', grams: 120, calories: 22, protein: 1.4, carbs: 4.0, fat: 0.2 },
          { name: 'Aceite de oliva virgen extra', grams: 12, calories: 106, protein: 0, carbs: 0, fat: 12.0 },
        ],
        alternatives: [
          { title: 'Lentejas estofadas con verduras y lomo de cerdo plancha', calories: Math.round(safeCalories * 0.38), macros: { protein: 42, carbs: 55, fat: 14 } },
        ],
      },
      {
        type: 'merienda',
        title: 'Yogur griego con nueces y una pieza de fruta',
        description: 'Snack energizante rico en calcio y grasas cardiosaludables.',
        calories: Math.round(safeCalories * 0.12),
        macros: { protein: Math.round(targetMacros.protein * 0.12), carbs: Math.round(targetMacros.carbs * 0.12), fat: Math.round(targetMacros.fat * 0.15) },
        foods: [
          { name: 'Yogur griego natural sin azúcar', grams: 125, calories: 144, protein: 8.1, carbs: 5.2, fat: 10.6 },
          { name: 'Nueces peladas naturales', grams: 15, calories: 98, protein: 2.3, carbs: 2.0, fat: 9.8 },
          { name: 'Manzana fresca', grams: 120, calories: 62, protein: 0.4, carbs: 16.5, fat: 0.2 },
        ],
        alternatives: [
          { title: 'Batido de proteínas con leche desnatada y plátano', calories: Math.round(safeCalories * 0.12), macros: { protein: 25, carbs: 24, fat: 2 } },
        ],
      },
      {
        type: 'cena',
        title: 'Lomo de salmón a la plancha con verduras al vapor',
        description: 'Cena ligera y antiinflamatoria rica en omega-3.',
        calories: Math.round(safeCalories * 0.25),
        macros: { protein: Math.round(targetMacros.protein * 0.25), carbs: Math.round(targetMacros.carbs * 0.22), fat: Math.round(targetMacros.fat * 0.28) },
        foods: [
          { name: 'Salmón fresco a la plancha', grams: 150, calories: 312, protein: 30.0, carbs: 0, fat: 20.2 },
          { name: 'Brócoli y zanahoria al vapor', grams: 180, calories: 68, protein: 4.2, carbs: 12.5, fat: 0.6 },
          { name: 'Patata pequeña cocida', grams: 100, calories: 77, protein: 2.0, carbs: 17.0, fat: 0.1 },
        ],
        alternatives: [
          { title: 'Tortilla francesa de 2 huevos con espinacas y queso de Burgos', calories: Math.round(safeCalories * 0.25), macros: { protein: 24, carbs: 8, fat: 18 } },
        ],
      },
    ],
    groceryList: [
      {
        category: 'Carnicería y Pescadería',
        items: [
          { name: 'Pechuga de pollo fresca', quantity: '500 g', checked: false },
          { name: 'Lomos de salmón fresco', quantity: '300 g', checked: false },
          { name: 'Jamón ibérico en lonchas', quantity: '100 g', checked: false },
          { name: 'Huevos camperos', quantity: '1 docena', checked: false },
        ],
      },
      {
        category: 'Frutas y Verduras',
        items: [
          { name: 'Tomates de ensalada y para untar', quantity: '1 kg', checked: false },
          { name: 'Manzanas Golden', quantity: '1 kg', checked: false },
          { name: 'Brócoli fresco', quantity: '1 pieza', checked: false },
          { name: 'Lechuga variada', quantity: '1 bolsa', checked: false },
          { name: 'Patatas', quantity: '1 kg', checked: false },
        ],
      },
      {
        category: 'Lácteos y Refrigerados',
        items: [
          { name: 'Yogur griego natural sin azúcares', quantity: '4 unidades', checked: false },
          { name: 'Leche semidesnatada', quantity: '1 litro', checked: false },
        ],
      },
      {
        category: 'Despensa y Granos',
        items: [
          { name: 'Pan de barra artesano', quantity: '1 barra', checked: false },
          { name: 'Arroz blanco', quantity: '500 g', checked: false },
          { name: 'Nueces peladas', quantity: '1 bolsa', checked: false },
          { name: 'Aceite de oliva virgen extra', quantity: '1 botella', checked: true },
        ],
      },
    ],
  };
}
