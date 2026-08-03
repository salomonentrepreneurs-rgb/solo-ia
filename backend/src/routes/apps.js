// ============================================
// Solo IA — Routes de gestion des applications
// CRUD + Génération + Listing
// ============================================

import { Router } from 'express';
import { randomUUID } from 'crypto';
import { getDb } from '../models/database.js';
import { authenticate } from '../middleware/auth.js';
import { generateApp } from '../services/ai-generator.js';
import { buildApp } from '../services/app-builder.js';
import { deployToVercel } from '../services/vercel-deployer.js';
import config from '../config/index.js';

const router = Router();

// Toutes les routes nécessitent une authentification
router.use(authenticate);

/**
 * GET /api/apps
 * Liste les applications de l'utilisateur connecté
 */
router.get('/', (req, res) => {
  try {
    const db = getDb();
    const apps = db.prepare(`
      SELECT id, title, description, prompt, status, framework, language,
             app_type, files_count, lines_count, version, deployed_url,
             created_at, updated_at
      FROM apps
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT 50
    `).all(req.user.id);

    res.json({ apps });
  } catch (err) {
    console.error('[Apps] Erreur liste:', err.message);
    res.status(500).json({ error: 'Erreur lors de la récupération des applications.' });
  }
});

/**
 * GET /api/apps/:id
 * Détail d'une application
 */
