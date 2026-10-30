import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { config } from './config';
import { foodRouter } from './routes/food';
import { aiRouter } from './routes/ai';
import { authRouter } from './routes/auth';
import { userDataRouter } from './routes/userData';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Trust proxy headers (needed on Railway/Render behind load balancer)
app.set('trust proxy', 1);

app.use(express.json({ limit: '30mb' }));
app.use(express.urlencoded({ extended: true, limit: '30mb' }));

// CORS – allow same-origin in production or any origin in dev
const allowedOrigin = process.env.CORS_ORIGIN || '*';
app.use(cors({
  origin: allowedOrigin,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: allowedOrigin !== '*',
}));

// Global rate limiter – max 120 req/min per IP
const limiter = rateLimit({
  windowMs: 60_000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiadas peticiones, intenta de nuevo en un minuto.' },
});
app.use('/api/', limiter);

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/user', userDataRouter);
app.use('/api/food', foodRouter);
app.use('/api/ai', aiRouter);

// Healthcheck
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    aiProvider: config.aiProvider,
    hasGeminiKey: Boolean(config.geminiApiKey),
    hasOpenAIKey: Boolean(config.openaiApiKey),
    hasClaudeKey: Boolean(config.anthropicApiKey),
  });
});

// Serve frontend static build if dist or index.html exists
const possiblePaths = [
  path.resolve(process.cwd(), 'dist'),
  path.resolve(__dirname, '..', 'dist'),
  path.resolve(__dirname, 'dist'),
  path.resolve(__dirname),
];
const distPath = possiblePaths.find(p => fs.existsSync(path.join(p, 'index.html'))) || path.resolve(process.cwd(), 'dist');

if (fs.existsSync(distPath) && fs.existsSync(path.join(distPath, 'index.html'))) {
  app.use(express.static(distPath, {
    setHeaders: (res, filePath) => {
      if (filePath.endsWith('.html')) {
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
      }
    }
  }));

  // SPA fallback for client-side routing
  app.get('*', (req, res) => {
    // If requesting a static file with an extension or an API route, return 404 instead of serving HTML
    if (req.path.startsWith('/api') || req.path.startsWith('/assets') || req.path.includes('.')) {
      return res.status(404).json({ error: 'Recurso no encontrado' });
    }
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.sendFile(path.join(distPath, 'index.html'));
  });
} else {
  console.warn('[NutriFit] Advertencia: No se encontró index.html en', distPath);
}

app.listen(config.port, '0.0.0.0', () => {
  console.log(`[NutriFit] Servidor activo en http://127.0.0.1:${config.port}`);
  console.log(`[NutriFit] Proveedor de IA: ${config.aiProvider.toUpperCase()}`);
});
