// ============================================
// Solo IA — Vercel Serverless Entry Point
// Exporte l'app Express pour Vercel
// ============================================

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { mkdirSync } from 'fs';
import { resolve } from 'path';
import { fileURLToPath } from 'url';

import config from '../src/config/index.js';
import { getDatabase } from '../src/models/database.js';
import authRoutes from '../src/routes/auth.js';
import appsRoutes from '../src/routes/apps.js';
import deploymentsRoutes from '../src/routes/deployments.js';
import creditsRoutes from '../src/routes/credits.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = resolve(__filename, '..', '..');

const app = express();

// Créer dossiers nécessaires
try {
  mkdirSync(config.paths.data, { recursive: true });
  mkdirSync(config.paths.generated, { recursive: true });
} catch (e) {
  // Read-only filesystem on Vercel - that's ok
}

// Init DB
try {
  getDatabase();
} catch (e) {
  console.error('[Vercel] DB init error:', e.message);
}

// Middleware
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));
app.use(cors({ origin: '*', methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'], allowedHeaders: ['Content-Type', 'Authorization'] }));
app.use(express.json({ limit: '10mb' }));
app.use(morgan('short'));

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', version: '2.0.0', name: 'Solo IA API', timestamp: new Date().toISOString() });
});

app.get('/api', (req, res) => {
  res.json({
    name: 'Solo IA API',
    version: '2.0.0',
    endpoints: {
      auth: {
        register: { method: 'POST', path: '/api/auth/register' },
        login: { method: 'POST', path: '/api/auth/login' },
        me: { method: 'GET', path: '/api/auth/me' },
      },
      apps: {
        list: { method: 'GET', path: '/api/apps' },
        generate: { method: 'POST', path: '/api/apps/generate' },
        deploy: { method: 'POST', path: '/api/apps/:id/deploy' },
        delete: { method: 'DELETE', path: '/api/apps/:id' },
      },
      deployments: { list: { method: 'GET', path: '/api/deployments' } },
      credits: { status: { method: 'GET', path: '/api/credits' } },
    }
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/apps', appsRoutes);
app.use('/api/deployments', deploymentsRoutes);
app.use('/api/credits', creditsRoutes);

// 404
app.use((req, res) => {
  res.status(404).json({ error: 'Route non trouvée' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('[Vercel] Error:', err.message);
  res.status(err.status || 500).json({ error: 'Erreur interne', message: err.message });
});

export default app;