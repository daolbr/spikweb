import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';
import type { PerfilIdeal, ProspectSugerido } from '../api/types';

const ROTULO_PORTE: Record<string, string> = {
  MEI: 'MEI',
  MICRO: 'Microempresa',
  PEQUENA: 'Pequena empresa',
  MEDIA: 'Média empresa',
  GRANDE: 'Grande empresa',
};

function formatarMoeda(valor: number) {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
}

function BlocoRanking({ titulo, dados, formatarValor }: { titulo: string; dados: { valor: string; vitorias: number; valorTotal: number }[]; formatarValor?: (v: string) => string }) {
  const max = Math.max(1, ...dados.map((d) => d.vitorias));
  return (
    <div className="bg-white border rounded-lg p-4" style={{ borderColor: 'var(--color-line)' }}>
      <h3 className="text-sm font-semibold text-ink mb-3">{titulo}</h3>
      {dados.length === 0 ? (
        <p className="text-xs" style={{ color: 'var(--color-ink-soft)' }}>Ainda sem negócios ganhos suficientes.</p>
      ) : (
        <div className="space-y-2">
          {dados.slice(0, 5).map((d) => (
            <div key={d.valor}>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-ink font-medium">{formatarValor ? formatarValor(d.valor) : d.valor}</span>
                <span style={{ color: 'var(--color-ink-soft)' }}>{d.vitorias} negócio{d.vitorias === 1 ? '' : 's'} · {formatarMoeda(d.valorTotal)}</span>
              </div>
              <div className="h-1.5 rounded-full bg-black/[0.04] overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${(d.vitorias / max) * 100}%`, backgroundColor: 'var(--color-petrol-600)' }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function PerfilCliente() {
  const navigate = useNavigate();

  const { data: perfil, isLoading: carregandoPerfil } = useQuery<PerfilIdeal>({
    queryKey: ['automacoes', 'perfil-ideal'],
    queryFn: async () => {
      const { data } = await api.get('/automacoes/perfil-ideal');
      return data;
    },
  });

  const { data: sugestoes, isLoading: carregandoSugestoes } = useQuery<{ prospects: ProspectSugerido[] }>({
    queryKey: ['automacoes', 'prospects-sugeridos'],
    queryFn: async () => {
      const { data } = await api.get('/automacoes/prospects-sugeridos');
      return data;
    },
  });

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-6">
        <h1 style={{ fontFamily: 'var(--font-display)' }} className="text-2xl font-semibold text-ink">
          Perfil ideal de cliente
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--color-ink-soft)' }}>
          Com base nos negócios já fechados, veja que tipo de cliente tem mais chance de fechamento — e quais prospects na sua base combinam com esse perfil.
        </p>
      </div>

      {carregandoPerfil ? (
        <p className="text-sm" style={{ color: 'var(--color-ink-soft)' }}>Carregando…</p>
      ) : (
        <div className="grid grid-cols-3 gap-3 mb-8">
          <BlocoRanking titulo="Por porte" dados={perfil?.porPorte ?? []} formatarValor={(v) => ROTULO_PORTE[v] ?? v} />
          <BlocoRanking titulo="Por segmento" dados={perfil?.porSegmento ?? []} />
          <BlocoRanking titulo="Por estado (UF)" dados={perfil?.porUf ?? []} />
        </div>
      )}

      <div className="flex items-center justify-between mb-3">
        <h2 style={{ fontFamily: 'var(--font-display)' }} className="text-lg font-semibold text-ink">
          Prospects sugeridos
        </h2>
        <p className="text-xs" style={{ color: 'var(--color-ink-soft)' }}>
          Empresas cadastradas sem nenhuma oportunidade ainda, que combinam com o perfil acima
        </p>
      </div>

      <div className="bg-white border rounded-lg overflow-hidden" style={{ borderColor: 'var(--color-line)' }}>
        {carregandoSugestoes ? (
          <p className="p-6 text-sm" style={{ color: 'var(--color-ink-soft)' }}>Carregando…</p>
        ) : !sugestoes?.prospects.length ? (
          <div className="p-10 text-center">
            <p className="text-sm font-medium text-ink">Nenhum prospect combina com o perfil ainda</p>
            <p className="text-sm mt-1" style={{ color: 'var(--color-ink-soft)' }}>
              Cadastre mais empresas, ou feche mais negócios para refinar o perfil.
            </p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left" style={{ borderColor: 'var(--color-line)' }}>
                <th className="px-4 py-3 font-medium" style={{ color: 'var(--color-ink-soft)' }}>Empresa</th>
                <th className="px-4 py-3 font-medium" style={{ color: 'var(--color-ink-soft)' }}>Atributos compatíveis</th>
                <th className="px-4 py-3 font-medium text-right" style={{ color: 'var(--color-ink-soft)' }}>Compatibilidade</th>
              </tr>
            </thead>
            <tbody>
              {sugestoes.prospects.map(({ empresa, pontuacao, atributosCompativeis }) => (
                <tr
                  key={empresa.id}
                  onClick={() => navigate(`/empresas/${empresa.id}`)}
                  className="border-b last:border-0 cursor-pointer hover:bg-black/[0.02] transition"
                  style={{ borderColor: 'var(--color-line)' }}
                >
                  <td className="px-4 py-3 font-medium text-ink">{empresa.nome}</td>
                  <td className="px-4 py-3" style={{ color: 'var(--color-ink-soft)' }}>
                    {atributosCompativeis.join(' · ') || '—'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span
                      className="text-xs font-semibold rounded-full px-2 py-0.5"
                      style={{ backgroundColor: 'var(--color-petrol-50)', color: 'var(--color-petrol-600)' }}
                    >
                      {pontuacao}/3
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
