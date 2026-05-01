# Fantastic — Guia de Deploy 24/7 sem custo

## TL;DR

| O que | Onde | Custo |
|---|---|---|
| **Frontend Next.js** | Vercel (já deployado) | $0 |
| **Banco PostgreSQL** | Supabase (já configurado) | $0 |
| **Backend NestJS** | Fly.io ou Render (este guia) | $0 |
| **Tunnel temporário (atual)** | Cloudflared local | $0 (mas precisa do PC ligado) |

## Opção A — Fly.io (recomendado, deploy via CLI)

### Passos

1. **Cria conta grátis** em https://fly.io/sign-up (não pede cartão para o free tier básico, mas a verificação de identidade pode pedir; você pode usar email + senha)
2. **Gera token API** em https://fly.io/user/personal_access_tokens → "Create access token" → copia o token (começa com `fo1_...`)
3. **Cole o token aqui no chat** que eu deployo automaticamente.

### O que vai acontecer (eu rodo no seu CLI):

```bash
export FLY_API_TOKEN=<seu token>
fly launch --config backend/fly.toml --copy-config --no-deploy --region gru
fly secrets set DATABASE_URL="..." DIRECT_URL="..." \
  JWT_ACCESS_SECRET="..." JWT_REFRESH_SECRET="..." \
  COOKIE_SECRET="..." WATERMARK_SECRET="..." \
  SUPABASE_URL="..." SUPABASE_SERVICE_KEY="..."
fly deploy --config backend/fly.toml
```

### Características do free tier Fly:
- ✅ 3 máquinas shared-cpu-1x (256MB RAM cada) gratuitas para sempre
- ✅ 160GB de banda/mês
- ✅ HTTPS automático em `fantastic-api.fly.dev`
- ✅ Auto-suspend quando idle (acorda em ~200ms na primeira request)
- ✅ Region São Paulo (`gru`) — baixa latência pro Brasil

## Opção B — Render.com (alternativa, deploy via GitHub)

### Passos

1. **Crie repo GitHub** em https://github.com/new (nome: `fantastic`, público ou privado, não importa)
2. **Push do código** (do seu computador):
   ```bash
   cd C:\Users\User\Fantastic
   git remote add origin https://github.com/SEU_USER/fantastic.git
   git push -u origin main
   ```
3. **Crie conta Render** em https://dashboard.render.com (free, sem cartão)
4. **New** → **Blueprint** → cola URL do seu repo GitHub
5. Render detecta o `render.yaml` em `backend/` e cria o serviço
6. **Adicione os secrets** no painel:
   - `DATABASE_URL` = string de conexão Supabase (a mesma que está no nosso `.env`)
   - `DIRECT_URL` = mesma string
   - `SUPABASE_URL` = `https://jrgzhzvbhkhlnodtquxm.supabase.co`
   - `SUPABASE_SERVICE_KEY` = sua service key (rotacione antes de copiar)
7. Clica **Deploy**. URL final: `https://fantastic-api.onrender.com`

### Características do free tier Render:
- ✅ Sem cartão de crédito necessário
- ⚠️ Sleeps após 15 min sem requisição (cold start ~30s)
- ✅ 750 horas/mês (suficiente)
- ✅ HTTPS automático

## Após deploy: atualizar Vercel

Em qualquer das opções, depois que o backend estiver rodando, atualizo a env var do Vercel:

```bash
NEXT_PUBLIC_API_URL=https://fantastic-api.fly.dev/api/v1   # Fly
# ou
NEXT_PUBLIC_API_URL=https://fantastic-api.onrender.com/api/v1   # Render
```

E atualizo o CORS no backend pra aceitar `https://fantastic-app.vercel.app`.

## Comparação rápida

| Critério | Fly.io | Render |
|---|---|---|
| Cartão obrigatório | Verificação opcional | ❌ Nenhum |
| Region BR | ✅ São Paulo (gru) | ❌ só Oregon/Frankfurt/Singapore |
| Cold start | ~200ms | ~30s |
| Setup | CLI + token | GitHub push + dashboard |
| Limite gratuito | Sempre on (3 VMs) | 750h/mês com sleep |

**Recomendo Fly.io** pela latência pro Brasil. Se preferir simplicidade total via dashboard, vai de Render.

## Próximos passos pra "production-ready DE VERDADE"

(Quando quiser começar a faturar, não só demo pros compradores)

- [ ] Domínio próprio (`fantastic.com.br`) apontando pro Vercel
- [ ] Gateway de pagamento real (CCBill/SegPay com Pix)
- [ ] Cloudflare R2 ou AWS S3 para upload de mídia (não mais base64)
- [ ] Mux para vídeos (HLS + DRM + watermark)
- [ ] SumSub para KYC obrigatório (Lei 15.211/2025)
- [ ] Resend para envio de e-mails transacionais
- [ ] Sentry para monitoramento de erros
- [ ] Painel admin (moderação + financeiro)
- [ ] LGPD: rotação da `service_role` key do Supabase (foi exposta em chat)
