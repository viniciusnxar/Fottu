# Fottu

Marketplace de fotos: o comprador acha a sessão, vê prévias com marca d'água, paga via Pix e baixa os originais.

**Stack:** Next.js 14 · Supabase (Auth, Postgres, Storage) · Mercado Pago (Pix).

## Setup

1. **Banco + Storage:** no Supabase, abra *SQL Editor* e rode `supabase/migrations/20261107000000_fottu.sql`
   (cria as tabelas, liga RLS e os buckets `previews` público e `originais` privado).
2. **Login por código:** em *Authentication → Emails → Templates → Magic Link*, troque o corpo por algo como
   `Seu código Fottu: {{ .Token }}` (sem isso o Supabase manda link em vez de código).
3. **SMTP próprio:** em *Authentication → Emails → SMTP Settings*, configure um SMTP (ex.: Resend).
   O SMTP padrão do Supabase só envia poucos e-mails por hora e não serve para produção.
4. **Variáveis:** copie `.env.example` para `.env` e preencha (Supabase → *Project Settings → API Keys*;
   Mercado Pago → *Credenciais de produção*). Seu e-mail de admin vai na tabela `admins` (Table Editor).
5. `bun install && bun dev` → http://localhost:3000

## Fluxos

- **Admin** (`/admin`, só e-mails da tabela `admins`): cria sessão → envia fotos (direto do navegador para o
  Storage, prévia com marca d'água gerada no servidor; o nome do arquivo vira o código) → coloca online.
- **Comprador:** escolhe fotos → login com código por e-mail → Pix (QR + copia e cola) → confirmação automática
  → *Minhas compras* → download do original por URL assinada de 60 s.
- **Pagamento:** confirmado pelo webhook `/api/webhooks/mercadopago` (precisa de `NEXT_PUBLIC_SITE_URL` em https)
  e também pelo polling da tela de checkout, que consulta o Mercado Pago a cada 5 s — funciona em localhost.

## Segurança

Todo acesso a dados é feito no servidor com `SUPABASE_SECRET_KEY`. As tabelas têm RLS ligado sem políticas,
então a chave pública não lê nem grava nada direto. Originais ficam em bucket privado.
