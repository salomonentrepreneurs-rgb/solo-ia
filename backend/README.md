# ✦ Solo IA — API Backend

API de génération d'applications full-stack par IA, avec stockage et déploiement automatique sur Vercel.

## Architecture

```
solo-ia-backend/
├── src/
│   ├── index.js              # Point d'entrée Express
│   ├── client.js             # Client API pour le frontend
│   ├── config/
│   │   └── index.js          # Configuration (env vars)
│   ├── models/
│   │   └── database.js       # SQLite (users, apps, deployments, credits)
│   ├── services/
│   │   ├── ai-generator.js   # OpenAI → code d'application complet
│   │   ├── app-builder.js    # Écriture des fichiers sur disque
│   │   └── vercel-deployer.js# Déploiement Vercel
│   ├── routes/
│   │   ├── auth.js           # Register / Login / Profil
│   │   ├── apps.js           # CRUD + Génération + Déploiement
│   │   ├── deployments.js    # Historique des déploiements
│   │   └── credits.js        # Gestion des crédits
│   └── middleware/
│       └── auth.js           # JWT Authentication
├── templates/                # Templates de base
├── generated/                # Apps générées sur disque
├── Dockerfile
├── package.json
└── .env.example
```

## Démarrage rapide

```bash
# 1. Installer les dépendances
npm install

# 2. Configurer les variables d'environnement
cp .env.example .env
# Éditez .env avec votre clé OpenAI

# 3. Lancer le serveur
npm run dev
```

## API Endpoints

### Auth
| Méthode | Route | Description |
|---------|-------|-------------|
| POST | `/api/auth/register` | Créer un compte |
| POST | `/api/auth/login` | Se connecter |
| GET | `/api/auth/me` | Profil (auth requis) |

### Apps
| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/api/apps` | Lister mes apps |
| GET | `/api/apps/:id` | Détail d'une app |
| POST | `/api/apps/generate` | **Générer une app** (cœur du système) |
| POST | `/api/apps/:id/deploy` | Déployer sur Vercel |
| DELETE | `/api/apps/:id` | Supprimer une app |

### Déploiements & Crédits
| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/api/deployments` | Historique des déploiements |
| GET | `/api/credits` | Crédits restants |

## Fonctionnement

1. **Prompt → Analyse** : L'IA analyse le prompt (français/anglais) et détecte le type d'app, le framework, les besoins (auth, paiements, base de données, dark mode, IA...)
2. **Génération** : OpenAI génère une structure complète Next.js avec tous les fichiers
3. **Build local** : Les fichiers sont écrits sur disque avec README, .gitignore, Docker
4. **Déploiement** : [Optionnel] Déploiement automatique sur Vercel via CLI ou API

## Stack technique

- **Runtime** : Node.js 22+ (ES Modules)
- **Framework** : Express 4
- **Base de données** : SQLite (better-sqlite3)
- **IA** : OpenAI SDK (GPT-4o, Claude, etc.)
- **Auth** : JWT (jsonwebtoken + bcryptjs)
- **Déploiement** : Vercel CLI/API
- **Validation** : Zod (schémas de validation)
- **Conteneurisation** : Docker (multi-stage, alpine)