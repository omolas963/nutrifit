export interface FoodNutrients100g {
  name: string;
  brand?: string;
  caloriesPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
  source: 'Open Food Facts' | 'USDA' | 'Estimado por IA' | 'Base de datos oficial';
  barcode?: string;
  portionName?: string;
  portionGrams?: number;
  isStandard?: boolean;
}

export async function searchOpenFoodFacts(query: string): Promise<FoodNutrients100g[]> {
  try {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    const encoded = encodeURIComponent(query.trim());
    // Use Spanish Open Food Facts endpoint with modern JSON parameters
    const url = `https://es.openfoodfacts.org/cgi/search.pl?search_terms=${encoded}&search_simple=1&action=process&json=1&page_size=10`;
    
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2500);

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'NutriFitDesktop/1.0 (contact@nutrifit.app)',
        'Accept': 'application/json',
      },
      signal: controller.signal,
    }).finally(() => clearTimeout(timeout));

    if (!response.ok) {
      return [];
    }

    const data: any = await response.json();
    if (!data.products || !Array.isArray(data.products)) {
      return [];
    }

    const results: FoodNutrients100g[] = [];

    for (const p of data.products) {
      const nutriments = p.nutriments || {};
      const energyKcal = nutriments['energy-kcal_100g'] ?? nutriments['energy-kcal'] ?? (nutriments['energy_100g'] ? Math.round(nutriments['energy_100g'] / 4.184) : 0);
      const protein = nutriments['proteins_100g'] ?? nutriments['proteins'] ?? 0;
      const carbs = nutriments['carbohydrates_100g'] ?? nutriments['carbohydrates'] ?? 0;
      const fat = nutriments['fat_100g'] ?? nutriments['fat'] ?? 0;

      const name = p.product_name_es || p.product_name || query;
      const brand = p.brands ? p.brands.split(',')[0].trim() : undefined;

      if (name && (energyKcal > 0 || protein > 0 || carbs > 0 || fat > 0)) {
        results.push({
          name: name.trim(),
          brand,
          caloriesPer100g: Math.round(Number(energyKcal) || 0),
          proteinPer100g: Number((Number(protein) || 0).toFixed(1)),
          carbsPer100g: Number((Number(carbs) || 0).toFixed(1)),
          fatPer100g: Number((Number(fat) || 0).toFixed(1)),
          source: 'Open Food Facts',
          barcode: p.code,
        });
      }
    }

    return results;
  } catch {
    // Graceful fallback without crashing
    return [];
  }
}

export async function getProductByBarcode(barcode: string): Promise<FoodNutrients100g | null> {
  try {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    const cleanCode = barcode.trim();
    const url = `https://world.openfoodfacts.org/api/v2/product/${cleanCode}.json`;
    
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'NutriFitDesktop/1.0 (contact@nutrifit.app)',
        'Accept': 'application/json',
      },
      signal: controller.signal,
    }).finally(() => clearTimeout(timeout));

    if (!response.ok) return null;
    const data: any = await response.json();

    if (data.status !== 1 || !data.product) {
      return null;
    }

    const p = data.product;
    const nutriments = p.nutriments || {};
    const energyKcal = nutriments['energy-kcal_100g'] ?? nutriments['energy-kcal'] ?? (nutriments['energy_100g'] ? Math.round(nutriments['energy_100g'] / 4.184) : 0);
    const protein = nutriments['proteins_100g'] ?? nutriments['proteins'] ?? 0;
    const carbs = nutriments['carbohydrates_100g'] ?? nutriments['carbohydrates'] ?? 0;
    const fat = nutriments['fat_100g'] ?? nutriments['fat'] ?? 0;

    return {
      name: p.product_name_es || p.product_name || 'Producto escaneado',
      brand: p.brands ? p.brands.split(',')[0].trim() : undefined,
      caloriesPer100g: Math.round(Number(energyKcal) || 0),
      proteinPer100g: Number((Number(protein) || 0).toFixed(1)),
      carbsPer100g: Number((Number(carbs) || 0).toFixed(1)),
      fatPer100g: Number((Number(fat) || 0).toFixed(1)),
      source: 'Open Food Facts',
      barcode: p.code,
    };
  } catch {
    return null;
  }
}
