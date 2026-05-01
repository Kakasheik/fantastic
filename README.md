# Fantastic

Plataforma de venda de conteúdo +18 inspirada em Privacy/OnlyFans, com
**três tipos de usuários** (Criadores, Assinantes, Anunciantes), comissão
de 20%, KYC obrigatório (Lei 15.211/2025) e watermark forense.

## Stack

| Camada       | Tecnologia                          |
|--------------|-------------------------------------|
| Frontend     | Next.js 15 (App Router) + Tailwind |
| Backend      | NestJS 10 + TypeScript              |
| ORM/DB       | Prisma + Supabase PostgreSQL        |
| Cache/PubSub | Redis (Upstash ou self-hosted)      |
| Storage      | Cloudflare R2 / AWS S3              |
| Streaming    | Mux (HLS + DRM + Watermark)         |
| Pagamentos   | CCBill / SegPay (Pix)               |
| KYC          | SumSub                              |
| E-mail       | Resend / SendGrid                   |
| Deploy       | Docker Compose + Nginx + Let's Encrypt |

## Estrutura

```
.
├── backend/         # NestJS API
├── frontend/        # Next.js App Router
├── nginx/           # Reverse proxy + TLS
├── docs/
│   ├── 01-architecture.md
│   └── legal/       # ToS, Privacy, Content, Refund policies
├── .github/workflows/deploy.yml
├── docker-compose.yml
└── .env.example
```

## Setup local

```bash
cp .env.example .env
# Preencha as chaves (Supabase, Mux, CCBill, SumSub...)

# Build e sobe tudo
docker compose up -d

# Roda migrations
docker compose exec app-backend npx prisma migrate deploy

# Acesse: http://localhost:3000
```

## Diferenciais competitivos

- **Comissão 20%** (vs 50% do OnlyFans, 20% do Privacy).
- **Anúncios self-serve** com targeting baseado em interesses verificados.
- **Watermark forense individual** em todo conteúdo (Sharp + Mux SSWatermark).
- **Conformidade total** com LGPD + Lei 15.211/2025 (Digital ECA Brasil).
- **Suporte a Pix** via SegPay (mercado BR).

## Licença

Proprietária. © Fantastic Tecnologia Ltda. 2026.
