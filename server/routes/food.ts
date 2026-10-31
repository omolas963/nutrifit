import { Router, Request, Response } from 'express';
import { searchOpenFoodFacts, getProductByBarcode, FoodNutrients100g } from '../services/openFoodFactsService';
import { searchLocalFoodDatabase, registerDynamicFood, filterExternalFoodStrict, BrandedFoodItem } from '../services/foodDatabase';
import { searchUSDA } from '../services/usdaService';
import { estimateFoodWithGemini } from '../services/aiProvider';

export const foodRouter = Router();

// -------------------------------------------------------------
// GET /api/food/search: 3-Layer Search Pipeline
// -------------------------------------------------------------
foodRouter.get('/search', async (req: Request, res: Response) => {
  try {
    const q = (req.query.q as string || '').trim();
    if (!q) {
      return res.json({ results: [] });
    }

    // 1. CAPA 1: Base propia persistente (instantánea 0ms, bilingüe ES/CA, platos y marcas)
    const localResults = searchLocalFoodDatabase(q);

    // If we have high-confidence exact/strong matches from local DB, return them immediately
    // or run Layer 2 in parallel with a short timeout to enrich with external barcodes/brands.
    let offResults: FoodNutrients100g[] = [];
    let usdaResults: FoodNutrients100g[] = [];

    // 2. CAPA 2: Fuentes externas gratuitas en paralelo (Open Food Facts + USDA)
    try {
      const [offRes, usdaRes] = await Promise.allSettled([
        searchOpenFoodFacts(q),
        searchUSDA(q),
      ]);
      if (offRes.status === 'fulfilled' && Array.isArray(offRes.value)) {
        offResults = offRes.value;
      }
      if (usdaRes.status === 'fulfilled' && Array.isArray(usdaRes.value)) {
        usdaResults = usdaRes.value;
      }
    } catch (e) {
      // Silently proceed with local results
    }

    // Deduplicate results
    const seen = new Set<string>();
    const combined: FoodNutrients100g[] = [];

    // Prioritize local curated & Spanish verified foods first
    for (const item of localResults) {
      const key = `${item.name.toLowerCase()}_${(item.brand || '').toLowerCase()}`;
      if (!seen.has(key)) {
        seen.add(key);
        combined.push(item);
      }
    }

    // Then add strictly filtered Open Food Facts packaged goods
    for (const item of offResults) {
      if (!filterExternalFoodStrict(item, q)) continue;
      const key = `${item.name.toLowerCase()}_${(item.brand || '').toLowerCase()}`;
      if (!seen.has(key)) {
        seen.add(key);
        combined.push(item);
      }
    }

    // Then add strictly filtered USDA generic foods
    for (const item of usdaResults) {
      if (!filterExternalFoodStrict(item, q)) continue;
      const key = `${item.name.toLowerCase()}_${(item.brand || '').toLowerCase()}`;
      if (!seen.has(key)) {
        seen.add(key);
        combined.push(item);
      }
    }

    // 3. CAPA 3: Fallback con Gemini si no hay ningún resultado relevante
    if (combined.length === 0 && q.length >= 3) {
      try {
        const estimated = await estimateFoodWithGemini(q);
        if (estimated) {
          combined.push(estimated);
        }
      } catch (e) {
        console.error('Gemini fallback estimation error:', e);
      }
    }

    return res.json({ results: combined });
  } catch (error) {
    console.error('Error in food search route:', error);
    return res.status(500).json({ error: 'Error al buscar alimentos' });
  }
});

// -------------------------------------------------------------
// POST /api/food/estimate: Forced AI estimation on demand
// -------------------------------------------------------------
foodRouter.post('/estimate', async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'El nombre del alimento es requerido.' });
    }

    const item = await estimateFoodWithGemini(name.trim());
    if (!item) {
      return res.status(500).json({ error: 'No se pudo estimar el alimento.' });
    }

    return res.json({ food: item });
  } catch (error) {
    console.error('Error estimating food with AI:', error);
    return res.status(500).json({ error: 'Error interno al estimar el alimento con IA' });
  }
});

// -------------------------------------------------------------
// POST /api/food/custom: Save user custom food
// -------------------------------------------------------------
foodRouter.post('/custom', async (req: Request, res: Response) => {
  try {
    const { name, brand, caloriesPer100g, proteinPer100g, carbsPer100g, fatPer100g, portionName, portionGrams, category } = req.body;
    if (!name || typeof caloriesPer100g !== 'number') {
      return res.status(400).json({ error: 'Datos de alimento inválidos' });
    }

    const newItem: BrandedFoodItem = {
      id: `custom_${Date.now()}`,
      name: name.trim(),
      brand: brand?.trim() || 'Personalizado',
      category: category?.trim() || 'Mis Alimentos',
      caloriesPer100g: Math.round(caloriesPer100g),
      proteinPer100g: Number((Number(proteinPer100g) || 0).toFixed(1)),
      carbsPer100g: Number((Number(carbsPer100g) || 0).toFixed(1)),
      fatPer100g: Number((Number(fatPer100g) || 0).toFixed(1)),
      portionName: portionName?.trim() || '1 ración',
      portionGrams: Math.round(Number(portionGrams) || 100),
      source: 'Base de datos oficial',
      popularSearchTerms: [name.toLowerCase().trim()],
    };

    registerDynamicFood(newItem);
    return res.json({ success: true, food: newItem });
  } catch (error) {
    console.error('Error saving custom food:', error);
    return res.status(500).json({ error: 'Error al guardar alimento personalizado' });
  }
});

// -------------------------------------------------------------
// GET /api/food/barcode/:code: Scan lookup
// -------------------------------------------------------------
foodRouter.get('/barcode/:code', async (req: Request, res: Response) => {
  try {
    const barcode = req.params.code;
    if (!barcode) {
      return res.status(400).json({ error: 'Código de barras no proporcionado' });
    }

    const product = await getProductByBarcode(barcode);
    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado con este código de barras' });
    }

    return res.json({ product });
  } catch (error) {
    console.error('Error in barcode lookup route:', error);
    return res.status(500).json({ error: 'Error al consultar código de barras' });
  }
});
