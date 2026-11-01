import { Router, Request, Response } from 'express';
import {
  generateRecipeWithAI,
  generateMealPlanWithAI,
  transcribeAudioWithAI,
} from '../services/aiProvider';
import { runTwoPassFoodVision } from '../services/aiVisionEngine';

export const aiRouter = Router();

// -------------------------------------------------------------
// POST /api/ai/transcribe-audio
// Transcribe spoken food description audio via Gemini Multimodal
// -------------------------------------------------------------
aiRouter.post('/transcribe-audio', async (req: Request, res: Response) => {
  try {
    const { audioBase64, mimeType } = req.body;
    if (!audioBase64) {
      return res.status(400).json({ error: 'Falta el audio en base64' });
    }

    const transcript = await transcribeAudioWithAI({ audioBase64, mimeType });
    return res.json({ success: true, transcript });
  } catch (error: any) {
    console.error('Error transcribing audio with AI:', error);
    return res.status(500).json({ error: 'Error al transcribir audio con IA' });
  }
});

// -------------------------------------------------------------
// POST /api/ai/analyze-food
// Two-pass Vision Engine + Hallucination purge + Real Food DB Nutrients
// -------------------------------------------------------------
aiRouter.post('/analyze-food', async (req: Request, res: Response) => {
  try {
    const { imageBase64, text } = req.body;

    if (!imageBase64 && (!text || !text.trim())) {
      return res.status(400).json({
        isFood: false,
        error: 'Debes proporcionar una imagen o texto para analizar.',
      });
    }

    const visionResult = await runTwoPassFoodVision({ imageBase64, text });

    return res.json({
      success: true,
      isFood: visionResult.isFood,
      imageQuality: visionResult.imageQuality,
      rejectionReason: visionResult.rejectionReason,
      isNutritionLabelOrReceipt: visionResult.isNutritionLabelOrReceipt,
      ocrData: visionResult.ocrData,
      barcode: visionResult.barcode,
      confirmedItems: visionResult.confirmedItems,
      doubtfulItems: visionResult.doubtfulItems,
      totalCalories: visionResult.totalCalories,
      totalProtein: visionResult.totalProtein,
      totalCarbs: visionResult.totalCarbs,
      totalFat: visionResult.totalFat,
      // Backwards-compatible `foods` field
      foods: visionResult.confirmedItems.map(item => ({
        id: item.id,
        name: item.name,
        nameCa: item.nameCa,
        grams: item.grams,
        calories: item.calories,
        protein: item.protein,
        carbs: item.carbs,
        fat: item.fat,
        source: item.source,
        isEstimated: item.isEstimated,
        confidence: item.confidence,
        confidenceBadge: item.confidenceBadge,
        confidencePercent: item.confidencePercent,
        visualReasoning: item.visualReasoning,
        portionName: item.portionName,
        portionGrams: item.portionGrams,
        caloriesPer100g: item.caloriesPer100g,
        proteinPer100g: item.proteinPer100g,
        carbsPer100g: item.carbsPer100g,
        fatPer100g: item.fatPer100g,
      })),
    });
  } catch (error) {
    console.error('Error analyzing food with two-pass vision:', error);
    return res.status(500).json({
      error: 'Error al procesar el análisis de alimentos con IA',
      isFood: false,
      confirmedItems: [],
      doubtfulItems: [],
    });
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
