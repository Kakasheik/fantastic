# Fantastic Backend — Dockerfile multi-stage, otimizado para Fly.io / Render / Railway
FROM node:22-alpine AS deps
WORKDIR /app
RUN apk add --no-cache libc6-compat openssl python3 make g++
COPY package*.json ./
COPY prisma ./prisma
RUN npm ci --legacy-peer-deps

FROM node:22-alpine AS builder
WORKDIR /app
RUN apk add --no-cache libc6-compat openssl
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate && npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN apk add --no-cache libc6-compat openssl tini
RUN addgroup -g 1001 nodejs && adduser -u 1001 -G nodejs -s /bin/sh -D nestjs

COPY --from=builder --chown=nestjs:nodejs /app/dist          ./dist
COPY --from=builder --chown=nestjs:nodejs /app/node_modules  ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/prisma        ./prisma
COPY --from=builder --chown=nestjs:nodejs /app/package.json  ./package.json

USER nestjs
# Fly.io / Render mapeiam dinamicamente; usamos PORT env var
EXPOSE 8080
ENV PORT=8080

# tini garante PID 1 limpo + sinais propagados (k8s/docker safe)
ENTRYPOINT ["/sbin/tini", "--"]
# Aplica schema (db push) na primeira execução; em prod estável use migrations
CMD ["sh", "-c", "npx prisma db push --skip-generate --accept-data-loss && node dist/main.js"]
