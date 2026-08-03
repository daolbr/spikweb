import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';
import type { EstagioFunil, ResumoIndicadores } from '../api/types';

const ROTULO_ESTAGIO: Record<EstagioFunil, string> = {
  PROSPECCAO: 'Prospecção',
  QUALIFICACAO: 'Qualificação',
  PROPOSTA: 'Proposta',
  NEGOCIACAO: 'Negociação',
  GANHA: 'Ganha',
  PERDIDA: 'Perdida',
};

function formatarMoeda(valor: number) {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
}

function Cartao({ rotulo, valor, corDestaque }: { rotulo: string; valor: string; corDestaque?: string }) {
  return (
    <div className="bg-white border rounded-lg p-4" style={{ borderColor: 'var(--color-line)' }}>
      <p className="text-xs font-medium" style={{ color: 'var(--color-ink-soft)' }}>{rotulo}</p>
      <p className="text-2xl font-semibold mt-1" style={{ fontFamily: 'var(--font-display)', color: corDestaque ?? 'var(--color-ink)' }}>
        {valor}
      </p>
    </div>
  );
}

export default function Dashboard() {
  const { data, isLoading } = useQuery<ResumoIndicadores>({
    queryKey: ['indicadores'],
    queryFn: async () => {
      const { data } = await api.get('/indicadores/resumo');
      return data;
    },
  });

  if (isLoading || !data) {
    return <div className="p-8"><p className="text-sm" style={{ color: 'var(--color-ink-soft)' }}>Carregando…</p></div>;
  }

  const maiorValorEstagio = Math.max(
    1,
    ...Object.values(data.pipeline.porEstagio).map((e) => e.total),
  );

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-6">
        <h1 style={{ fontFamily: 'var(--font-display)' }} className="text-2xl font-semibold text-ink">
          Indicadores
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--color-ink-soft)' }}>
          Visão geral do funil, atividades e receita
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        <Cartao rotulo="Pipeline ativo" valor={formatarMoeda(data.pipeline.valorAtivo)} corDestaque="var(--color-petrol-600)" />
        <Cartao
          rotulo="Taxa de conversão"
          valor={data.conversao.taxa !== null ? `${(data.conversao.taxa * 100).toFixed(0)}%` : '—'}
        />
        <Cartao rotulo="Atividades pendentes" valor={String(data.atividades.pendentes)} corDestaque={data.atividades.atrasadas > 0 ? 'var(--color-clay-700)' : undefined} />
        <Cartao rotulo="Receita aprovada" valor={formatarMoeda(data.receita.valorAprovado)} corDestaque="#3B8054" />
      </div>

      <div className="bg-white border rounded-lg p-5 mb-6" style={{ borderColor: 'var(--color-line)' }}>
        <h2 style={{ fontFamily: 'var(--font-display)' }} className="text-sm font-semibold text-ink mb-4">
          Valor em aberto por estágio do funil
        </h2>
        <div className="space-y-3">
          {(Object.entries(data.pipeline.porEstagio) as [EstagioFunil, { total: number; quantidade: number }][]).map(
            ([estagio, info]) => (
              <div key={estagio}>
                <div className="flex justify-between text-xs mb-1">
                  <span style={{ color: 'var(--color-ink-soft)' }}>
                    {ROTULO_ESTAGIO[estagio]} <span className="opacity-60">({info.quantidade})</span>
                  </span>
                  <span className="font-medium text-ink">{formatarMoeda(info.total)}</span>
                </div>
                <div className="h-2 rounded-full bg-black/[0.04] overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${(info.total / maiorValorEstagio) * 100}%`,
                      backgroundColor:
                        estagio === 'GANHA' ? '#3B8054' : estagio === 'PERDIDA' ? 'var(--color-clay-700)' : 'var(--color-petrol-400)',
                    }}
                  />
                </div>
              </div>
            ),
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white border rounded-lg p-5" style={{ borderColor: 'var(--color-line)' }}>
          <h2 style={{ fontFamily: 'var(--font-display)' }} className="text-sm font-semibold text-ink mb-3">
            Oportunidades fechadas
          </h2>
          <div className="flex items-center gap-6">
            <div>
              <p className="text-xl font-semibold" style={{ color: '#3B8054' }}>{data.conversao.ganhas}</p>
              <p className="text-xs" style={{ color: 'var(--color-ink-soft)' }}>Ganhas</p>
            </div>
            <div>
              <p className="text-xl font-semibold" style={{ color: 'var(--color-clay-700)' }}>{data.conversao.perdidas}</p>
              <p className="text-xs" style={{ color: 'var(--color-ink-soft)' }}>Perdidas</p>
            </div>
          </div>
        </div>

        <div className="bg-white border rounded-lg p-5" style={{ borderColor: 'var(--color-line)' }}>
          <h2 style={{ fontFamily: 'var(--font-display)' }} className="text-sm font-semibold text-ink mb-3">
            Atividades
          </h2>
          <div className="flex items-center gap-6">
            <div>
              <p className="text-xl font-semibold text-ink">{data.atividades.concluidas}</p>
              <p className="text-xs" style={{ color: 'var(--color-ink-soft)' }}>Concluídas</p>
            </div>
            <div>
              <p className="text-xl font-semibold" style={{ color: data.atividades.atrasadas > 0 ? 'var(--color-clay-700)' : 'var(--color-ink)' }}>
                {data.atividades.atrasadas}
              </p>
              <p className="text-xs" style={{ color: 'var(--color-ink-soft)' }}>Atrasadas</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
