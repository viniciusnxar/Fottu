# Marketplace de Fotos

Scaffold inicial: marketplace de fotos (praia/esporte) com preview em marca d'água,
checkout Pix (Mercado Pago), login sem senha (código por e-mail) e painel admin.

## Stack

- **Next.js 14** (App Router) + TypeScript + Tailwind
- **PostgreSQL** via Prisma (recomendado: Supabase ou Neon)
- **Cloudflare R2 / AWS S3** para armazenamento de imagens (SDK compatível com ambos)
- **Resend** para envio de e-mails (código de login, confirmação de compra)
- **Mercado Pago** (Pix) — Stripe pode ser adicionado do mesmo jeito depois

## Como rodar

```bash
npm install
cp .env.example .env       # preencha com suas credenciais
npx prisma migrate dev --name init
npm run dev
```

## Estrutura

```
src/
  app/
    page.tsx                 # home — grid de anúncios (marketplace)
    produto/[id]/page.tsx     # página do anúncio — fotos com marca d'água
    login/page.tsx            # login por código enviado por e-mail
    checkout/[vendaId]/page.tsx
    minhas-compras/page.tsx   # downloads liberados após pagamento
    admin/                    # painel administrativo
    api/                      # rotas de backend (auth, checkout, webhook, upload)
  components/                 # ProductCard, PhotoGrid, AdminSidebar
  lib/                        # db.ts, storage.ts, email.ts, auth.ts
prisma/schema.prisma          # modelo de dados completo
```

## O que já está pronto

- Modelo de dados completo (anúncios, fotos, usuários, vendas, transações)
- Fluxo de geração de preview com marca d'água (Sharp) no upload
- Login por código de 6 dígitos com expiração
- Criação de pagamento Pix via Mercado Pago + webhook de confirmação
- Download com URL assinada e temporária (nunca expõe o arquivo original direto)
- Dashboard admin com vendas por anúncio, toggle online/offline, log de transações

## O que falta antes de produção (próximos passos)

1. **Autenticação do admin** — hoje `/admin` está aberto. Adicione login com a tabela
   `Admin` do schema + proteção via middleware do Next.js.
2. **Formulário de criação/edição de anúncio e upload de fotos** no painel admin
   (a rota `/api/upload` já existe, falta a interface).
3. **Renderizar o QR code Pix** na página de checkout (o retorno da API já vem pronto
   em `qrCodeBase64`) e fazer polling do status do pagamento.
4. **Rate limiting** no envio de código de login, pra evitar spam de e-mails.
5. Testes de carga no processamento de imagem (Sharp) se o volume de upload for alto —
   considerar mover para uma fila (ex: Inngest, Trigger.dev) se travar a rota.

## Decisões de design

Paleta e tipografia pensadas pro contexto (esporte de praia, "tickets" de venda):
fundo areia (`sand`) + azul oceano profundo (`ocean`) pros blocos de destaque, laranja
coral pra preço/CTA, aqua pro status "online". Os cards de produto imitam um recibo/ticket
(linha perfurada entre a foto e as infos), ecoando os prints que você mandou.
