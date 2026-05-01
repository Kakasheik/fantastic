#!/bin/bash
# Migra o backend do SQLite local para o Supabase Postgres.
#
# Uso: bash scripts/use-supabase.sh <SUPABASE_DB_PASSWORD>
#
# SECURITY: a senha é passada como argumento para evitar que apareça em ENV global.

set -e

if [ -z "$1" ]; then
  echo "Uso: bash scripts/use-supabase.sh <SUPABASE_DB_PASSWORD>"
  exit 1
fi

PROJECT_REF="jrgzhzvbhkhlnodtquxm"
PASSWORD="$1"

echo "→ Backup .env atual..."
cp .env .env.sqlite.backup 2>/dev/null || true

echo "→ Configurando DATABASE_URL para Supabase..."
sed -i.bak "s|^DATABASE_URL=.*|DATABASE_URL=\"postgresql://postgres.${PROJECT_REF}:${PASSWORD}@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true\"|" .env
echo "DIRECT_URL=\"postgresql://postgres.${PROJECT_REF}:${PASSWORD}@aws-0-us-east-1.pooler.supabase.com:5432/postgres\"" >> .env

echo "→ Trocando provider Prisma para postgresql..."
sed -i.bak 's|provider = "sqlite"|provider = "postgresql"|' prisma/schema.prisma

echo "→ Aplicando schema..."
npx prisma db push --accept-data-loss

echo "→ Rodando seed..."
npx ts-node --transpile-only prisma/seed.ts

echo ""
echo "✅ Pronto. Backend agora aponta para Supabase."
echo "   Para voltar ao SQLite: cp .env.sqlite.backup .env && sed -i 's|postgresql|sqlite|' prisma/schema.prisma"
