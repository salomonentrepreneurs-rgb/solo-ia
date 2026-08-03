# ✦ Solo IA

**Plateforme de création d'applications par intelligence artificielle**
Clone supérieur de [blink.new](https://blink.new/fr) — en français, plus puissant, moins cher.

## Architecture

```
solo-ia/
├── backend/     → API Express + OpenAI + SQLite (Port 3001)
└── frontend/    → Next.js 15 + TypeScript + Tailwind (Port 3000)
```

## Démarrage rapide

```bash
# Backend
cd backend
cp .env.example .env
npm install
npm start

# Frontend
cd frontend
cp .env.local.example .env.local
npm install
npm run dev
```

## Déploiement

- Backend → `solo-ia-backend` sur Vercel
- Frontend → `solo-ia-frontend` sur Vercel

---

Généré par ✦ Solo IA