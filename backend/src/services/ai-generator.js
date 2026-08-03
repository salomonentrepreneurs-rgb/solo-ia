// ============================================
// Solo IA — Service de génération d'apps par IA
// Transforme un prompt en code d'application complet
// ============================================

import OpenAI from 'openai';
import config from '../config/index.js';

let openai = null;

function getOpenAI() {
  if (!openai) {
    if (!config.openai.apiKey || config.openai.apiKey === 'votre-cle-openai-ici') {
      throw new Error(
        'OPENAI_API_KEY non configurée. ' +
        'Copiez .env.example en .env et ajoutez votre clé OpenAI.'
      );
    }
    openai = new OpenAI({ apiKey: config.openai.apiKey });
  }
  return openai;
}

/**
 * Extrait un nom d'application depuis le prompt
 */
function extractAppName(prompt) {
  const patterns = [
    /(?:app(?:lication)?\s+(?:appelée|nommée|app)\s+["']?([\w\s-]+)["']?)/i,
    /["']?([\w\s-]{2,30})["']?\s*(?:app|site|plateforme|saas|dashboard|store)/i,
    /(?:cr[ée][eé]\s+(?:un|une)\s+(\w+))/i,
  ];
  for (const pattern of patterns) {
    const match = prompt.match(pattern);
    if (match) return match[1].trim();
  }
  // Premier mot significatif
  const stopWords = ['crée', 'construis', 'fais', 'un', 'une', 'le', 'la', 'site', 'app', 'application', 'pour', 'avec', 'qui', 'mon', 'je', 'veux'];
  for (const word of prompt.split(/\s+/)) {
    const clean = word.replace(/[^a-zA-ZÀ-ÿ0-9-]/g, '').trim();
    if (clean && !stopWords.includes(clean.toLowerCase()) && clean.length > 2) {
      return clean.charAt(0).toUpperCase() + clean.slice(1);
    }
  }
  return 'MonApp';
}

/**
 * Détermine le type d'application et le framework
 */
function analyzePrompt(prompt) {
  const lower = prompt.toLowerCase();

  const appType =
    lower.includes('e-commerce') || lower.includes('boutique') || lower.includes('shop') ? 'ecommerce' :
    lower.includes('saas') || lower.includes('crm') || lower.includes('dashboard') ? 'saas' :
    lower.includes('blog') || lower.includes('portfolio') || lower.includes('cv') ? 'content' :
    lower.includes('chat') || lower.includes('ai') || lower.includes('ia') || lower.includes('gpt') ? 'ai-app' :
    lower.includes('api') || lower.includes('backend') ? 'api' :
    lower.includes('landing') || lower.includes('page') || lower.includes('site vitrine') ? 'landing' :
    'web-app';

  const framework = lower.includes('vue') ? 'vue' :
    lower.includes('svelte') ? 'svelte' :
    'nextjs';

  const language = lower.includes('javascript') || lower.includes('js') ? 'javascript' : 'typescript';

  const styling = lower.includes('tailwind') ? 'tailwind' :
    lower.includes('bootstrap') ? 'bootstrap' :
    lower.includes('scss') || lower.includes('sass') ? 'scss' :
    'tailwind';

  const hasAuth = lower.includes('auth') || lower.includes('login') || lower.includes('connexion') || lower.includes('inscription') || lower.includes('compte');
  const hasPayments = lower.includes('stripe') || lower.includes('paiement') || lower.includes('paypal') || lower.includes('abonnement');
  const hasDatabase = lower.includes('base de données') || lower.includes('database') || lower.includes('sql') || lower.includes('stockage');
  const hasDarkMode = lower.includes('dark') || lower.includes('sombre') || lower.includes('nuit') || lower.includes('noir');
  const hasAI = lower.includes('ia') || lower.includes('ai') || lower.includes('intelligence artificielle') || lower.includes('openai');

  return { appType, framework, language, styling, hasAuth, hasPayments, hasDatabase, hasDarkMode, hasAI };
}

/**
 * Construit le prompt système pour la génération d'application
 */
function buildSystemPrompt(analysis) {
  const {
    appType, framework, language, styling,
    hasAuth, hasPayments, hasDatabase, hasDarkMode, hasAI
  } = analysis;

  return `Tu es Solo IA, l'assistant de création d'applications le plus avancé au monde.
Tu génères des applications full-stack complètes et prêtes à déployer.

RÈGLES STRICTES :
1. Tu réponds UNIQUEMENT avec du code, sans texte d'explication avant ou après.
2. Format de réponse : un objet JSON valide avec la clé "files".
3. Chaque fichier a : path (chemin relatif) et content (code complet).
4. Tous les fichiers doivent être complets, fonctionnels, prêts à déployer.
5. Le code doit être en ${language}, framework ${framework}, avec ${styling}.
6. L'application est de type : ${appType}.

CONFIGURATION DÉTECTÉE :
${hasAuth ? '- Authentification : inclure login/register avec email + OAuth (Google, GitHub)' : ''}
${hasPayments ? '- Paiements : intégration Stripe Checkout complète' : ''}
${hasDatabase ? '- Base de données : schéma PostgreSQL complet avec migrations' : ''}
${hasDarkMode ? '- Dark mode : support complet avec toggle et persistance' : ''}
${hasAI ? '- IA : intégration OpenAI pour les fonctionnalités intelligentes' : ''}

STRUCTURE OBLIGATOIRE (Next.js App Router) :
- package.json (avec toutes les dépendances)
- next.config.js
- tailwind.config.js
- tsconfig.json (si TypeScript)
- app/layout.tsx (layout racine avec navigation, footer, providers)
- app/page.tsx (page d'accueil)
- app/globals.css (styles globaux Tailwind + variables CSS)
- ${hasAuth ? 'app/(auth)/login/page.tsx\n- app/(auth)/register/page.tsx\n- lib/auth.ts' : ''}
- ${hasPayments ? 'app/api/stripe/checkout/route.ts\n- app/api/stripe/webhook/route.ts\n- lib/stripe.ts' : ''}
- ${hasDatabase ? 'lib/db.ts\n- schema.sql' : ''}
- ${hasAI ? 'app/api/ai/route.ts\n- lib/ai.ts' : ''}
- middleware.ts (protection des routes si auth)
- .env.example

RÈGLE ABSOLUE : Ta réponse doit être UNIQUEMENT un objet JSON valide.
Exemple:
{"files":[{"path":"package.json","content":"{...}"},{"path":"app/page.tsx","content":"..."}]}`;
}

/**
 * Parse la réponse OpenAI en structure de fichiers
 */
function parseGeneratedFiles(response) {
  // Essayer de parser directement le JSON
  try {
    const cleaned = response.replace(/```(?:json)?\n?/g, '').trim();
    const parsed = JSON.parse(cleaned);
    if (parsed.files && Array.isArray(parsed.files)) {
      return {
        files: parsed.files,
        appName: parsed.appName || extractAppName(response),
      };
    }
    if (Array.isArray(parsed)) {
      return { files: parsed, appName: extractAppName(response) };
    }
  } catch (e) {
    // Le JSON n'est pas valide, on essaie d'extraire
  }

  // Fallback : générer une structure minimaliste
  console.warn('[AI] Réponse non-JSON détectée, génération d\'une structure par défaut');
  return null;
}

/**
 * Génère l'application complète depuis un prompt utilisateur
 */
export async function generateApp(prompt, options = {}) {
  const startTime = Date.now();
  const analysis = analyzePrompt(prompt);
  const appName = options.appName || extractAppName(prompt);

  console.log(`[AI] Génération de "${appName}" (${analysis.appType})`);

  const systemPrompt = buildSystemPrompt(analysis);

  try {
    const client = getOpenAI();
    const completion = await client.chat.completions.create({
      model: config.openai.model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Génère-moi une application complète "${appName}".
Description : ${prompt}

Type : ${analysis.appType}
Framework : ${analysis.framework}
Style : ${analysis.styling}
${analysis.hasAuth ? 'Avec authentification complète' : ''}
${analysis.hasPayments ? 'Avec intégration Stripe' : ''}
${analysis.hasDatabase ? 'Avec base de données' : ''}
${analysis.hasDarkMode ? 'Avec dark mode' : ''}
${analysis.hasAI ? 'Avec fonctionnalités IA' : ''}

IMPORTANT : Réponds UNIQUEMENT avec le JSON des fichiers.` },
      ],
      temperature: 0.3,
      max_tokens: 15000,
      response_format: { type: 'json_object' },
    });

    const responseText = completion.choices[0]?.message?.content || '';
    const parsed = parseGeneratedFiles(responseText);
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

    if (parsed) {
      console.log(`[AI] ✅ Généré ${parsed.files.length} fichiers en ${elapsed}s`);
      return {
        files: parsed.files,
        appName,
        analysis,
        metadata: {
          filesCount: parsed.files.length,
          linesCount: parsed.files.reduce((acc, f) => acc + (f.content || '').split('\n').length, 0),
          generationTime: elapsed,
          model: config.openai.model,
        },
      };
    }

    // Fallback : génération de base
    console.warn(`[AI] ⚠️ Fallback déclenché après ${elapsed}s`);
    return generateFallbackApp(prompt, appName, analysis);
  } catch (error) {
    console.error('[AI] ❌ Erreur:', error.message);
    throw new Error(`Échec de la génération: ${error.message}`);
  }
}

