-- ============================================================
-- Spik CRM — Migração: Checkpoint evolutivo de Oportunidades
-- Rode no SQL Editor do Supabase. Adiciona os campos que fazem
-- a oportunidade refletir sempre o acompanhamento mais recente
-- (valor, confiabilidade, previsão de fechamento, classificação),
-- mais responsáveis (vendedor/especialista) e vertical.
--
-- Também corrige um bug latente: a coluna "motivoPerda" foi criada
-- com esse nome (herdado de um mapeamento implícito incorreto),
-- mas a aplicação sempre esperou "motivo_perda". Este script renomeia
-- a coluna existente em vez de criar uma nova, preservando dados.
-- ============================================================

create type oportunidades_classificacao_enum as enum ('A', 'B', 'C');
create type historico_oportunidades_classificacao_enum as enum ('A', 'B', 'C');

-- --- oportunidades ---

alter table oportunidades add column confiabilidade integer;
alter table oportunidades add column classificacao oportunidades_classificacao_enum;
alter table oportunidades add column vendedor_id uuid references usuarios(id) on delete set null;
alter table oportunidades add column especialista_id uuid references usuarios(id) on delete set null;
alter table oportunidades add column vertical varchar(80);

-- Corrige o nome da coluna, se ela ainda estiver com o nome antigo.
-- (Seguro rodar mesmo se já tiver sido corrigida manualmente antes —
-- o IF EXISTS evita erro de "coluna não encontrada".)
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_name = 'oportunidades' and column_name = 'motivoPerda'
  ) then
    alter table oportunidades rename column "motivoPerda" to motivo_perda;
  end if;
end $$;

-- --- historico_oportunidades ---

alter table historico_oportunidades add column valor numeric(14,2);
alter table historico_oportunidades add column confiabilidade integer;
alter table historico_oportunidades add column previsao_fechamento date;
alter table historico_oportunidades add column classificacao historico_oportunidades_classificacao_enum;

-- ============================================================
-- Fim. Confira em Table Editor:
-- - oportunidades deve ter 6 colunas novas/corrigidas
-- - historico_oportunidades deve ter 4 colunas novas
-- ============================================================
