# Política de Privacidade — Fantastic

**Versão:** 1.0 — Vigente desde 2026-04-30
**Encarregado de Dados (DPO):** dpo@fantastic.com.br

Conforme a **Lei nº 13.709/2018 (LGPD)** e a **Lei nº 15.211/2025**, esta
Política descreve como coletamos, usamos, armazenamos e compartilhamos seus
dados pessoais.

## 1. Dados Coletados

| Categoria | Exemplos | Finalidade |
|---|---|---|
| Cadastro | Nome, e-mail, username, senha (hash) | Autenticação e contato |
| Verificação de idade (KYC) | RG/CPF/Passaporte, selfie, prova de vida | Cumprimento da Lei 15.211/2025 |
| Pagamento | 4 últimos dígitos do cartão, CPF (opcional) | Cobrança e prevenção de fraude |
| Conteúdo | Posts, mensagens, mídias enviadas | Funcionamento da plataforma |
| Uso | IP (hashado), user-agent, páginas visitadas | Segurança e analytics |
| Comportamento publicitário | Cliques em anúncios, categorias visualizadas | Personalização (com consentimento) |

## 2. Bases Legais (LGPD art. 7º)

- **Execução de contrato** (inc. V) — acesso à plataforma e processamento de pagamentos.
- **Cumprimento de obrigação legal** (inc. II) — verificação etária e fiscal.
- **Legítimo interesse** (inc. IX) — segurança, prevenção de fraude.
- **Consentimento** (inc. I) — marketing direto, cookies não essenciais.

## 3. Compartilhamento

Compartilhamos dados estritamente necessários com:
- **SumSub** (KYC), **CCBill/SegPay** (pagamentos), **Mux** (streaming),
  **Cloudflare** (CDN/segurança), **Resend** (e-mails).
- **Autoridades públicas**, mediante ordem judicial.

Nunca vendemos seus dados.

## 4. Transferência Internacional

Alguns parceiros (ex.: SumSub, Mux) processam dados nos EUA/UE. A
transferência é amparada por **cláusulas contratuais padrão** (LGPD art. 33, II).

## 5. Retenção

| Tipo | Prazo |
|---|---|
| Dados de cadastro | Até a anonimização (a pedido do titular) |
| Documentos KYC | 5 anos após verificação (Lei 9.613/98 — antilavagem) |
| Transações financeiras | 5 anos (CTN art. 174 + Lei 15.211/2025) |
| Logs de auditoria | 6 meses |
| Conteúdo publicado | Enquanto a conta estiver ativa |

## 6. Seus Direitos (LGPD art. 18)

Você pode, gratuitamente:
- **Acessar** seus dados — endpoint `/privacy/my-data` na plataforma.
- **Corrigir** dados incorretos — perfil → editar.
- **Anonimizar** seus dados (exclusão) — `/privacy/my-data` (DELETE).
- **Revogar consentimento** a qualquer momento.
- **Portar** seus dados em formato JSON estruturado.

A anonimização é **irreversível** e mantém apenas registros
financeiros (obrigação legal) sob hashes opacos.

## 7. Segurança

Adotamos medidas técnicas e organizacionais incluindo: criptografia em
trânsito (TLS 1.3) e em repouso, hashing de senhas (bcrypt cost 12),
rate-limiting, segregação de ambientes, watermark forense, KYC obrigatório,
treinamento de pessoal e auditoria periódica.

## 8. Cookies

Usamos cookies estritamente necessários (sessão, CSRF) sem consentimento
prévio (LGPD art. 7º, V). Cookies de analytics e marketing exigem opt-in
explícito via banner.

## 9. Menores

A Fantastic é **proibida para menores de 18 anos**. A verificação obrigatória
torna o acesso por menores tecnicamente bloqueado.

## 10. Alterações

Mudanças materiais serão comunicadas com 30 dias de antecedência por e-mail
e banner. Versões anteriores ficam arquivadas em `/legal/history`.

## 11. Contato e ANPD

- DPO: **dpo@fantastic.com.br**
- ANPD (Autoridade Nacional de Proteção de Dados): https://www.gov.br/anpd
