-- ============================================================
-- Spik CRM — Migração: Motor de Campos Customizados
-- Rode este script no SQL Editor do Supabase DEPOIS do schema-supabase.sql
-- original (ele não recria as tabelas antigas, só adiciona as 3 novas
-- deste motor). Testado localmente contra o TypeORM antes de entregar.
-- ============================================================

create type campos_customizados_entidade_enum as enum ('EMPRESA', 'CONTATO', 'OPORTUNIDADE', 'ATIVIDADE', 'PROPOSTA');
create type campos_customizados_tipo_enum as enum ('TEXTO', 'NUMERO', 'DATA', 'LISTA', 'BOOLEANO');
create type permissoes_campo_papel_enum as enum ('ADMIN', 'GESTOR', 'VENDEDOR');

create table campos_customizados (
  id uuid primary key default gen_random_uuid(),
  entidade campos_customizados_entidade_enum not null,
  nome varchar(60) not null,
  rotulo varchar(100) not null,
  tipo campos_customizados_tipo_enum not null,
  opcoes_lista text,
  obrigatorio boolean not null default false,
  ordem integer not null default 0,
  ativo boolean not null default true,
  criado_em timestamptz not null default now()
);

create table permissoes_campo (
  id uuid primary key default gen_random_uuid(),
  campo_id uuid not null references campos_customizados(id) on delete cascade,
  papel permissoes_campo_papel_enum not null,
  pode_ver boolean not null default true,
  pode_editar boolean not null default true
);
create index idx_permissoes_campo on permissoes_campo(campo_id);

create table valores_campos_customizados (
  id uuid primary key default gen_random_uuid(),
  campo_id uuid not null references campos_customizados(id) on delete cascade,
  entidade_id varchar not null,
  valor text,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  unique (campo_id, entidade_id)
);
create index idx_valores_campo on valores_campos_customizados(campo_id);
create index idx_valores_entidade on valores_campos_customizados(entidade_id);

-- ============================================================
-- Fim. Confira em Table Editor: devem aparecer mais 3 tabelas
-- (total de 13 no projeto agora).
-- ============================================================
