-- Admins do painel: adicione/remova e-mails aqui (Table Editor → admins).
create table public.admins (
  email      text primary key check (email = lower(email)),
  criado_em  timestamptz not null default now()
);

alter table public.admins enable row level security;
grant select, insert, update, delete on public.admins to service_role;

-- Troque pelo seu e-mail (minúsculo) antes de rodar, ou insira depois pelo Table Editor.
insert into public.admins (email) values ('viniciusnxar@gmail.com');