router.get('/:id', (req, res) => {
  try {
    const db = getDb();
    const app = db.prepare(`
      SELECT * FROM apps WHERE id = ? AND user_id = ?
    `).get(req.params.id, req.user.id);

    if (!app) {
      return res.status(404).json({ error: 'Application non trouvée.' });
    }

    // Récupérer les déploiements associés
    const deployments = db.prepare(`
      SELECT * FROM deployments WHERE app_id = ? ORDER BY started_at DESC
    `).all(app.id);

    res.json({ app, deployments });
  } catch (err) {
    console.error('[Apps] Erreur détail:', err.message);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

/**
 * POST /api/apps/generate
 * Génère une application à partir d'un prompt
 * C'est le cœur de Solo IA
 */
router.post('/generate', async (req, res) => {
  const { prompt, appName, options = {} } = req.body;

  if (!prompt || prompt.trim().length < 10) {
    return res.status(400).json({
      error: 'Prompt trop court',
      message: 'Veuillez décrire votre application en au moins 10 caractères.',
    });
  }

  // Vérifier les crédits
  const db = getDb();
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);

  const today = new Date().toISOString().split('T')[0];
  const lastCreditDate = user.credits_updated_at?.split('T')[0];

  if (lastCreditDate === today && user.credits_used_today >= config.limits.maxCreditsPerDay) {
    return res.status(429).json({
      error: 'Crédits épuisés',
      message: `Vous avez atteint votre limite de ${config.limits.maxCreditsPerDay} crédits quotidiens. Revenez demain ou passez au plan Pro.`,
    });
  }

  // Vérifier le nombre max d'apps
  const appsCount = db.prepare(
    'SELECT COUNT(*) as count FROM apps WHERE user_id = ?'
  ).get(req.user.id);

  if (appsCount.count >= config.limits.maxAppsPerUser) {
    return res.status(429).json({
      error: 'Limite d\'applications atteinte',
      message: `Vous avez atteint la limite de ${config.limits.maxAppsPerUser} applications. Supprimez-en ou passez au plan Ultimate.`,
    });
  }

  const appId = randomUUID();

  try {
    // Créer l'entrée en base
    db.prepare(`
      INSERT INTO apps (id, user_id, title, prompt, status)
      VALUES (?, ?, ?, ?, 'generating')
    `).run(appId, req.user.id, appName || 'Sans titre', prompt);

    // Incrémenter les crédits
    if (lastCreditDate === today) {
      db.prepare(`
        UPDATE users SET credits_used_today = credits_used_today + 1
        WHERE id = ?
      `).run(req.user.id);
    } else {
      db.prepare(`
        UPDATE users SET credits_used_today = 1, credits_updated_at = datetime('now')
        WHERE id = ?
      `).run(req.user.id);
    }

    // Journal
    db.prepare(`
      INSERT INTO credits_log (id, user_id, amount, action, description)
      VALUES (?, ?, -1, 'generate', ?)
    `).run(randomUUID(), req.user.id, prompt.substring(0, 100));

    // Répondre immédiatement avec l'ID
    res.status(202).json({
      appId,
      status: 'generating',
      message: 'Génération en cours...',
    });

    // Génération asynchrone
    generateAppAsync(appId, prompt, appName, options, req.user.id).catch((err) => {
      console.error(`[Apps] Erreur génération async ${appId}:`, err.message);
      db.prepare(`
        UPDATE apps SET status = 'failed', error_log = ?, updated_at = datetime('now')
        WHERE id = ?
      `).run(err.message, appId);
    });
  } catch (err) {
    console.error('[Apps] Erreur génération:', err.message);
    res.status(500).json({ error: 'Erreur lors de la génération.' });
  }
});

/**
 * Génération asynchrone avec OpenAI
 */
async function generateAppAsync(appId, prompt, appName, options, userId) {
  const db = getDb();

  try {
    // 1. Générer le code avec l'IA
    const generatedData = await generateApp(prompt, {
      appName,
      ...options,
    });

    // 2. Écrire les fichiers sur le disque
    const buildResult = buildApp(appId, {
      ...generatedData,
      prompt,
    });

    // 3. Mettre à jour la base de données
    db.prepare(`
      UPDATE apps
      SET title = ?, status = 'completed',
          framework = ?, language = ?,
          app_type = ?, files_count = ?,
          lines_count = ?, source_path = ?,
          description = ?,
          updated_at = datetime('now')
      WHERE id = ?
    `).run(
      generatedData.appName || appName || 'MonApp',
      generatedData.analysis?.framework || 'nextjs',
      generatedData.analysis?.language || 'typescript',
      generatedData.analysis?.appType || 'web',
      buildResult.filesCount,
      buildResult.linesCount,
      buildResult.path,
      `Généré depuis : "${prompt.substring(0, 200)}"`,
      appId
    );

    console.log(`[Apps] ✅ App ${appId} générée avec succès`);
  } catch (err) {
    console.error(`[Apps] ❌ Erreur génération ${appId}:`, err.message);
    db.prepare(`
      UPDATE apps SET status = 'failed', error_log = ?, updated_at = datetime('now')
      WHERE id = ?
    `).run(err.message, appId);
  }
}

/**
 * POST /api/apps/:id/deploy
 * Déploie une application sur Vercel
 */
router.post('/:id/deploy', async (req, res) => {
  try {
    const db = getDb();
    const app = db.prepare(`
      SELECT * FROM apps WHERE id = ? AND user_id = ?
    `).get(req.params.id, req.user.id);

    if (!app) {
      return res.status(404).json({ error: 'Application non trouvée.' });
    }

    if (app.status !== 'completed') {
      return res.status(400).json({
        error: 'Statut invalide',
        message: 'L\'application doit être complétée avant d\'être déployée.',
      });
    }

    // Mettre à jour le statut
    db.prepare(`
      UPDATE apps SET status = 'deploying', updated_at = datetime('now')
      WHERE id = ?
    `).run(app.id);

    const deploymentId = randomUUID();

    // Créer l'entrée de déploiement
    db.prepare(`
      INSERT INTO deployments (id, app_id, user_id, status)
      VALUES (?, ?, ?, 'building')
    `).run(deploymentId, app.id, req.user.id);

    res.status(202).json({
      deploymentId,
      status: 'deploying',
      message: 'Déploiement en cours...',
    });

    // Lancer le déploiement asynchrone
    try {
      const result = await deployToVercel(app.source_path, app.title, {
        production: true,
      });

      if (result.success) {
        db.prepare(`
          UPDATE apps SET status = 'deployed', deployed_url = ?, updated_at = datetime('now')
          WHERE id = ?
        `).run(result.url, app.id);

        db.prepare(`
          UPDATE deployments SET status = 'ready', url = ?,
            vercel_deployment_id = ?, completed_at = datetime('now')
          WHERE id = ?
        `).run(result.url, result.deploymentId, deploymentId);

        console.log(`[Apps] ✅ App ${app.id} déployée sur ${result.url}`);
      } else {
        throw new Error('Échec du déploiement');
      }
    } catch (deployErr) {
      db.prepare(`
        UPDATE apps SET status = 'completed', updated_at = datetime('now')
        WHERE id = ?
      `).run(app.id);

      db.prepare(`
        UPDATE deployments SET status = 'failed',
          build_logs = ?, completed_at = datetime('now')
        WHERE id = ?
      `).run(deployErr.message, deploymentId);
    }
  } catch (err) {
    console.error('[Apps] Erreur déploiement:', err.message);
    res.status(500).json({ error: 'Erreur lors du déploiement.' });
  }
});

/**
 * DELETE /api/apps/:id
 * Supprime une application
 */
router.delete('/:id', (req, res) => {
  try {
    const db = getDb();
    const result = db.prepare(`
      DELETE FROM apps WHERE id = ? AND user_id = ?
    `).run(req.params.id, req.user.id);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Application non trouvée.' });
    }

    res.json({ message: 'Application supprimée.' });
  } catch (err) {
    console.error('[Apps] Erreur suppression:', err.message);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

export default router;