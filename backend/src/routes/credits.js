// ============================================
// Solo IA — Routes de crédits
// Consultation du quota et historique
// ============================================

import { Router } from 'express';
import { getDb } from '../models/database.js';
import { authenticate } from '../middleware/auth.js';
import config from '../config/index.js';

const router = Router();
router.use(authenticate);

/**
 * GET /api/credits
 * État des crédits de l'utilisateur
 */
router.get('/', (req, res) => {
  try {
    const db = getDb();
    const user = db.prepare(
      'SELECT credits_used_today, credits_updated_at FROM users WHERE id = ?'
    ).get(req.user.id);

    const today = new Date().toISOString().split('T')[0];
    const lastDate = user.credits_updated_at?.split('T')[0];
    const used = lastDate === today ? user.credits_used_today : 0;

    res.json({
      credits: {
        used,
        max: config.limits.maxCreditsPerDay,
        remaining: Math.max(0, config.limits.maxCreditsPerDay - used),
        resetDate: new Date(
          Date.now() + 24 * 60 * 60 * 1000
        ).toISOString().split('T')[0],
      },
    });
  } catch (err) {
    console.error('[Credits] Erreur:', err.message);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

/**
 * GET /api/credits/history
 * Historique des dépenses de crédits
 */
router.get('/history', (req, res) => {
  try {
    const db = getDb();
    const history = db.prepare(`
      SELECT amount, action, description, created_at
      FROM credits_log
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT 50
    `).all(req.user.id);

    res.json({ history });
  } catch (err) {
    console.error('[Credits] Erreur historique:', err.message);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

export default router;