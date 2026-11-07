# Fottu

Marketplace de fotos: o comprador acha a sessão, vê prévias com marca d'água, paga via Pix e baixa os originais.

**Stack:** Next.js 14 · Supabase (Auth, Postgres, Storage) · Mercado Pago (Pix).

## Setup

1. **Banco + Storage:** `npx supabase link --project-ref SEU_PROJETO` e `npx supabase db push`
   (aplica `supabase/migrations/`: tabelas, RLS, buckets `previews` público e `originais` privado, `admins` e `perfis`).
2. **Login por senha:** em *Authentication → URL Configuration*, coloque a URL do site em *Site URL* e adicione
   `https://SEU-SITE/auth/callback` e `http://localhost:3000/auth/callback` em *Redirect URLs*
   (é para onde apontam os links de confirmação e de redefinição de senha).
   Opcional: desligue *Authentication → Sign In / Providers → Email → Confirm email*, já que toda conta passa por aprovação manual.
3. **SMTP próprio:** em *Authentication → Emails → SMTP Settings*, configure um SMTP (ex.: Resend).
   O SMTP padrão do Supabase só envia poucos e-mails por hora e não serve para produção.
4. **Variáveis:** copie `.env.example` para `.env` e preencha (Supabase → *Project Settings → API Keys*;
   Mercado Pago → *Credenciais de produção*). Seu e-mail de admin vai na tabela `admins` (Table Editor).
5. `bun install && bun dev` → http://localhost:3000

## Fluxos

- **Admin** (`/admin`, só e-mails da tabela `admins`): cria sessão → envia fotos (direto do navegador para o
  Storage, prévia com marca d'água gerada no servidor; o nome do arquivo vira o código) → coloca online.
- **Conta:** cadastro com e-mail e senha → fica pendente até você marcar `aprovado = true` em *Table Editor → perfis*.
  Esqueceu a senha → link por e-mail → `/redefinir-senha`.
- **Comprador:** escolhe fotos → login → Pix (QR + copia e cola) → confirmação automática
  → *Minhas compras* → download do original por URL assinada de 60 s.
- **Pagamento:** confirmado pelo webhook `/api/webhooks/mercadopago` (precisa de `SITE_URL` em https)
  e também pelo polling da tela de checkout, que consulta o Mercado Pago a cada 5 s — funciona em localhost.

## Segurança

Todo acesso a dados é feito no servidor com `SUPABASE_SECRET_KEY`. As tabelas têm RLS ligado sem políticas,
então a chave pública não lê nem grava nada direto. Originais ficam em bucket privado.
