# Fantastic Backend — Dockerfile single-stage (mais confiável em hosts free).
# Tradeoff: imagem ~30% maior, mas evita bugs de COPY entre stages.

FROM node:22-alpine
WORKDIR /app

# Build deps (sharp, prisma, bcrypt nativo)
RUN apk add --no-cache libc6-compat openssl python3 make g++ tini

# 1. Dependências
COPY package*.json ./
COPY prisma ./prisma
RUN npm ci --legacy-peer-deps

# 2. Source + build
COPY . .
# Limpa cache incremental tsc (evita "build vazio" entre rebuilds)
RUN rm -f tsconfig.tsbuildinfo && rm -rf dist
RUN npx prisma generate && npm run build

# 3. Verifica que dist/main.js foi gerado (early-fail visível em log)
RUN test -f dist/main.js && echo "✓ dist/main.js OK ($(stat -c%s dist/main.js) bytes)" || (echo "✗ FALHA: dist/main.js não existe" && ls -la dist/ 2>/dev/null && exit 1)

# 4. Runtime
ENV NODE_ENV=production
ENV PORT=8080
EXPOSE 8080

# tini = PID 1 limpo, propaga sinais
ENTRYPOINT ["/sbin/tini", "--"]
CMD ["sh", "-c", "npx prisma db push --skip-generate --accept-data-loss && node dist/main.js"]
