// ============================================
// Solo IA — Base de données SQLite
// Modèles : Users, Apps, Deployments, Credits
// ============================================

import Database from 'better-sqlite3';
import { mkdirSync } from 'fs';
import { dirname } from 'path';
import config from '../config/index.js';

let db;

export function getDatabase() {
  if (db) return db;

  // Créer le dossier data si nécessaire
  mkdirSync(dirname(config.database.path), { recursive: true });

  db = new Database(config.database.path, {
    verbose: config.isDev ? (msg) => {} : undefined,
  });

  // Activer WAL pour les performances
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  // Créer les tables
  db.exec(`
    -- ============================================
    -- Utilisateurs
    -- ============================================
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT DEFAULT 'user' CHECK(role IN ('user', 'admin')),
      credits_used_today INTEGER DEFAULT 0,
      credits_updated_at TEXT DEFAULT (datetime('now')),
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    -- ============================================
    -- Applications générées
    -- ============================================
    CREATE TABLE IF NOT EXISTS apps (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      prompt TEXT NOT NULL,
      status TEXT DEFAULT 'generating'
        CHECK(status IN ('pending','generating','completed','failed','deploying','deployed')),
      framework TEXT DEFAULT 'nextjs',
      language TEXT DEFAULT 'typescript',
      app_type TEXT DEFAULT 'web',
      files_count INTEGER DEFAULT 0,
      lines_count INTEGER DEFAULT 0,
      version INTEGER DEFAULT 1,
      source_path TEXT,
      deployed_url TEXT,
      error_log TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- ============================================
    -- Déploiements
    -- ============================================
    CREATE TABLE IF NOT EXISTS deployments (
      id TEXT PRIMARY KEY,
      app_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      platform TEXT DEFAULT 'vercel',
      status TEXT DEFAULT 'pending'
        CHECK(status IN ('pending','building','deploying','ready','failed')),
      url TEXT,
      vercel_deployment_id TEXT,
      build_logs TEXT,
      started_at TEXT DEFAULT (datetime('now')),
      completed_at TEXT,
      FOREIGN KEY (app_id) REFERENCES apps(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- ============================================
    -- Journal des crédits
    -- ============================================
    CREATE TABLE IF NOT EXISTS credits_log (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      amount INTEGER NOT NULL,
      action TEXT NOT NULL,
      description TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- ============================================
    -- Index
    -- ============================================
    CREATE INDEX IF NOT EXISTS idx_apps_user ON apps(user_id);
    CREATE INDEX IF NOT EXISTS idx_apps_status ON apps(status);
    CREATE INDEX IF NOT EXISTS idx_deployments_app ON deployments(app_id);
    CREATE INDEX IF NOT EXISTS idx_deployments_user ON deployments(user_id);
    CREATE INDEX IF NOT EXISTS idx_credits_user ON credits_log(user_id);
    CREATE INDEX IF NOT EXISTS idx_credits_date ON credits_log(created_at);
  `);

  console.log('[DB] Base de données initialisée:', config.database.path);
  return db;
}

export function closeDatabase() {
  if (db) {
    db.close();
    db = null;
  }
}

// ============================================
// Helpers
// ============================================

export function getDb() {
  return getDatabase();
}