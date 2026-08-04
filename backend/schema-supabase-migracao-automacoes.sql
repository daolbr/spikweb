-- ============================================================
-- Spik CRM — Migração: Automações de Inteligência Comercial
-- Rode no SQL Editor do Supabase.
--
-- Adiciona:
-- 1) dois novos tipos de atividade (PROSPECCAO, FIDELIZACAO) — usados
--    pela geração automática de tarefas de prospecção e pela cadência
--    de fidelização pós-venda.
-- 2) uma coluna de controle na Base Instalada, para não gerar a mesma
--    oportunidade de renovação duas vezes.
-- ============================================================

-- Postgres não permite adicionar valores a um enum dentro da mesma
-- transação em que eles são usados, mas rodar estes ALTER TYPE isolados
-- (sem uso na mesma sessão) funciona normalmente pelo SQL Editor.
alter type atividades_tipo_enum add value if not exists 'PROSPECCAO';
alter type atividades_tipo_enum add value if not exists 'FIDELIZACAO';

alter table base_instalada add column renovacao_gerada boolean not null default false;

-- ============================================================
-- Fim. Confira rodando:
--   SELECT enumlabel FROM pg_enum
--   JOIN pg_type ON pg_enum.enumtypid = pg_type.oid
--   WHERE typname = 'atividades_tipo_enum';
-- Deve listar 7 valores, incluindo PROSPECCAO e FIDELIZACAO.
-- ============================================================
