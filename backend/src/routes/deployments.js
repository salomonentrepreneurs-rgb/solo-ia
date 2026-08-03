// ============================================
// Solo IA — Routes de déploiement
// Statut, historique, logs
// ============================================

import { Router } from 'express';
import { getDb } from '../models/database.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();
router.use(authenticate);

/**
 * GET /api/deployments
 * Historique des déploiements de l'utilisateur
 */
router.get('/', (req, res) => {
  try {
    const db = getDb();
    const deployments = db.prepare(`
      SELECT d.*, a.title as app_name, a.app_type
      FROM deployments d
      JOIN apps a ON d.app_id = a.id
      WHERE d.user_id = ?
      ORDER BY d.started_at DESC
      LIMIT 20
    `).all(req.user.id);

    res.json({ deployments });
  } catch (err) {
    console.error('[Deploy] Erreur liste:', err.message);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

/**
 * GET /api/deployments/:id
 * Détail d'un déploiement
 */
router.get('/:id', (req, res) => {
  try {
    const db = getDb();
    const deployment = db.prepare(`
      SELECT d.*, a.title as app_name, a.prompt
      FROM deployments d
      JOIN apps a ON d.app_id = a.id
      WHERE d.id = ? AND d.user_id = ?
    `).get(req.params.id, req.user.id);

    if (!deployment) {
      return res.status(404).json({ error: 'Déploiement non trouvé.' });
    }

    res.json({ deployment });
  } catch (err) {
    console.error('[Deploy] Erreur détail:', err.message);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

/**
 * GET /api/deployments/:id/logs
 * Logs de build d'un déploiement
 */
router.get('/:id/logs', (req, res) => {
  try {
    const db = getDb();
    const deployment = db.prepare(`
      SELECT build_logs FROM deployments WHERE id = ? AND user_id = ?
    `).get(req.params.id, req.user.id);

    if (!deployment) {
      return res.status(404).json({ error: 'Déploiement non trouvé.' });
    }

    res.json({
      logs: deployment.build_logs || 'Aucun log disponible.',
    });
  } catch (err) {
    console.error('[Deploy] Erreur logs:', err.message);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

export default router;