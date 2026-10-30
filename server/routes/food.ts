import { Router, Request, Response } from 'express';
import { searchOpenFoodFacts, getProductByBarcode } from '../services/openFoodFactsService';
import { searchLocalFoodDatabase } from '../services/foodDatabase';

export const foodRouter = Router();

foodRouter.get('/search', async (req: Request, res: Response) => {
  try {
    const q = (req.query.q as string || '').trim();
    if (!q) {
      return res.json({ results: [] });
    }

    // 1. Instant local brand database match (guaranteed instant results, 0ms, works offline)
    const localResults = searchLocalFoodDatabase(q);

    // 2. Query Open Food Facts with graceful fallback
    let offResults: any[] = [];
    try {
      offResults = await searchOpenFoodFacts(q);
    } catch {
      offResults = [];
    }

    // 3. Deduplicate and merge results (local verified brand items first, followed by Open Food Facts)
    const seen = new Set<string>();
    const combined: any[] = [];

    // Add local results first
    for (const item of localResults) {
      const key = `${item.name.toLowerCase()}_${(item.brand || '').toLowerCase()}`;
      if (!seen.has(key)) {
        seen.add(key);
        combined.push(item);
      }
    }

    // Add external results
    for (const item of offResults) {
      const key = `${item.name.toLowerCase()}_${(item.brand || '').toLowerCase()}`;
      if (!seen.has(key)) {
        seen.add(key);
        combined.push(item);
      }
    }

    return res.json({ results: combined });
  } catch (error) {
    console.error('Error in food search route:', error);
    return res.status(500).json({ error: 'Error al buscar alimentos' });
  }
});

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
