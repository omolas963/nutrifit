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

    // Step 2: For each item, query Open Food Facts & USDA to get real data per 100g
    const verifiedFoods = await Promise.all(
      detectedItems.map(async (item) => {
        const grams = Math.max(1, Math.round(item.estimatedGrams || 100));
        let matched100g = null;

        // Try Open Food Facts first
        const offMatches = await searchOpenFoodFacts(item.name);
        if (offMatches.length > 0) {
          matched100g = offMatches[0];
        } else {
          // Try USDA
          const usdaMatches = await searchUSDA(item.name);
          if (usdaMatches.length > 0) {
            matched100g = usdaMatches[0];
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
