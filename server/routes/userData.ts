import { Router, Request, Response } from 'express';
import { db } from '../db/database';

export const userDataRouter = Router();

// Middleware helper to get userId
function getUserId(req: Request): string | null {
  const userId = req.headers['x-user-id'] as string;
  if (userId) return userId;
  const auth = req.headers.authorization;
  if (auth && auth.startsWith('Bearer token_')) {
    const parts = auth.split('_');
    if (parts.length >= 2) return parts[1];
  }
  return null;
}

// 1. Obtener todos los datos del usuario
userDataRouter.get('/all', (req: Request, res: Response) => {
  const userId = getUserId(req);
  if (!userId) {
    return res.status(401).json({ error: 'No autenticado' });
  }

  const data = db.getUserData(userId);
  return res.json(data);
});

// 2. Guardar perfil y evaluación
userDataRouter.post('/profile', (req: Request, res: Response) => {
  const userId = getUserId(req);
  if (!userId) {
    return res.status(401).json({ error: 'No autenticado' });
  }

  const profile = req.body;
  const saved = db.saveProfile(userId, profile);
  return res.json({ success: true, profile: saved });
});

// 3. Añadir o actualizar comida
userDataRouter.post('/food', (req: Request, res: Response) => {
  const userId = getUserId(req);
  if (!userId) {
    return res.status(401).json({ error: 'No autenticado' });
  }

  const entry = req.body;
  if (!entry.id) {
    entry.id = `food_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  }
  const saved = db.saveFoodEntry(userId, entry);
  return res.json({ success: true, entry: saved });
});

// 4. Eliminar comida
userDataRouter.delete('/food/:id', (req: Request, res: Response) => {
  const userId = getUserId(req);
  if (!userId) {
    return res.status(401).json({ error: 'No autenticado' });
  }

  const { id } = req.params;
  const ok = db.deleteFoodEntry(userId, id);
  return res.json({ success: ok });
});

// 5. Guardar agua
userDataRouter.post('/water', (req: Request, res: Response) => {
  const userId = getUserId(req);
  if (!userId) {
    return res.status(401).json({ error: 'No autenticado' });
  }

  const { date, amountMl } = req.body;
  db.saveWater(userId, date, amountMl);
  return res.json({ success: true, date, amountMl });
});

// 6. Guardar peso
userDataRouter.post('/weight', (req: Request, res: Response) => {
  const userId = getUserId(req);
  if (!userId) {
    return res.status(401).json({ error: 'No autenticado' });
  }

  const log = req.body;
  if (!log.id) {
    log.id = `wt_${Date.now()}`;
  }
  const saved = db.saveWeightLog(userId, log);
  return res.json({ success: true, log: saved });
});

// 7. Guardar receta
userDataRouter.post('/recipe', (req: Request, res: Response) => {
  const userId = getUserId(req);
  if (!userId) {
    return res.status(401).json({ error: 'No autenticado' });
  }

  const recipe = req.body;
  if (!recipe.id) {
    recipe.id = `rec_${Date.now()}`;
  }
  const saved = db.saveRecipe(userId, recipe);
  return res.json({ success: true, recipe: saved });
});

// 8. Eliminar receta
userDataRouter.delete('/recipe/:id', (req: Request, res: Response) => {
  const userId = getUserId(req);
  if (!userId) {
    return res.status(401).json({ error: 'No autenticado' });
  }

  const { id } = req.params;
  const ok = db.deleteRecipe(userId, id);
  return res.json({ success: ok });
});
