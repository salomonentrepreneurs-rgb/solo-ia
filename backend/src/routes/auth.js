// ============================================
// Solo IA — Routes d'authentification
// Inscription, connexion, profil
// ============================================

import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import { getDb } from '../models/database.js';
import { authenticate, generateToken } from '../middleware/auth.js';

const router = Router();

/**
 * POST /api/auth/register
 * Crée un nouveau compte utilisateur
 */
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Validation
    if (!email || !password || !name) {
      return res.status(400).json({
        error: 'Champs requis',
        message: 'Email, mot de passe et nom sont obligatoires.',
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        error: 'Mot de passe trop court',
        message: 'Le mot de passe doit contenir au moins 8 caractères.',
      });
    }

    const db = getDb();

    // Vérifier si l'email existe déjà
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existing) {
      return res.status(409).json({
        error: 'Email déjà utilisé',
        message: 'Un compte avec cet email existe déjà.',
      });
    }

    // Créer l'utilisateur
    const id = randomUUID();
    const passwordHash = await bcrypt.hash(password, 12);

    db.prepare(`
      INSERT INTO users (id, email, name, password_hash, role)
      VALUES (?, ?, ?, ?, 'user')
    `).run(id, email, name, passwordHash);

    const token = generateToken({ id, email, name, role: 'user' });

    console.log(`[Auth] Nouvel utilisateur: ${email}`);

    res.status(201).json({
      token,
      user: { id, email, name, role: 'user' },
      message: 'Compte créé avec succès !',
    });
  } catch (err) {
    console.error('[Auth] Erreur register:', err.message);
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Impossible de créer le compte.',
    });
  }
});

/**
 * POST /api/auth/login
 * Connecte un utilisateur existant
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: 'Champs requis',
        message: 'Email et mot de passe sont obligatoires.',
      });
    }

    const db = getDb();

    // Chercher l'utilisateur
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!user) {
      return res.status(401).json({
        error: 'Identifiants invalides',
        message: 'Email ou mot de passe incorrect.',
      });
    }

    // Vérifier le mot de passe
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({
        error: 'Identifiants invalides',
        message: 'Email ou mot de passe incorrect.',
      });
    }

    // Réinitialiser les crédits quotidiens si nécessaire
    const today = new Date().toISOString().split('T')[0];
    const lastCreditDate = user.credits_updated_at?.split('T')[0];
    if (lastCreditDate !== today) {
      db.prepare(`
        UPDATE users SET credits_used_today = 0, credits_updated_at = datetime('now')
        WHERE id = ?
      `).run(user.id);
    }

    const token = generateToken(user);

    console.log(`[Auth] Connexion: ${email}`);

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        creditsUsedToday: lastCreditDate === today ? user.credits_used_today : 0,
      },
    });
  } catch (err) {
    console.error('[Auth] Erreur login:', err.message);
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Impossible de se connecter.',
    });
  }
});

/**
 * GET /api/auth/me
 * Récupère le profil de l'utilisateur connecté
 */
router.get('/me', authenticate, (req, res) => {
  try {
    const db = getDb();
    const user = db.prepare(`
      SELECT id, email, name, role, credits_used_today, created_at
      FROM users WHERE id = ?
    `).get(req.user.id);

    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    // Compter les apps de l'utilisateur
    const appsCount = db.prepare(
      'SELECT COUNT(*) as count FROM apps WHERE user_id = ?'
    ).get(user.id);

    res.json({
      ...user,
      appsCount: appsCount.count,
    });
  } catch (err) {
    console.error('[Auth] Erreur profil:', err.message);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

export default router;