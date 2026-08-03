-- ============================================================
-- Spik CRM — Script de criação de estrutura (Supabase / PostgreSQL)
-- Gerado a partir das entidades TypeORM do backend.
-- Rode este script inteiro no SQL Editor do Supabase (Database → SQL Editor → New query).
-- Seguro rodar uma vez em banco vazio. Não rode duas vezes sem antes
-- apagar as tabelas, ou vai dar erro de "já existe".
-- ============================================================

create extension if not exists pgcrypto;

-- ---------- ENUMS ----------

create type usuarios_papel_enum as enum ('ADMIN', 'GESTOR', 'VENDEDOR');
create type oportunidades_estagio_enum as enum ('PROSPECCAO', 'QUALIFICACAO', 'PROPOSTA', 'NEGOCIACAO', 'GANHA', 'PERDIDA');
create type atividades_tipo_enum as enum ('LIGACAO', 'REUNIAO', 'EMAIL', 'VISITA', 'TAREFA');
create type atividades_status_enum as enum ('PENDENTE', 'CONCLUIDA', 'CANCELADA');
create type propostas_status_enum as enum ('RASCUNHO', 'ENVIADA', 'APROVADA', 'RECUSADA');
create type campanhas_status_enum as enum ('PLANEJADA', 'EM_ANDAMENTO', 'CONCLUIDA', 'CANCELADA');
create type projetos_status_enum as enum ('PLANEJADO', 'EM_ANDAMENTO', 'CONCLUIDO', 'CANCELADO');

-- ---------- USUARIOS ----------

create table usuarios (
  id uuid primary key default gen_random_uuid(),
  nome varchar(120) not null,
  email varchar(150) not null unique,
  senha_hash text not null,
  papel usuarios_papel_enum not null default 'VENDEDOR',
  ativo boolean not null default true,
  criado_em timestamptz not null default now()
);

-- ---------- EMPRESAS ----------

create table empresas (
  id uuid primary key default gen_random_uuid(),
  nome varchar(150) not null,
  cnpj varchar(20) unique,
  segmento varchar(80),
  cidade varchar(80),
  uf varchar(2),
  telefone varchar(20),
  site varchar(120),
  observacoes text,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

-- ---------- CONTATOS ----------

create table contatos (
  id uuid primary key default gen_random_uuid(),
  nome varchar(120) not null,
  email varchar(120),
  telefone varchar(20),
  celular varchar(20),
  cargo varchar(80),
  empresa_id uuid not null references empresas(id) on delete cascade,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);
create index idx_contatos_empresa on contatos(empresa_id);

-- ---------- OPORTUNIDADES ----------

create table oportunidades (
  id uuid primary key default gen_random_uuid(),
  titulo varchar(150) not null,
  empresa_id uuid not null references empresas(id) on delete cascade,
  contato_id uuid references contatos(id) on delete set null,
  estagio oportunidades_estagio_enum not null default 'PROSPECCAO',
  valor numeric(14,2) not null default 0,
  previsao_fechamento date,
  origem varchar(80),
  motivo_perda text,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);
create index idx_oportunidades_empresa on oportunidades(empresa_id);
create index idx_oportunidades_estagio on oportunidades(estagio);

-- ---------- HISTORICO_OPORTUNIDADES ----------

create table historico_oportunidades (
  id uuid primary key default gen_random_uuid(),
  oportunidade_id uuid not null references oportunidades(id) on delete cascade,
  anotacao text not null,
  estagio_no_momento varchar(32),
  criado_em timestamptz not null default now()
);
create index idx_historico_oportunidade on historico_oportunidades(oportunidade_id);

-- ---------- ATIVIDADES ----------

create table atividades (
  id uuid primary key default gen_random_uuid(),
  titulo varchar(150) not null,
  tipo atividades_tipo_enum not null default 'TAREFA',
  status atividades_status_enum not null default 'PENDENTE',
  empresa_id uuid not null references empresas(id) on delete cascade,
  contato_id uuid references contatos(id) on delete set null,
  oportunidade_id uuid references oportunidades(id) on delete set null,
  responsavel_id uuid references usuarios(id) on delete set null,
  data_inicio timestamptz not null,
  data_fim timestamptz,
  data_conclusao timestamptz,
  notas text,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);
create index idx_atividades_empresa on atividades(empresa_id);
create index idx_atividades_status on atividades(status);
create index idx_atividades_data_inicio on atividades(data_inicio);

-- ---------- PROPOSTAS ----------

create table propostas (
  id uuid primary key default gen_random_uuid(),
  titulo varchar(150) not null,
  empresa_id uuid not null references empresas(id) on delete cascade,
  contato_id uuid references contatos(id) on delete set null,
  oportunidade_id uuid references oportunidades(id) on delete set null,
  status propostas_status_enum not null default 'RASCUNHO',
  validade date,
  valor_total numeric(14,2) not null default 0,
  observacoes text,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);
create index idx_propostas_empresa on propostas(empresa_id);

-- ---------- ITENS_PROPOSTA ----------

create table itens_proposta (
  id uuid primary key default gen_random_uuid(),
  proposta_id uuid not null references propostas(id) on delete cascade,
  descricao varchar(150) not null,
  quantidade numeric(12,2) not null default 1,
  valor_unitario numeric(14,2) not null
);
create index idx_itens_proposta on itens_proposta(proposta_id);

-- ---------- CAMPANHAS ----------

create table campanhas (
  id uuid primary key default gen_random_uuid(),
  nome varchar(150) not null,
  status campanhas_status_enum not null default 'PLANEJADA',
  data_inicio date,
  data_fim date,
  orcamento numeric(14,2),
  descricao text,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

-- ---------- PROJETOS ----------

create table projetos (
  id uuid primary key default gen_random_uuid(),
  nome varchar(150) not null,
  empresa_id uuid not null references empresas(id) on delete cascade,
  status projetos_status_enum not null default 'PLANEJADO',
  data_inicio date,
  data_fim date,
  descricao text,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);
create index idx_projetos_empresa on projetos(empresa_id);

-- ============================================================
-- Fim. Confira em Table Editor: devem aparecer 10 tabelas.
-- ============================================================
