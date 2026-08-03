// ============================================
// Solo IA — Configuration centralisée
// ============================================

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Charger .env depuis la racine
dotenv.config({ path: resolve(__dirname, '../../.env') });

const config = {
  // Serveur
  port: parseInt(process.env.PORT, 10) || 3001,
  env: process.env.NODE_ENV || 'development',
  isDev: (process.env.NODE_ENV || 'development') === 'development',

  // OpenAI
  openai: {
    apiKey: process.env.OPENAI_API_KEY || '',
    model: process.env.OPENAI_MODEL || 'gpt-4o',
  },

  // Base de données
  database: {
    path: process.env.DATABASE_PATH || './data/solo-ia.db',
  },

  // JWT
  jwt: {
    secret: process.env.JWT_SECRET || 'dev-secret-change-me',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },

  // Vercel
  vercel: {
    token: process.env.VERCEL_TOKEN || '',
    teamId: process.env.VERCEL_TEAM_ID || '',
    projectId: process.env.VERCEL_PROJECT_ID || '',
  },

  // Limites
  limits: {
    maxCreditsPerDay: parseInt(process.env.MAX_CREDITS_PER_DAY, 10) || 10,
    maxAppsPerUser: parseInt(process.env.MAX_APPS_PER_USER, 10) || 50,
    appTimeoutMs: parseInt(process.env.APP_TIMEOUT_MS, 10) || 120000,
  },

  // Chemins
  paths: {
    templates: resolve(__dirname, '../../templates'),
    generated: resolve(__dirname, '../../generated'),
    data: resolve(__dirname, '../../data'),
  },
};

export default config;