# ============================================
# Solo IA — Dockerfile
# Image de production pour l'API backend
# ============================================

FROM node:22-alpine AS base

# Dépendances système
RUN apk add --no-cache python3 make g++ git curl

FROM base AS deps
WORKDIR /app
COPY package.json ./
RUN npm ci --only=production

FROM base AS runner
WORKDIR /app

# Créer un utilisateur non-root
RUN addgroup --system --gid 1001 soloia && \
    adduser --system --uid 1001 soloia

# Copier les dépendances
COPY --from=deps --chown=soloia:soloia /app/node_modules ./node_modules
COPY --chown=soloia:soloia . .

# Créer les dossiers de données
RUN mkdir -p data generated && chown -R soloia:soloia data generated

USER soloia

EXPOSE 3001

ENV NODE_ENV=production
ENV PORT=3001

CMD ["node", "src/index.js"]