/**
 * Structure de base générée localement (fallback si API indisponible)
 */
function generateFallbackApp(prompt, appName, analysis) {
  console.log('[AI] Génération fallback (mode déconnecté)');

  const { hasAuth, hasPayments, hasDarkMode } = analysis;

  const baseFiles = [
    {
      path: 'package.json',
      content: JSON.stringify({
        name: appName.toLowerCase().replace(/\s+/g, '-'),
        version: '1.0.0',
        private: true,
        scripts: {
          dev: 'next dev',
          build: 'next build',
          start: 'next start',
        },
        dependencies: {
          next: '^15.0.0',
          react: '^19.0.0',
          'react-dom': '^19.0.0',
          ...(hasAuth ? { 'next-auth': '^5.0.0', bcryptjs: '^2.4.3' } : {}),
          ...(hasPayments ? { '@stripe/stripe-js': '^5.0.0', stripe: '^17.0.0' } : {}),
        },
        devDependencies: {
          typescript: '^5.7.0',
          '@types/node': '^22.0.0',
          '@types/react': '^19.0.0',
          tailwindcss: '^4.0.0',
          postcss: '^8.4.0',
          autoprefixer: '^10.4.0',
        },
      }, null, 2),
    },
    {
      path: 'next.config.js',
      content: `/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: { remotePatterns: [{ protocol: 'https', hostname: '**' }] },
};
export default nextConfig;`,
    },
    {
      path: 'tailwind.config.js',
      content: `/** @type {import('tailwindcss').Config} */
export default {
  content: ['./app/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  ${hasDarkMode ? 'darkMode: "class",' : ''}
  theme: {
    extend: {
      colors: {
        primary: { 50: '#eef2ff', 100: '#e0e7ff', 200: '#c7d2fe', 300: '#a5b4fc',
                   400: '#818cf8', 500: '#6366f1', 600: '#4f46e5', 700: '#4338ca',
                   800: '#3730a3', 900: '#312e81', 950: '#1e1b4b' },
      },
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] },
    },
  },
  plugins: [],
};`,
    },
    {
      path: 'app/globals.css',
      content: `@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --background: #ffffff;
  --foreground: #0a0a0f;
  --primary: #6366f1;
  --primary-dark: #4f46e5;
  --muted: #6a6a80;
  --border: #e5e5f0;
  --card: #f8f8ff;
}

${hasDarkMode ? `
.dark {
  --background: #0a0a0f;
  --foreground: #f0f0f5;
  --muted: #a0a0b8;
  --border: #2a2a3e;
  --card: #1a1a25;
}
` : ''}

body {
  background: var(--background);
  color: var(--foreground);
  font-family: 'Inter', system-ui, sans-serif;
  transition: background 0.3s, color 0.3s;
}

@layer utilities {
  .gradient-text {
    background: linear-gradient(135deg, #6366f1, #06b6d4);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
}`,
    },
    {
      path: 'app/layout.tsx',
      content: `import type { Metadata } from 'next';
import './globals.css';
${hasAuth ? "import { AuthProvider } from '@/lib/auth';" : ''}

export const metadata: Metadata = {
  title: '${appName} — Créé avec Solo IA',
  description: 'Application générée par intelligence artificielle',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" ${hasDarkMode ? 'suppressHydrationWarning' : ''}>
      <body className="min-h-screen">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          ${hasAuth ? '<AuthProvider>' : ''}{children}${hasAuth ? '</AuthProvider>' : ''}
        </main>
        <Footer />
      </body>
    </html>
  );
}

function Navbar() {
  return (
    <nav className="border-b border-[var(--border)] bg-[var(--background)]/80 backdrop-blur-md fixed top-0 w-full z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <a href="/" className="flex items-center gap-2 font-bold text-xl">
          <span className="text-[var(--primary)]">✦</span>
          <span>${appName}</span>
        </a>
        <div className="flex items-center gap-6">
          <a href="/" className="text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition">Accueil</a>
          ${hasAuth ? `
          <a href="/login" className="text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition">Connexion</a>
          ` : ''}
        </div>
      </div>
    </nav>
  );
}

function Footer() {
  return (
    <footer className="border-t border-[var(--border)] py-8 mt-16">
      <div className="container mx-auto px-4 text-center text-sm text-[var(--muted)]">
        <p>© ${new Date().getFullYear()} ${appName}. Généré avec ✦ Solo IA</p>
      </div>
    </footer>
  );
}`,
    },
    {
      path: 'app/page.tsx',
      content: `'use client';
import { useState } from 'react';

export default function Home() {
  const [count, setCount] = useState(0);

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center">
      <div className="mb-8">
        <div className="text-6xl mb-4">✦</div>
        <h1 className="text-5xl font-bold mb-4">
          Bienvenue sur <span className="gradient-text">${appName}</span>
        </h1>
        <p className="text-lg text-[var(--muted)] max-w-xl mx-auto">
          Application générée par Solo IA — votre assistant de création d'applications
          intelligent, rapide et puissant.
        </p>
      </div>

      <div className="flex gap-4 mb-12">
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6 w-48">
          <div className="text-3xl font-bold text-[var(--primary)]">100%</div>
          <div className="text-sm text-[var(--muted)] mt-1">Sans code</div>
        </div>
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6 w-48">
          <div className="text-3xl font-bold text-[var(--primary)]">&lt;5min</div>
          <div className="text-sm text-[var(--muted)] mt-1">Temps de création</div>
        </div>
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6 w-48">
          <div className="text-3xl font-bold text-[var(--primary)]" onClick={() => setCount(c => c + 1)}>{count}</div>
          <div className="text-sm text-[var(--muted)] mt-1">Clics (interactif)</div>
        </div>
      </div>

      <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-8 max-w-lg w-full">
        <h2 className="text-xl font-semibold mb-4">Prompt original</h2>
        <div className="bg-[var(--background)] border border-[var(--border)] rounded-lg p-4 text-sm text-[var(--muted)] italic">
          {prompt}
        </div>
      </div>
    </div>
  );
}

const prompt = ${JSON.stringify(prompt)};`,
    },
    {
      path: '.env.example',
      content: `# Configuration ${appName}
NEXT_PUBLIC_APP_NAME=${appName}
${hasAuth ? '\n# Auth (optionnel)\nNEXTAUTH_URL=http://localhost:3000\nNEXTAUTH_SECRET=votre-secret\n' : ''}
${hasPayments ? '\n# Stripe\nNEXT_PUBLIC_STRIPE_KEY=pk_test_...\nSTRIPE_SECRET_KEY=sk_test_...\n' : ''}
${analysis.hasAI ? '\n# OpenAI\nOPENAI_API_KEY=sk-...\n' : ''}`,
    },
  ];

  if (hasAuth) {
    baseFiles.push({
      path: 'lib/auth.ts',
      content: `import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import Github from 'next-auth/providers/github';

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Mot de passe', type: 'password' },
      },
      async authorize(credentials) {
        // Implémentez votre logique de validation ici
        return null;
      },
    }),
    Google, Github,
  ],
  pages: { signIn: '/login' },
  session: { strategy: 'jwt' },
  callbacks: {
    async session({ session, token }) {
      session.user.id = token.sub;
      return session;
    },
  },
});`,
    });
    baseFiles.push({
      path: 'app/api/auth/[...nextauth]/route.ts',
      content: `import { handlers } from '@/lib/auth';
export const { GET, POST } = handlers;`,
    });
  }

  if (hasPayments) {
    baseFiles.push({
      path: 'lib/stripe.ts',
      content: `import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia',
  typescript: true,
});

export async function createCheckoutSession(priceId: string, userId: string) {
  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    client_reference_id: userId,
    success_url: \`\${process.env.NEXT_PUBLIC_URL}/success?session_id={CHECKOUT_SESSION_ID}\`,
    cancel_url: \`\${process.env.NEXT_PUBLIC_URL}/pricing\`,
  });
  return session;
}`,
    });
  }

  return {
    files: baseFiles,
    appName,
    analysis,
    metadata: {
      filesCount: baseFiles.length,
      linesCount: baseFiles.reduce((acc, f) => acc + f.content.split('\n').length, 0),
      generationTime: '0.5',
      model: 'fallback',
    },
  };
}

export { extractAppName, analyzePrompt };