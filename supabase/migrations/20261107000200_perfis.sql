-- Perfil de cada conta. `aprovado` só muda pelo banco (Table Editor → perfis):
-- conta não aprovada não consegue entrar no site.
create table public.perfis (
  id         uuid primary key references auth.users on delete cascade,
  email      text not null,
  aprovado   boolean not null default false,
  criado_em  timestamptz not null default now()
);

alter table public.perfis enable row level security;
grant select, insert, update, delete on public.perfis to service_role;

-- Cria o perfil automaticamente em todo cadastro (inclusive usuários criados pelo painel).
-- security definer: quem insere em auth.users é o serviço de Auth, sem permissão em public.perfis.
create function public.criar_perfil() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.perfis (id, email) values (new.id, lower(new.email));
  return new;
end;
$$;
revoke execute on function public.criar_perfil() from public, anon, authenticated;

create trigger ao_criar_usuario
  after insert on auth.users
  for each row execute function public.criar_perfil();

-- Contas que já existiam: admins entram aprovados, o resto fica pendente.
insert into public.perfis (id, email, aprovado)
select u.id, lower(u.email), exists (select 1 from public.admins a where a.email = lower(u.email))
from auth.users u
on conflict (id) do nothing;
