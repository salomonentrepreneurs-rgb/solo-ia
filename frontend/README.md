# ✦ Solo IA — Frontend React/Next.js

Interface utilisateur complète pour la plateforme Solo IA (clone supérieur de blink.new).

## Structure

```
src/
├── app/                          # Pages Next.js App Router
│   ├── layout.tsx                # Layout racine (AuthProvider, Navbar, Footer)
│   ├── page.tsx                  # Landing page
│   ├── globals.css               # Styles globaux Tailwind + animations
│   ├── (auth)/
│   │   ├── login/page.tsx        # Connexion
│   │   └── register/page.tsx     # Inscription
│   ├── dashboard/
│   │   ├── page.tsx              # Dashboard principal (stats, apps récentes)
│   │   ├── apps/
│   │   │   ├── page.tsx          # Liste des apps avec recherche
│   │   │   ├── [id]/page.tsx     # Détail d'une app (statut, déploiement)
│   │   │   └── generate/page.tsx # Générateur d'app
│   │   ├── deployments/page.tsx  # Historique déploiements
│   │   └── credits/page.tsx      # Crédits et historique
│   └── templates/page.tsx        # Templates prédéfinis
├── components/
│   ├── ui/                       # Primitives (Button, Input, Card, Badge)
│   ├── layout/                   # Navbar, Footer
│   ├── apps/                     # AppCard, AppGenerator
│   ├── deploy/                   # DeployStatus
│   ├── credits/                  # CreditsDisplay
│   └── templates/                # TemplateGrid
├── lib/
│   ├── api-client.ts             # Client API (consomme le backend)
│   ├── auth-context.tsx          # Auth context/provider
│   └── utils.ts                  # Utilitaires + 8 templates prédéfinis
└── types/index.ts                # Types TypeScript
```

## Pages

| Route | Page | Description |
|-------|------|-------------|
| `/` | Landing | Page d'accueil avec hero, features, CTA |
| `/login` | Connexion | Formulaire de connexion JWT |
| `/register` | Inscription | Création de compte |
| `/dashboard` | Dashboard | Stats, apps récentes, déploiements |
| `/dashboard/apps` | Mes apps | Liste avec recherche et filtres |
| `/dashboard/apps/generate` | Génération | Générateur avec templates et prompts |
| `/dashboard/apps/:id` | Détail | Statut, infos, déploiement |
| `/dashboard/deployments` | Déploiements | Historique et logs |
| `/dashboard/credits` | Crédits | Quota et historique des crédits |
| `/templates` | Templates | 8 templates prédéfinis par catégorie |

## Démarrage

```bash
npm install
cp .env.local.example .env.local
# Configurez NEXT_PUBLIC_API_URL (backend Solo IA)
npm run dev
```

## Fonctionnalités

- ✅ Authentification complète (register/login/logout/JWT)
- ✅ Dashboard avec stats en temps réel
- ✅ Générateur d'app avec 8 templates prédéfinis
- ✅ Polling du statut de génération
- ✅ Déploiement en un clic
- ✅ Suivi des déploiements avec logs
- ✅ Gestion des crédits avec compteur visuel
- ✅ Design dark mode premium avec animations
- ✅ Responsive (mobile, tablette, desktop)
- ✅ Client API typé avec gestion d'erreurs