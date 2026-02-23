# ── Fase 1: Build ─────────────────────────────────────────────────────────────
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY svelte.config.js vite.config.ts tsconfig.json ./
COPY src ./src/
COPY static ./static/ 2>/dev/null || true

RUN npm run build

# ── Fase 2: Producción ────────────────────────────────────────────────────────
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/build ./build
COPY --from=builder /app/node_modules ./node_modules
COPY package.json ./

EXPOSE 3001

CMD ["node", "build"]
