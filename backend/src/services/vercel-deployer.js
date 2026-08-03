// ============================================
// Solo IA — Service de déploiement Vercel
// Déploie les applications générées sur Vercel
// ============================================

import { execSync, spawn } from 'child_process';
import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';
import config from '../config/index.js';

/**
 * Vérifie si Vercel CLI est installé
 */
function checkVercelCLI() {
  try {
    execSync('vercel --version', { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

/**
 * Déploie une application sur Vercel via CLI
 */
export async function deployToVercel(appPath, appName, options = {}) {
  console.log(`[Vercel] Déploiement de "${appName}" depuis ${appPath}`);

  if (!existsSync(appPath)) {
    throw new Error(`Le dossier de l'application n'existe pas: ${appPath}`);
  }

  try {
    // Vérifier que Vercel CLI est installé
    const hasCLI = checkVercelCLI();
    if (!hasCLI) {
      console.log('[Vercel] CLI non trouvé, tentative d\'installation...');
      try {
        execSync('npm install -g vercel', { stdio: 'pipe' });
        console.log('[Vercel] ✅ Vercel CLI installé');
      } catch {
        throw new Error(
          'Vercel CLI non installé. Installez-le avec: npm install -g vercel'
        );
      }
    }

    // Construire la commande de déploiement
    const deployArgs = ['--prod', '--confirm'];

    if (config.vercel.token) {
      deployArgs.push('--token', config.vercel.token);
    }
    if (config.vercel.teamId) {
      deployArgs.push('--scope', config.vercel.teamId);
    }

    console.log(`[Vercel] Lancement du déploiement...`);

    return new Promise((resolvePromise, reject) => {
      const deployProcess = spawn('vercel', deployArgs, {
        cwd: appPath,
        stdio: ['pipe', 'pipe', 'pipe'],
        env: {
          ...process.env,
          VERCEL_PROJECT_ID: config.vercel.projectId || undefined,
        },
      });

      let output = '';
      let errorOutput = '';

      deployProcess.stdout.on('data', (data) => {
        const text = data.toString();
        output += text;
        console.log(`[Vercel] ${text.trim()}`);
      });

      deployProcess.stderr.on('data', (data) => {
        const text = data.toString();
        errorOutput += text;
        console.error(`[Vercel] ${text.trim()}`);
      });

      deployProcess.on('close', (code) => {
        if (code === 0) {
          // Extraire l'URL de déploiement
          const urlMatch = output.match(
            /https?:\/\/[^\s]+\.vercel\.app/
          );
          const url = urlMatch ? urlMatch[0] : null;

          console.log(`[Vercel] ✅ Déploiement réussi: ${url || 'URL non trouvée'}`);

          resolvePromise({
            success: true,
            url,
            platform: 'vercel',
            deploymentId: extractDeploymentId(output),
            logs: output,
          });
        } else {
          reject(new Error(
            `Échec du déploiement Vercel (code ${code}): ${errorOutput || output}`
          ));
        }
      });

      deployProcess.on('error', (err) => {
        reject(new Error(`Erreur de démarrage Vercel: ${err.message}`));
      });
    });
  } catch (error) {
    console.error('[Vercel] ❌', error.message);
    throw error;
  }
}

/**
 * Extrait l'ID de déploiement depuis les logs
 */
function extractDeploymentId(logs) {
  const match = logs.match(/Inspect:.*\/deployments\/([a-zA-Z0-9_]+)/);
  return match ? match[1] : null;
}

/**
 * Vérifie le statut d'un déploiement Vercel
 */
export async function checkDeploymentStatus(deploymentId) {
  if (!config.vercel.token) {
    return { status: 'unknown', message: 'Token Vercel non configuré' };
  }

  try {
    const result = execSync(
      `curl -s -H "Authorization: Bearer ${config.vercel.token}" \
        "https://api.vercel.com/v13/deployments/${deploymentId}"`,
      { encoding: 'utf-8' }
    );
    return JSON.parse(result);
  } catch (err) {
    console.error('[Vercel] Erreur statut:', err.message);
    return { status: 'error', message: err.message };
  }
}

/**
 * Crée un projet Vercel si nécessaire
 */
export async function createVercelProject(appName, framework = 'nextjs') {
  if (!config.vercel.token) {
    return { error: 'Token Vercel non configuré' };
  }

  try {
    const frameworks = {
      nextjs: 'nextjs',
      vue: 'vue',
      svelte: 'svelte',
    };

    const result = execSync(
      `curl -s -X POST "https://api.vercel.com/v9/projects" \
        -H "Authorization: Bearer ${config.vercel.token}" \
        -H "Content-Type: application/json" \
        -d '${JSON.stringify({
          name: appName.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
          framework: frameworks[framework] || 'nextjs',
          gitRepository: null,
        })}'`,
      { encoding: 'utf-8' }
    );

    return JSON.parse(result);
  } catch (err) {
    console.error('[Vercel] Erreur création projet:', err.message);
    return { error: err.message };
  }
}