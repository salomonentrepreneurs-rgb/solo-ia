// ============================================
// Solo IA — Middleware d'authentification JWT
// ============================================

import jwt from 'jsonwebtoken';
import config from '../config/index.js';

/**
 * Extrait et vérifie le token JWT depuis les en-têtes
 */
export function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Authentification requise',
      message: 'En-tête Authorization manquant ou invalide. Format: Bearer <token>',
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, config.jwt.secret);
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Token expiré',
        message: 'Votre session a expiré. Veuillez vous reconnecter.',
      });
    }
    return res.status(401).json({
      error: 'Token invalide',
      message: 'Le token d\'authentification est invalide.',
    });
  }
}

/**
 * Vérifie que l'utilisateur a le rôle admin
 */
export function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({
      error: 'Accès refusé',
      message: 'Vous devez être administrateur pour accéder à cette ressource.',
    });
  }
  next();
}

/**
 * Génère un token JWT pour un utilisateur
 */
export function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role || 'user',
    },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn }
  );
}