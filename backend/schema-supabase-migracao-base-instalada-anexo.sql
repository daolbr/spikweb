-- ============================================================
-- Spik CRM — Migração: Base Instalada + Anexo de Proposta
-- Rode no SQL Editor do Supabase.
-- ============================================================

-- --- nova tabela: base_instalada ---

create table base_instalada (
  id uuid primary key default gen_random_uuid(),
  produto_servico varchar(150) not null,
  empresa_id uuid not null references empresas(id) on delete cascade,
  oportunidade_id uuid references oportunidades(id) on delete set null,
  data_venda date not null,
  data_renovacao date,
  valor numeric(14,2),
  observacoes text,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);
create index idx_base_instalada_empresa on base_instalada(empresa_id);
create index idx_base_instalada_renovacao on base_instalada(data_renovacao);

-- --- anexo de proposta comercial em oportunidades ---

alter table oportunidades add column proposta_arquivo bytea;
alter table oportunidades add column proposta_arquivo_nome varchar(200);
alter table oportunidades add column proposta_arquivo_tipo varchar(100);

-- ============================================================
-- LIMPEZA OPCIONAL — módulos descontinuados (Propostas, Campanhas, Projetos)
--
-- As tabelas abaixo NÃO são mais usadas pela aplicação, mas este script
-- não as apaga por padrão — preferimos não destruir dados sem sua
-- confirmação explícita. Se você tem certeza que não precisa mais desses
-- dados, descomente e rode o bloco abaixo separadamente.
-- ============================================================

-- drop table if exists itens_proposta;
-- drop table if exists propostas;
-- drop table if exists campanhas;
-- drop table if exists projetos;
-- drop type if exists propostas_status_enum;
-- drop type if exists campanhas_status_enum;
-- drop type if exists projetos_status_enum;

-- ============================================================
-- Fim. Confira em Table Editor:
-- - nova tabela base_instalada
-- - oportunidades com 3 colunas novas (proposta_arquivo*)
-- ============================================================
