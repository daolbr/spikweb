-- ============================================================
-- Spik CRM — Migração: campo "porte" em Empresas
-- Rode no SQL Editor do Supabase. Adiciona só o que falta —
-- não afeta dados existentes (coluna nova fica NULL por padrão).
-- ============================================================

create type empresas_porte_enum as enum ('MEI', 'MICRO', 'PEQUENA', 'MEDIA', 'GRANDE');

alter table empresas add column porte empresas_porte_enum;

-- ============================================================
-- Fim. Confira em Table Editor → empresas: deve aparecer a
-- coluna "porte" no final da lista de colunas.
-- ============================================================
