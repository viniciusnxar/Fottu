-- Admin passa a ser uma coluna do perfil (Table Editor → perfis → is_admin).
alter table public.perfis add column is_admin boolean not null default false;

-- Migra quem estava na antiga tabela admins (admins também ficam aprovados) e remove a tabela.
update public.perfis p set is_admin = true, aprovado = true
from public.admins a
where a.email = p.email;

drop table public.admins;
