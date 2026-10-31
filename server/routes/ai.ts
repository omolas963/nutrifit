import { Router, Request, Response } from 'express';
import {
  analyzeFoodWithAI,
  generateRecipeWithAI,
  generateMealPlanWithAI,
} from '../services/aiProvider';
import { searchOpenFoodFacts } from '../services/openFoodFactsService';
import { searchUSDA } from '../services/usdaService';

export const aiRouter = Router();

aiRouter.post('/analyze-food', async (req: Request, res: Response) => {
  try {
    const { imageBase64, text } = req.body;

    if (!imageBase64 && (!text || !text.trim())) {
      return res.status(400).json({ error: 'Debes proporcionar una imagen o texto para analizar.' });
    }

    // Step 1: AI extracts items and estimated portions
    const detectedItems = await analyzeFoodWithAI({ imageBase64, text });

    // Step 2: For each item, query local verified DB first, then Open Food Facts & USDA
    const verifiedFoods = await Promise.all(
      detectedItems.map(async (item) => {
        const grams = Math.max(1, Math.round(item.estimatedGrams || 100));
        let matched100g = null;

        // Clean user term to avoid matching potato chips when asking for potatoes
        let searchTerm = item.name;
        const lowerName = item.name.toLowerCase();
        if (lowerName.includes('patata') || lowerName.includes('papa')) {
          if (lowerName.includes('frita') || lowerName.includes('brav')) {
            searchTerm = 'patatas fritas caseras';
          } else if (lowerName.includes('cocida') || lowerName.includes('asada')) {
            searchTerm = 'patata cocida';
          } else {
            searchTerm = 'patata fresca';
          }
        } else if (lowerName.includes('pollo')) {
          if (!lowerName.includes('pechuga')) searchTerm = 'pechuga de pollo';
        } else if (lowerName.includes('arroz')) {
          searchTerm = 'arroz blanco';
        }

        // Try local verified Spanish database first (0ms, curated standard items)
        const { searchLocalFoodDatabase } = await import('../services/foodDatabase');
        const localMatches = searchLocalFoodDatabase(searchTerm);
        if (localMatches.length > 0) {
          // Filter out bag snacks unless explicitly asked
          const best = localMatches.find(m => !m.name.toLowerCase().includes('bolsa') && !m.name.toLowerCase().includes('chips')) || localMatches[0];
          matched100g = best;
        }

        // Try Open Food Facts if no local match
        if (!matched100g) {
          const offMatches = await searchOpenFoodFacts(searchTerm);
          if (offMatches.length > 0) {
            matched100g = offMatches[0];
          } else {
            // Try USDA
            const usdaMatches = await searchUSDA(searchTerm);
            if (usdaMatches.length > 0) {
              matched100g = usdaMatches[0];
            }
          }
        }

        if (matched100g) {
          const factor = grams / 100;
          return {
            id: `food-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            name: matched100g.name || item.name,
            grams,
            calories: Math.round(matched100g.caloriesPer100g * factor),
            protein: Number((matched100g.proteinPer100g * factor).toFixed(1)),
            carbs: Number((matched100g.carbsPer100g * factor).toFixed(1)),
            fat: Number((matched100g.fatPer100g * factor).toFixed(1)),
            source: matched100g.source,
            isEstimated: false,
          };
        }

        // Fallback: AI estimation
        return {
          id: `food-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          name: item.name,
          grams,
          calories: Math.round(item.estimatedCalories || 100),
          protein: Number((item.estimatedProtein || 5).toFixed(1)),
          carbs: Number((item.estimatedCarbs || 10).toFixed(1)),
          fat: Number((item.estimatedFat || 3).toFixed(1)),
          source: 'Estimado por IA',
          isEstimated: true,
        };
      })
    );

    return res.json({ foods: verifiedFoods });
  } catch (error) {
    console.error('Error analyzing food:', error);
    return res.status(500).json({ error: 'Error al procesar el análisis de alimentos con IA' });
  }
});

aiRouter.post('/generate-recipe', async (req: Request, res: Response) => {
  try {
    const { remainingCalories, remainingMacros, ingredientsAvailable, goal } = req.body;

    const recipe = await generateRecipeWithAI({
      remainingCalories: Number(remainingCalories || 500),
      remainingMacros: remainingMacros || { protein: 30, carbs: 50, fat: 15 },
      ingredientsAvailable: ingredientsAvailable || '',
      goal: goal || 'maintain',
    });

    return res.json({ recipe });
  } catch (error) {
    console.error('Error in generate-recipe route:', error);
    return res.status(500).json({ error: 'Error al generar la receta con IA' });
  }
});

aiRouter.post('/generate-meal-plan', async (req: Request, res: Response) => {
  try {
    const { targetCalories, targetMacros, goal } = req.body;

    const plan = await generateMealPlanWithAI({
      targetCalories: Number(targetCalories || 2000),
      targetMacros: targetMacros || { protein: 140, carbs: 220, fat: 60 },
      goal: goal || 'maintain',
    });

    return res.json({ plan });
  } catch (error) {
    console.error('Error in generate-meal-plan route:', error);
    return res.status(500).json({ error: 'Error al generar el plan de comidas' });
  }
});
