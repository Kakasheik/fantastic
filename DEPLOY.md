# Fantastic — Guia de Deploy (Supabase + Vercel)

## ⚠️ Antes de começar

- **Rotacione a service_role key** que foi exposta no chat. Vá em
  https://supabase.com/dashboard/project/jrgzhzvbhkhlnodtquxm/settings/api
  e clique em **Reset service_role secret**.
- Depois, atualize `backend/.env` com a nova chave.

## Arquitetura de deploy

```
┌─────────────┐      ┌──────────────┐      ┌─────────────┐
│  Vercel     │──────│  Supabase    │      │ Cloudflare  │
│  (Next.js)  │      │  (Postgres)  │      │     R2      │
└─────────────┘      └──────────────┘      └─────────────┘
       │                     ▲                   ▲
       │                     │                   │
       └──── Backend NestJS ─┘                   │
            (Railway/Fly.io/Render)──────────────┘
```

> **Nota:** Vercel **não suporta** apps NestJS de longa duração nativamente
> (sem WebSocket persistente). Para o backend, recomendo:
> - **Railway** (https://railway.app) — `railway up`, suporta Docker
> - **Fly.io** (https://fly.io) — `fly launch`, leve e barato
> - **Render** (https://render.com) — deploy direto do GitHub

Para a apresentação visual, **só o frontend (Next.js) vai ao Vercel**.

## 1. Configurar Supabase

```bash
# 1.1 No painel Supabase, copie a senha do banco:
#     Project Settings → Database → "Database Password" (ou faça reset)

# 1.2 Migre o backend para Postgres
cd backend
bash scripts/use-supabase.sh <SUA_SENHA_DO_DB>
```

O script:
- Salva backup do `.env` SQLite local
- Atualiza `DATABASE_URL` e `DIRECT_URL` para o Supabase pooler
- Troca o provider Prisma para `postgresql`
- Roda `prisma db push` (cria tabelas no Supabase)
- Roda o seed (popula 6 criadoras)

## 2. Subir backend (Railway, exemplo)

```bash
npm install -g @railway/cli
railway login
cd backend
railway init
railway up
# Defina as env vars no painel: DATABASE_URL, JWT_*, etc.
```

A URL pública sai algo como `https://fantastic-backend.up.railway.app`.

## 3. Deploy frontend no Vercel

### Via Chrome (com Claude)

Quando você autorizar, eu abro o Chrome e:
1. Vou para https://vercel.com/new
2. Aguardo você fazer login (não digito senha)
3. Importo o repositório GitHub do Fantastic
4. Configuro as env vars:
   - `NEXT_PUBLIC_API_URL` = URL do seu backend Railway/Fly
5. Clico em Deploy

**Pré-requisito**: o código precisa estar em um repositório GitHub.
Se não estiver, primeiro:

```bash
cd C:\Users\User\Fantastic
git init
git add .
git commit -m "feat: plataforma Fantastic"
gh repo create fantastic --public --source=. --push  # GitHub CLI
```

### Via CLI (mais rápido se você já tem login)

```bash
cd frontend
npm install -g vercel
vercel login
vercel --prod
```

## 4. MCP Supabase no Claude

Já criei `.mcp.json` no projeto. Para autenticar:

```bash
# No terminal regular (NÃO na extensão IDE):
claude /mcp
# Selecione "supabase" → Authenticate
```

Após autenticar, posso usar as ferramentas MCP para listar tabelas,
rodar queries, criar storage buckets, etc.

## 5. Custo estimado

| Serviço     | Plano       | Custo/mês |
|-------------|-------------|-----------|
| Supabase    | Free        | $0        |
| Vercel      | Hobby       | $0        |
| Railway     | Hobby       | $5        |
| Cloudflare R2 | Free 10GB | $0        |
| **Total**   |             | **~$5**   |

## 6. Próximos passos

- [ ] Conectar gateway de pagamento real (CCBill/SegPay) — Pix mock atual
- [ ] Configurar Cloudflare R2 para uploads de mídia
- [ ] Configurar Mux para vídeos (HLS + DRM + watermark)
- [ ] Configurar SumSub (KYC obrigatório Lei 15.211/2025)
- [ ] Custom domain no Vercel
