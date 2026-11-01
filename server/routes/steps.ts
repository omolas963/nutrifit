import { Router, Request, Response } from 'express';
import { db } from '../db/database';
import rateLimit from 'express-rate-limit';

export const stepsRouter = Router();

// Rate limiter for steps sync: max 60 requests per minute per IP
const stepsLimiter = rateLimit({
  windowMs: 60_000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiadas solicitudes de sincronización de pasos. Intenta de nuevo en un minuto.' },
});

stepsRouter.use(stepsLimiter);

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

// 1. Guardar total de pasos de un día
stepsRouter.post('/', (req: Request, res: Response) => {
  const userId = getUserId(req);
  if (!userId) {
    return res.status(401).json({ error: 'No autenticado para sincronizar pasos con el servidor.' });
  }

  const { date, steps, distanceMeters, calories, source } = req.body;

  // Validation: valid date YYYY-MM-DD
  if (!date || typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return res.status(400).json({ error: 'Formato de fecha inválido. Se espera YYYY-MM-DD.' });
  }

  // Validation: plausible steps (0 to 150,000 steps per day)
  const stepsNum = Number(steps);
  if (isNaN(stepsNum) || stepsNum < 0 || stepsNum > 150000) {
    return res.status(400).json({ error: 'Valor de pasos no plausible (debe estar entre 0 y 150.000).' });
  }

  // Validation: distance meters (0 to 120,000 meters)
  const distNum = distanceMeters !== undefined ? Number(distanceMeters) : 0;
  if (isNaN(distNum) || distNum < 0 || distNum > 120000) {
    return res.status(400).json({ error: 'Valor de distancia no plausible (debe estar entre 0 y 120 km).' });
  }

  // Validation: calories (0 to 8,000 kcal)
  const calsNum = calories !== undefined ? Number(calories) : 0;
  if (isNaN(calsNum) || calsNum < 0 || calsNum > 8000) {
    return res.status(400).json({ error: 'Valor de calorías por pasos no plausible.' });
  }

  const saved = db.saveStepLog(userId, date, {
    steps: stepsNum,
    distanceMeters: distNum,
    calories: calsNum,
    source: typeof source === 'string' ? source.slice(0, 50) : 'manual',
  });

  return res.json({ success: true, entry: saved });
});

// 2. Obtener pasos de un rango o día específico
stepsRouter.get('/', (req: Request, res: Response) => {
  const userId = getUserId(req);
  if (!userId) {
    return res.status(401).json({ error: 'No autenticado.' });
  }

  const { startDate, endDate, date } = req.query;

  if (date && typeof date === 'string') {
    const logs = db.getStepLogs(userId, date, date);
    return res.json({ success: true, logs });
  }

  const start = typeof startDate === 'string' ? startDate : undefined;
  const end = typeof endDate === 'string' ? endDate : undefined;

  const logs = db.getStepLogs(userId, start, end);
  return res.json({ success: true, logs });
});

// 3. Desconectar y borrar todos los pasos del usuario (Derecho al olvido y privacidad estricta)
stepsRouter.delete('/', (req: Request, res: Response) => {
  const userId = getUserId(req);
  if (!userId) {
    return res.status(401).json({ error: 'No autenticado.' });
  }

  db.deleteStepLogs(userId);
  return res.json({ success: true, message: 'Todos los datos de pasos del usuario han sido eliminados de forma permanente.' });
});
