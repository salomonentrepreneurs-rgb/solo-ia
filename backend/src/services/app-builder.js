// ============================================
// Solo IA — Service de construction d'applications
// Écrit les fichiers générés sur le disque
// ============================================

import { mkdirSync, writeFileSync, existsSync, readFileSync } from 'fs';
import { join, resolve } from 'path';
import { randomUUID } from 'crypto';
import { execSync } from 'child_process';
import config from '../config/index.js';

/**
 * Crée la structure de dossiers pour une application
 */
function createAppStructure(appPath) {
  const dirs = [
    'app/(auth)/login',
    'app/(auth)/register',
    'app/api/auth/[...nextauth]',
    'app/api/stripe',
    'app/api/ai',
    'components',
    'lib',
    'public/images',
    'styles',
  ];
  for (const dir of dirs) {
    mkdirSync(join(appPath, dir), { recursive: true });
  }
}

/**
 * Nettoie une chaîne pour en faire un nom de dossier sûr
 */
function sanitizeName(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 50) || 'app';
}

/**
 * Écrit les fichiers générés sur le disque
 */
export function writeAppFiles(appId, files, appName) {
  const safeName = sanitizeName(appName || 'app');
  const appPath = resolve(config.paths.generated, `${safeName}-${appId}`);

  console.log(`[Builder] Création des fichiers dans: ${appPath}`);

  // Créer la structure de base
  mkdirSync(appPath, { recursive: true });
  createAppStructure(appPath);

  let totalLines = 0;
  const writtenFiles = [];

  for (const file of files) {
    const filePath = join(appPath, file.path);
    const fileDir = filePath.substring(0, filePath.lastIndexOf('/'));

    // Créer les sous-dossiers si nécessaire
    if (!existsSync(fileDir)) {
      mkdirSync(fileDir, { recursive: true });
    }

    writeFileSync(filePath, file.content, 'utf-8');
    const lines = file.content.split('\n').length;
    totalLines += lines;
    writtenFiles.push({
      path: file.path,
      size: Buffer.byteLength(file.content, 'utf-8'),
      lines,
    });
  }

  console.log(`[Builder] ✅ ${writtenFiles.length} fichiers écrits (${totalLines} lignes)`);

  return {
    path: appPath,
    filesCount: writtenFiles.length,
    linesCount: totalLines,
    writtenFiles,
  };
}

/**
 * Crée un fichier README.md pour l'application
 */
export function createReadme(appPath, appName, prompt, analysis) {
  const readme = `# ${appName}

> Généré par ✦ **Solo IA** — Plateforme de création d'applications par intelligence artificielle

## 📋 Description
${prompt}

## 🚀 Démarrage rapide

\`\`\`bash
# Installer les dépendances
npm install

# Lancer en développement
npm run dev

# Construire pour la production
npm run build

# Démarrer le serveur de production
npm start
\`\`\`

## 🏗️ Stack technique
- **Framework**: ${analysis.framework}
- **Langage**: ${analysis.language}
- **Style**: ${analysis.styling}
${analysis.hasAuth ? "- **Auth**: NextAuth.js avec credentials + OAuth" : ""}
${analysis.hasPayments ? "- **Paiements**: Stripe" : ""}
${analysis.hasDatabase ? "- **Base de données**: PostgreSQL / SQLite" : ""}
${analysis.hasDarkMode ? "- **Dark mode**: Support complet" : ""}
${analysis.hasAI ? "- **IA**: OpenAI / Anthropic" : ""}

## 📁 Structure
\`\`\`
├── app/           # Pages et routes Next.js App Router
├── components/    # Composants React réutilisables
├── lib/           # Utilitaires et configurations
├── public/        # Fichiers statiques
└── package.json   # Dépendances
\`\`\`

## 🌐 Déploiement
Déployez sur Vercel en un clic :
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

---

Généré le ${new Date().toLocaleDateString('fr-FR')} • ✦ Solo IA
`;

  writeFileSync(join(appPath, 'README.md'), readme, 'utf-8');
}

/**
 * Crée un fichier .gitignore
 */
export function createGitignore(appPath) {
  const content = `# dependencies
node_modules/
.pnp
.pnp.js

# testing
coverage/

# next.js
.next/
out/

# production
build/

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# local env files
.env*.local
.env

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts
`;
  writeFileSync(join(appPath, '.gitignore'), content, 'utf-8');
}

/**
 * Initialise un dépôt Git pour l'application
 */
export function initGitRepo(appPath) {
  try {
    execSync('git init', { cwd: appPath, stdio: 'pipe' });
    execSync('git add -A', { cwd: appPath, stdio: 'pipe' });
    execSync('git commit -m "Initial commit — généré par Solo IA"', {
      cwd: appPath,
      stdio: 'pipe',
    });
    console.log('[Builder] ✅ Dépôt Git initialisé');
    return true;
  } catch (err) {
    console.warn('[Builder] ⚠️ Git non disponible:', err.message);
    return false;
  }
}

/**
 * Construit l'application complète sur le disque
 */
export function buildApp(appId, generatedData) {
  const { files, appName, analysis } = generatedData;
  const safeName = sanitizeName(appName || 'app');
  const appPath = resolve(config.paths.generated, `${safeName}-${appId}`);

  // Écrire les fichiers
  const writeResult = writeAppFiles(appId, files, appName);

  // Créer les fichiers additionnels
  createReadme(appPath, appName, generatedData.prompt || '', analysis);
  createGitignore(appPath);

  return {
    appId,
    appName,
    appPath,
    ...writeResult,
  };
}

export { sanitizeName };