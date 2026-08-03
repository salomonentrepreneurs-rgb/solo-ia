// ============================================
// Solo IA — Serveur API Principal
// Express + OpenAI + SQLite + Vercel Deploy
// ============================================

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { mkdirSync } from 'fs';
import { resolve } from 'path';
import { fileURLToPath } from 'url';

import config from './config/index.js';
import { getDatabase } from './models/database.js';

// Routes
import authRoutes from './routes/auth.js';
import appsRoutes from './routes/apps.js';
import deploymentsRoutes from './routes/deployments.js';
import creditsRoutes from './routes/credits.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = resolve(__filename, '..');

// ============================================
// Initialisation
// ============================================

const app = express();
const PORT = config.port;

// Créer les dossiers nécessaires
mkdirSync(config.paths.data, { recursive: true });
mkdirSync(config.paths.generated, { recursive: true });

// ============================================
// Middleware Globaux
// ============================================

app.use(helmet({
  contentSecurityPolicy: false, // Désactivé pour permettre le déploiement
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

app.use(cors({
  origin: config.isDev ? '*' : [
    'https://solo-ia.app',
    'https://*.solo-ia.app',
    'http://localhost:*',
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

app.use(express.json({
  limit: '10mb', // Pour les prompts longs et les fichiers générés
}));

app.use(morgan(config.isDev ? 'dev' : 'combined'));

// ============================================
// Routes API
// ============================================

// Santé du serveur
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    version: '2.0.0',
    name: 'Solo IA API',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
  });
});

// Routes métier
app.use('/api/auth', authRoutes);
app.use('/api/apps', appsRoutes);
app.use('/api/deployments', deploymentsRoutes);
app.use('/api/credits', creditsRoutes);

// ============================================
// Documentation API
// ============================================

app.get('/api', (req, res) => {
  res.json({
    name: 'Solo IA API',
    version: '2.0.0',
    description: 'API de génération et déploiement d\'applications par IA',
    baseUrl: `http://localhost:${PORT}/api`,
    endpoints: {
      health: { method: 'GET', path: '/api/health' },
      auth: {
        register: { method: 'POST', path: '/api/auth/register', body: { email: 'string', password: 'string', name: 'string' } },
        login: { method: 'POST', path: '/api/auth/login', body: { email: 'string', password: 'string' } },
        me: { method: 'GET', path: '/api/auth/me', auth: true },
      },
      apps: {
        list: { method: 'GET', path: '/api/apps', auth: true },
        get: { method: 'GET', path: '/api/apps/:id', auth: true },
        generate: { method: 'POST', path: '/api/apps/generate', auth: true, body: { prompt: 'string', appName: 'string (optionnel)' } },
        deploy: { method: 'POST', path: '/api/apps/:id/deploy', auth: true },
        delete: { method: 'DELETE', path: '/api/apps/:id', auth: true },
      },
      deployments: {
        list: { method: 'GET', path: '/api/deployments', auth: true },
        get: { method: 'GET', path: '/api/deployments/:id', auth: true },
        logs: { method: 'GET', path: '/api/deployments/:id/logs', auth: true },
      },
      credits: {
        status: { method: 'GET', path: '/api/credits', auth: true },
        history: { method: 'GET', path: '/api/credits/history', auth: true },
      },
    },
    authentication: 'Bearer token dans l\'en-tête Authorization',
  });
});

// ============================================
// Gestion des erreurs
// ============================================

// 404
app.use((req, res) => {
  res.status(404).json({
    error: 'Route non trouvée',
    message: `Aucune route correspondante pour ${req.method} ${req.path}`,
  });
});

// Erreur globale
app.use((err, req, res, next) => {
  console.error('[Serveur] Erreur:', err);
  res.status(err.status || 500).json({
    error: 'Erreur interne du serveur',
    message: config.isDev ? err.message : 'Une erreur est survenue.',
    ...(config.isDev ? { stack: err.stack } : {}),
  });
});

// ============================================
// Démarrage
// ============================================

function startServer() {
  // Initialiser la base de données
  getDatabase();

  app.listen(PORT, () => {
    console.log('');
    console.log('╔══════════════════════════════════════════╗');
    console.log('║           ✦ Solo IA API v2.0            ║');
    console.log('║   Génération d\'apps par IA — français   ║');
    console.log('╠══════════════════════════════════════════╣');
    console.log(`║  🚀 Serveur: http://localhost:${PORT}         ║`);
    console.log(`║  📚 API:    http://localhost:${PORT}/api      ║`);
    console.log(`║  💾 Base:   ${config.database.path}           ║`);
    console.log(`║  🤖 Modèle: ${config.openai.model}            ║`);
    console.log(`║  📋 Crédits: ${config.limits.maxCreditsPerDay}/jour  ║`);
    console.log(`║  🌐 Env:    ${config.env}                     ║`);
    console.log('╚══════════════════════════════════════════╝');
    console.log('');
  });
}

// Démarrer
startServer();

export default app;