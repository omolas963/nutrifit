import { FoodNutrients100g } from './openFoodFactsService';
import { config } from '../config';

// Common ES/CA to EN food translations for USDA querying
const ES_EN_MAP: Record<string, string> = {
  huevo: 'egg',
  huevos: 'eggs',
  'huevos fritos': 'fried eggs',
  'huevo frito': 'fried egg',
  ou: 'egg',
  ous: 'eggs',
  'ous ferrats': 'fried eggs',
  pollo: 'chicken',
  'pechuga de pollo': 'chicken breast',
  'pit de pollastre': 'chicken breast',
  ternera: 'beef',
  cerdo: 'pork',
  arroz: 'rice',
  arros: 'rice',
  'arroz blanco': 'white rice',
  patata: 'potato',
  patatas: 'potatoes',
  'patatas fritas': 'french fries',
  patates: 'potatoes',
  manzana: 'apple',
  poma: 'apple',
  platano: 'banana',
  platan: 'banana',
  leche: 'milk',
  llet: 'milk',
  pan: 'bread',
  pa: 'bread',
  lentejas: 'lentils',
  llenties: 'lentils',
  garbanzos: 'chickpeas',
  cigrons: 'chickpeas',
  alubias: 'beans',
  mongetes: 'beans',
  salmon: 'salmon',
  salmo: 'salmon',
  merluza: 'hake',
  atun: 'tuna',
  tonyina: 'tuna',
  aceite: 'olive oil',
  oli: 'olive oil',
  ensalada: 'salad',
  amanida: 'salad',
  queso: 'cheese',
  formatge: 'cheese',
};

function translateToEnglish(query: string): string {
  const norm = query
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

  if (ES_EN_MAP[norm]) return ES_EN_MAP[norm];

  // Word by word fallback
  const words = norm.split(/\s+/);
  const translated = words.map(w => ES_EN_MAP[w] || w);
  return translated.join(' ');
}

export async function searchUSDA(query: string): Promise<FoodNutrients100g[]> {
  try {
    const enQuery = translateToEnglish(query);
    const encoded = encodeURIComponent(enQuery);
    const apiKey = config.usdaApiKey || 'DEMO_KEY';
    const url = `https://api.nal.usda.gov/fdc/v1/foods/search?query=${encoded}&pageSize=5&api_key=${apiKey}`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2500);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: { 'Accept': 'application/json' },
    }).finally(() => clearTimeout(timeout));

    if (!response.ok) return [];

    const data: any = await response.json();
    if (!data.foods || !Array.isArray(data.foods)) return [];

    const results: FoodNutrients100g[] = [];

    for (const food of data.foods) {
      let calories = 0;
      let protein = 0;
      let carbs = 0;
      let fat = 0;

      if (Array.isArray(food.foodNutrients)) {
        for (const n of food.foodNutrients) {
          const name = (n.nutrientName || '').toLowerCase();
          const number = n.nutrientNumber;
          const val = Number(n.value || 0);

          if (number === '1008' || name.includes('energy') || name.includes('calorie')) {
            if (n.unitName === 'KCAL' || !calories) calories = Math.round(val);
          } else if (number === '1003' || name.includes('protein')) {
            protein = Number(val.toFixed(1));
          } else if (number === '1005' || name.includes('carbohydrate')) {
            carbs = Number(val.toFixed(1));
          } else if (number === '1004' || name.includes('total lipid') || name === 'fat') {
            fat = Number(val.toFixed(1));
          }
        }
      }

      if (calories > 0 || protein > 0 || carbs > 0 || fat > 0) {
        results.push({
          name: query.charAt(0).toUpperCase() + query.slice(1),
          brand: food.brandOwner || 'Genérico',
          caloriesPer100g: calories,
          proteinPer100g: protein,
          carbsPer100g: carbs,
          fatPer100g: fat,
          source: 'USDA',
          portionName: '1 ración',
          portionGrams: 100,
        });
      }
    }

    return results;
  } catch {
    return [];
  }
}
