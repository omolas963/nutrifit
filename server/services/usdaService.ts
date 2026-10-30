import { FoodNutrients100g } from './openFoodFactsService';
import { config } from '../config';

export async function searchUSDA(query: string): Promise<FoodNutrients100g[]> {
  try {
    const encoded = encodeURIComponent(query);
    const apiKey = config.usdaApiKey || 'DEMO_KEY';
    const url = `https://api.nal.usda.gov/fdc/v1/foods/search?query=${encoded}&pageSize=5&api_key=${apiKey}`;

    const response = await fetch(url);
    if (!response.ok) return [];

    const data = await response.json();
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
          name: food.description || query,
          brand: food.brandOwner,
          caloriesPer100g: calories,
          proteinPer100g: protein,
          carbsPer100g: carbs,
          fatPer100g: fat,
          source: 'USDA',
        });
      }
    }

    return results;
  } catch (error) {
    console.error('Error querying USDA:', error);
    return [];
  }
}
