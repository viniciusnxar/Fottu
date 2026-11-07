-- Fottu: schema completo. Rode no SQL Editor do Supabase (ou `supabase db push`).
-- Todo acesso a dados passa pelo servidor Next com a secret key; por isso RLS fica
-- ligado SEM políticas: anon/authenticated não leem nem escrevem nada direto pela API.

create type status_anuncio as enum ('ONLINE', 'OFFLINE');
create type status_venda as enum ('PENDENTE', 'PAGO', 'CANCELADO', 'EXPIRADO');

-- Um "photoshoot": ex. "Ipanema - 23/12"
create table public.anuncios (
  id          uuid primary key default gen_random_uuid(),
  titulo      text not null,
  local       text not null,
  data        date not null,
  preco_base  numeric(10,2) not null check (preco_base > 0),
  status      status_anuncio not null default 'OFFLINE',
  fotografo   text,
  criado_em   timestamptz not null default now()
);
create index on public.anuncios (status, data desc);

create table public.fotos (
  id             uuid primary key default gen_random_uuid(),
  anuncio_id     uuid not null references public.anuncios on delete cascade,
  codigo         text not null,            -- ex: "020A7197", exibido ao comprador
  path_preview   text not null,            -- bucket público "previews" (marca d'água)
  path_original  text not null,            -- bucket privado "originais"
  preco          numeric(10,2) not null check (preco > 0),
  criado_em      timestamptz not null default now(),
  unique (anuncio_id, codigo)
);

create table public.vendas (
  id             uuid primary key default gen_random_uuid(),
  usuario_id     uuid not null references auth.users on delete restrict,
  email          text not null,
  valor_total    numeric(10,2) not null check (valor_total > 0),
  status         status_venda not null default 'PENDENTE',
  mp_payment_id  text unique,              -- id do pagamento no Mercado Pago
  pix_qr         text,                     -- Pix copia e cola
  pix_qr_base64  text,                     -- imagem do QR
  expira_em      timestamptz,
  criado_em      timestamptz not null default now(),
  pago_em        timestamptz
);
create index on public.vendas (usuario_id, status);
create index on public.vendas (status, criado_em desc);

create table public.itens_venda (
  venda_id  uuid not null references public.vendas on delete cascade,
  foto_id   uuid not null references public.fotos on delete restrict,
  preco     numeric(10,2) not null,
  primary key (venda_id, foto_id)
);
create index on public.itens_venda (foto_id);

-- Log financeiro imutável
create table public.transacoes (
  id                  uuid primary key default gen_random_uuid(),
  venda_id            uuid not null unique references public.vendas,
  metodo              text not null,
  valor               numeric(10,2) not null,
  id_externo_gateway  text,
  criado_em           timestamptz not null default now()
);
create index on public.transacoes (criado_em desc);

alter table public.anuncios    enable row level security;
alter table public.fotos       enable row level security;
alter table public.vendas      enable row level security;
alter table public.itens_venda enable row level security;
alter table public.transacoes  enable row level security;

-- Só o servidor (secret key = service_role) acessa as tabelas. Explícito porque projetos novos
-- podem estar com "expor tabelas novas automaticamente" desligado.
grant usage on schema public to service_role;
grant select, insert, update, delete on all tables in schema public to service_role;

-- Storage: prévias públicas, originais privados (download só por URL assinada do servidor)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values
  ('previews',  'previews',  true,  5242880,  array['image/jpeg']),
  ('originais', 'originais', false, 52428800, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;
