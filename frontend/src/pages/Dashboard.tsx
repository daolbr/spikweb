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

const ESTAGIOS_ATIVOS: EstagioFunil[] = ['PROSPECCAO', 'QUALIFICACAO', 'PROPOSTA', 'NEGOCIACAO'];
const COR_FUNIL = ['#6B7280', '#3E85BB', '#1A68A5', '#4C9E00'];

function FunilChart({ porEstagio }: { porEstagio: ResumoIndicadores['pipeline']['porEstagio'] }) {
  const largura = 640;
  const alturaFaixa = 56;
  const gap = 3;
  const maxQtd = Math.max(1, ...ESTAGIOS_ATIVOS.map((e) => porEstagio[e]?.quantidade ?? 0));
  const larguraMin = largura * 0.28;

  return (
    <svg viewBox={`0 0 ${largura} ${(alturaFaixa + gap) * ESTAGIOS_ATIVOS.length}`} width="100%">
      {ESTAGIOS_ATIVOS.map((estagio, i) => {
        const info = porEstagio[estagio] ?? { total: 0, quantidade: 0 };
        const proporcao = maxQtd > 0 ? info.quantidade / maxQtd : 0;
        const wTopo = i === 0 ? largura : larguraMin + (largura - larguraMin) * (1 - i / ESTAGIOS_ATIVOS.length);
        const wBase = larguraMin + (largura - larguraMin) * (1 - (i + 1) / ESTAGIOS_ATIVOS.length);
        const wReal = Math.max(larguraMin * 0.5, wBase * (0.4 + 0.6 * proporcao));
        const y = i * (alturaFaixa + gap);
        const xTopoEsq = (largura - wTopo) / 2;
        const xBaseEsq = (largura - wReal) / 2;
        return (
          <g key={estagio}>
            <polygon
              points={`${xTopoEsq},${y} ${xTopoEsq + wTopo},${y} ${xBaseEsq + wReal},${y + alturaFaixa} ${xBaseEsq},${y + alturaFaixa}`}
              fill={COR_FUNIL[i]}
              opacity={0.92}
            />
            <text x={largura / 2} y={y + alturaFaixa / 2 - 6} textAnchor="middle" fill="white" fontSize="13" fontWeight="600">
              {ROTULO_ESTAGIO[estagio]}
            </text>
            <text x={largura / 2} y={y + alturaFaixa / 2 + 13} textAnchor="middle" fill="white" fontSize="12" opacity={0.9}>
              {info.quantidade} oportunidade{info.quantidade === 1 ? '' : 's'} · {formatarMoeda(info.total)}
            </text>
          </g>
        );
      })}
    </svg>
  );
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

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-6">
        <h1 style={{ fontFamily: 'var(--font-display)' }} className="text-2xl font-semibold text-ink">
          Indicadores
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--color-ink-soft)' }}>
          Visão geral do funil e atividades
        </p>
      </div>

      {/* Card de destaque: marinho + mancha de brilho, no padrão decorativo da marca */}
      <div
        className="rounded-2xl p-7 mb-6 relative overflow-hidden text-white"
        style={{ backgroundColor: 'var(--color-ink)' }}
      >
        <div
          className="absolute pointer-events-none"
          style={{
            width: 460, height: 460, right: -160, top: -200,
            background: 'radial-gradient(circle at 50% 50%, color-mix(in srgb, var(--color-green-forte) 55%, transparent), color-mix(in srgb, var(--color-petrol-600) 25%, transparent) 45%, transparent 72%)',
            filter: 'blur(30px)',
          }}
        />
        <div className="relative">
          <p className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.65)' }}>Pipeline ativo</p>
          <p className="text-4xl font-extrabold mt-1" style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}>
            {formatarMoeda(data.pipeline.valorAtivo)}
          </p>
          <div className="flex gap-9 mt-4">
            <div>
              <p className="text-lg font-bold">{data.pipeline.quantidadeAtiva}</p>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.6)' }}>oportunidades</p>
            </div>
            <div>
              <p className="text-lg font-bold">{data.conversao.taxa !== null ? `${(data.conversao.taxa * 100).toFixed(0)}%` : '—'}</p>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.6)' }}>conversão</p>
            </div>
            <div>
              <p className="text-lg font-bold">{data.atividades.pendentes}</p>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.6)' }}>atividades pendentes</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-8">
        <Cartao rotulo="Ganhas" valor={String(data.conversao.ganhas)} corDestaque="var(--color-petrol-600)" />
        <Cartao
          rotulo="Perdidas"
          valor={String(data.conversao.perdidas)}
        />
        <Cartao rotulo="Atividades atrasadas" valor={String(data.atividades.atrasadas)} corDestaque={data.atividades.atrasadas > 0 ? 'var(--color-clay-700)' : undefined} />
      </div>

      <div className="bg-white border rounded-lg p-5 mb-6" style={{ borderColor: 'var(--color-line)' }}>
        <h2 style={{ fontFamily: 'var(--font-display)' }} className="text-sm font-semibold text-ink mb-4">
          Funil de vendas — estágios ativos
        </h2>
        <FunilChart porEstagio={data.pipeline.porEstagio} />
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white border rounded-lg p-5" style={{ borderColor: 'var(--color-line)' }}>
          <h2 style={{ fontFamily: 'var(--font-display)' }} className="text-sm font-semibold text-ink mb-3">
            Ganha vs. Perdida
          </h2>
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <div className="h-3 rounded-full overflow-hidden flex" style={{ backgroundColor: 'var(--color-line)' }}>
                {(() => {
                  const total = Math.max(1, data.conversao.ganhas + data.conversao.perdidas);
                  const pctGanha = (data.conversao.ganhas / total) * 100;
                  return (
                    <>
                      <div style={{ width: `${pctGanha}%`, backgroundColor: 'var(--color-green-texto)' }} />
                      <div style={{ width: `${100 - pctGanha}%`, backgroundColor: 'var(--color-clay-700)' }} />
                    </>
                  );
                })()}
              </div>
              <div className="flex justify-between mt-2 text-xs">
                <span style={{ color: 'var(--color-green-texto)' }}>● Ganha ({data.conversao.ganhas})</span>
                <span style={{ color: 'var(--color-clay-700)' }}>Perdida ({data.conversao.perdidas}) ●</span>
              </div>
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
