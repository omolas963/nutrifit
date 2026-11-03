import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { config } from './config';
import { foodRouter } from './routes/food';
import { aiRouter } from './routes/ai';
import { assistantRouter } from './routes/assistant';
import { authRouter } from './routes/auth';
import { userDataRouter } from './routes/userData';
import { stepsRouter } from './routes/steps';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Trust proxy headers (needed on Railway/Render behind load balancer)
app.set('trust proxy', 1);

app.use(express.json({ limit: '30mb' }));
app.use(express.urlencoded({ extended: true, limit: '30mb' }));

// Graceful JSON parse error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (err instanceof SyntaxError && 'body' in err) {
    return res.status(400).json({ error: 'JSON mal formado enviado en la petición.' });
  }
  next();
});

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
app.use('/api/assistant', assistantRouter);
app.use('/api/steps', stepsRouter);

// Direct APK download for mobile users (serves the APK file directly)
app.get(['/api/download/apk', '/nutrifit.apk'], (req, res) => {
  const possibleApkPaths = [
    path.resolve(distPath, 'nutrifit.apk'),
    path.resolve(process.cwd(), 'public', 'nutrifit.apk'),
    path.resolve(__dirname, '..', 'public', 'nutrifit.apk'),
    path.resolve(process.cwd(), 'dist', 'nutrifit.apk'),
  ];
  const foundApk = possibleApkPaths.find(p => fs.existsSync(p));
  if (foundApk) {
    res.setHeader('Content-Type', 'application/vnd.android.package-archive');
    return res.download(foundApk, 'NutriFit.apk');
  }
  res.redirect('https://github.com/omolas963/nutrifit/releases/download/v1.6.0/app-debug.apk');
});

// Direct IPA download for Apple iOS users (serves the real IPA application file directly)
app.get(['/api/download/ipa', '/api/download/apple', '/nutrifit.ipa', '/apple'], (req, res) => {
  const possiblePaths = [
    path.resolve(distPath, 'nutrifit.ipa'),
    path.resolve(process.cwd(), 'public', 'nutrifit.ipa'),
    path.resolve(__dirname, '..', 'public', 'nutrifit.ipa'),
    path.resolve(process.cwd(), 'dist', 'nutrifit.ipa'),
  ];
  const found = possiblePaths.find(p => fs.existsSync(p));
  if (found) {
    res.setHeader('Content-Type', 'application/octet-stream');
    return res.download(found, 'NutriFit.ipa');
  }
  res.redirect('https://github.com/omolas963/nutrifit/releases/download/v1.6.0/NutriFit.ipa');
});

// Direct Apple / iOS configuration profile download (.mobileconfig)
app.get(['/nutrifit.mobileconfig'], (req, res) => {
  const possiblePaths = [
    path.resolve(distPath, 'nutrifit.mobileconfig'),
    path.resolve(process.cwd(), 'public', 'nutrifit.mobileconfig'),
    path.resolve(__dirname, '..', 'public', 'nutrifit.mobileconfig'),
    path.resolve(process.cwd(), 'dist', 'nutrifit.mobileconfig'),
  ];
  const foundConfig = possiblePaths.find(p => fs.existsSync(p));
  if (foundConfig) {
    res.setHeader('Content-Type', 'application/x-apple-aspen-config');
    res.setHeader('Content-Disposition', 'attachment; filename="NutriFit.mobileconfig"');
    return res.sendFile(foundConfig);
  }
  res.status(404).json({ error: 'Perfil de Apple no encontrado.' });
});

// Healthcheck endpoints for Render (/health) and API client (/api/health)
const healthHandler = (req: express.Request, res: express.Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    aiProvider: config.aiProvider,
    hasGeminiKey: Boolean(config.geminiApiKey),
    hasOpenAIKey: Boolean(config.openaiApiKey),
    hasClaudeKey: Boolean(config.anthropicApiKey),
  });
};

// Version endpoint to notify clients of new builds and deployments
const SERVER_BUILD_TIME = '2026-11-03T23:00:00.000Z';
const APP_VERSION = '1.6.0';

app.get('/api/version', (req: express.Request, res: express.Response) => {
  res.json({
    version: APP_VERSION,
    buildTime: SERVER_BUILD_TIME,
    apkUrl: '/nutrifit.apk',
    appleUrl: '/nutrifit.mobileconfig',
    releaseNotes: 'Compatibilidad con Apple (iPhone/iPad), fin de avisos repetitivos y logo original.',
  });
});

app.get('/health', healthHandler);
app.get('/api/health', healthHandler);

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
      if (filePath.endsWith('.html') || filePath.endsWith('.json') || filePath.endsWith('.webmanifest') || filePath.endsWith('sw.js')) {
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
      }
      if (filePath.endsWith('.webmanifest')) {
        res.setHeader('Content-Type', 'application/manifest+json; charset=utf-8');
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

process.on('uncaughtException', (err) => {
  console.error('[NutriFit UncaughtException]', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('[NutriFit UnhandledRejection]', reason);
});

app.listen(config.port, config.host, () => {
  console.log(`[NutriFit] Servidor activo escuchando en http://${config.host}:${config.port}`);
  console.log(`[NutriFit] Proveedor de IA: ${config.aiProvider.toUpperCase()}`);
});
