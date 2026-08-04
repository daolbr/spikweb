import { useState, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';
import type { Oportunidade } from '../api/types';
import CamposCustomizadosPainel from './CamposCustomizadosPainel';

function formatarMoeda(valor: number | string) {
  return Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatarData(iso: string) {
  return new Date(iso).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
}

function formatarDataCurta(data: string | null) {
  if (!data) return '—';
  return new Date(data + 'T00:00:00').toLocaleDateString('pt-BR');
}

const COR_ESTAGIO: Record<string, string> = {
  PROSPECCAO: '#6B6960',
  QUALIFICACAO: '#4A8A76',
  PROPOSTA: '#2E7D67',
  NEGOCIACAO: 'var(--color-clay-500)',
  GANHA: '#3B8054',
  PERDIDA: 'var(--color-clay-700)',
};

const COR_CLASSE: Record<string, string> = { A: '#3B8054', B: 'var(--color-clay-500)', C: 'var(--color-ink-soft)' };

export default function OportunidadeDrawer({ id, onFechar }: { id: string; onFechar: () => void }) {
  const queryClient = useQueryClient();
  const [anotacao, setAnotacao] = useState('');
  const [reavaliar, setReavaliar] = useState(false);
  const [novoValor, setNovoValor] = useState('');
  const [novaConfianca, setNovaConfianca] = useState('');
  const [novaClasse, setNovaClasse] = useState('');
  const [novaPrevisao, setNovaPrevisao] = useState('');

  const { data: oportunidade, isLoading } = useQuery<Oportunidade>({
    queryKey: ['oportunidade', id],
    queryFn: async () => {
      const { data } = await api.get(`/oportunidades/${id}`);
      return data;
    },
  });

  const adicionarHistorico = useMutation({
    mutationFn: async () => {
      const payload: Record<string, unknown> = { anotacao: anotacao.trim() };
      if (reavaliar) {
        if (novoValor) payload.valor = Number(novoValor);
        if (novaConfianca) payload.confiabilidade = Number(novaConfianca);
        if (novaClasse) payload.classificacao = novaClasse;
        if (novaPrevisao) payload.previsaoFechamento = novaPrevisao;
      }
      const { data } = await api.post(`/oportunidades/${id}/historico`, payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['oportunidade', id] });
      setAnotacao('');
      setReavaliar(false);
      setNovoValor('');
      setNovaConfianca('');
      setNovaClasse('');
      setNovaPrevisao('');
    },
    onError: (err: any) => alert(err?.response?.data?.message ?? 'Não foi possível registrar.'),
  });

  function aoSubmeter(e: FormEvent) {
    e.preventDefault();
    if (anotacao.trim()) adicionarHistorico.mutate();
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="flex-1 bg-black/30" onClick={onFechar} />
      <div className="w-full max-w-md bg-white h-full overflow-y-auto border-l" style={{ borderColor: 'var(--color-line)' }}>
        {isLoading || !oportunidade ? (
          <p className="p-6 text-sm" style={{ color: 'var(--color-ink-soft)' }}>Carregando…</p>
        ) : (
          <div className="p-6">
            <button onClick={onFechar} className="text-sm mb-4" style={{ color: 'var(--color-ink-soft)' }}>
              ✕ Fechar
            </button>

            <div className="flex items-start gap-2">
              {oportunidade.classificacao && (
                <span
                  className="text-xs font-bold rounded px-1.5 py-0.5 mt-1 shrink-0"
                  style={{
                    backgroundColor: 'color-mix(in srgb, ' + (COR_CLASSE[oportunidade.classificacao] ?? '#999') + ' 18%, white)',
                    color: COR_CLASSE[oportunidade.classificacao] ?? '#999',
                  }}
                >
                  {oportunidade.classificacao}
                </span>
              )}
              <h2 style={{ fontFamily: 'var(--font-display)' }} className="text-xl font-semibold text-ink mb-1">
                {oportunidade.titulo}
              </h2>
            </div>
            <p className="text-sm mb-4" style={{ color: 'var(--color-ink-soft)' }}>
              {oportunidade.empresa?.nome}
              {oportunidade.contato ? ` · ${oportunidade.contato.nome}` : ''}
            </p>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="bg-black/[0.02] rounded-md p-3">
                <p className="text-xs" style={{ color: 'var(--color-ink-soft)' }}>Valor</p>
                <p className="text-sm font-medium text-ink">{formatarMoeda(oportunidade.valor)}</p>
              </div>
              <div className="bg-black/[0.02] rounded-md p-3">
                <p className="text-xs" style={{ color: 'var(--color-ink-soft)' }}>Confiança</p>
                <p className="text-sm font-medium text-ink">
                  {oportunidade.confiabilidade !== null ? `${oportunidade.confiabilidade}%` : '—'}
                </p>
              </div>
              <div className="bg-black/[0.02] rounded-md p-3">
                <p className="text-xs" style={{ color: 'var(--color-ink-soft)' }}>Estágio</p>
                <p className="text-sm font-medium text-ink">{oportunidade.estagio}</p>
              </div>
              <div className="bg-black/[0.02] rounded-md p-3">
                <p className="text-xs" style={{ color: 'var(--color-ink-soft)' }}>Previsão de fechamento</p>
                <p className="text-sm font-medium text-ink">{formatarDataCurta(oportunidade.previsaoFechamento)}</p>
              </div>
            </div>

            {(oportunidade.vendedor || oportunidade.especialista || oportunidade.vertical) && (
              <div className="flex flex-wrap gap-x-4 gap-y-1 mb-6 text-xs" style={{ color: 'var(--color-ink-soft)' }}>
                {oportunidade.vendedor && <span>👤 Vendedor: <strong className="text-ink font-medium">{oportunidade.vendedor.nome}</strong></span>}
                {oportunidade.especialista && <span>🎓 Especialista: <strong className="text-ink font-medium">{oportunidade.especialista.nome}</strong></span>}
                {oportunidade.vertical && <span>🏷️ {oportunidade.vertical}</span>}
              </div>
            )}

            {oportunidade.motivoPerda && (
              <div className="rounded-md p-3 mb-6 text-sm" style={{ backgroundColor: 'var(--color-clay-100)', color: 'var(--color-clay-700)' }}>
                Motivo da perda: {oportunidade.motivoPerda}
              </div>
            )}

            <CamposCustomizadosPainel entidade="OPORTUNIDADE" entidadeId={oportunidade.id} />

            <h3 className="text-sm font-medium text-ink mb-2">Registrar acompanhamento</h3>

            <form onSubmit={aoSubmeter} className="mb-6 bg-black/[0.015] rounded-md p-3 border" style={{ borderColor: 'var(--color-line)' }}>
              <textarea
                value={anotacao}
                onChange={(e) => setAnotacao(e.target.value)}
                placeholder="O que aconteceu nesta interação?"
                rows={2}
                className="w-full rounded-md border px-3 py-2 text-sm resize-none bg-white"
                style={{ borderColor: 'var(--color-line)' }}
              />

              <label className="flex items-center gap-2 text-xs mt-2" style={{ color: 'var(--color-ink-soft)' }}>
                <input type="checkbox" checked={reavaliar} onChange={(e) => setReavaliar(e.target.checked)} className="h-3.5 w-3.5" />
                Reavaliar valor, confiança, classe ou previsão de fechamento
              </label>

              {reavaliar && (
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <input
                    type="number" min="0" step="0.01" placeholder="Novo valor (R$)"
                    value={novoValor} onChange={(e) => setNovoValor(e.target.value)}
                    className="rounded-md border px-2 py-1.5 text-xs bg-white" style={{ borderColor: 'var(--color-line)' }}
                  />
                  <input
                    type="number" min="0" max="100" placeholder="Confiança (%)"
                    value={novaConfianca} onChange={(e) => setNovaConfianca(e.target.value)}
                    className="rounded-md border px-2 py-1.5 text-xs bg-white" style={{ borderColor: 'var(--color-line)' }}
                  />
                  <select
                    value={novaClasse} onChange={(e) => setNovaClasse(e.target.value)}
                    className="rounded-md border px-2 py-1.5 text-xs bg-white" style={{ borderColor: 'var(--color-line)' }}
                  >
                    <option value="">Classe —</option>
                    <option value="A">Classe A</option>
                    <option value="B">Classe B</option>
                    <option value="C">Classe C</option>
                  </select>
                  <input
                    type="date"
                    value={novaPrevisao} onChange={(e) => setNovaPrevisao(e.target.value)}
                    className="rounded-md border px-2 py-1.5 text-xs bg-white" style={{ borderColor: 'var(--color-line)' }}
                  />
                </div>
              )}

              <div className="flex justify-end mt-2">
                <button
                  type="submit"
                  disabled={adicionarHistorico.isPending || !anotacao.trim()}
                  className="text-sm rounded-md px-3 py-1.5 font-medium text-white disabled:opacity-60"
                  style={{ backgroundColor: 'var(--color-petrol-600)' }}
                >
                  Registrar
                </button>
              </div>
            </form>

            <h3 className="text-sm font-medium text-ink mb-3">Linha do tempo — checkpoints</h3>

            <div className="relative">
              {oportunidade.historico?.map((item, i) => {
                const ehUltimo = i === (oportunidade.historico?.length ?? 0) - 1;
                const cor = item.estagioNoMomento ? COR_ESTAGIO[item.estagioNoMomento] ?? 'var(--color-ink-soft)' : 'var(--color-ink-soft)';
                return (
                  <div key={item.id} className="relative pl-6 pb-5">
                    {!ehUltimo && (
                      <div className="absolute left-[5px] top-3 bottom-0 w-px" style={{ backgroundColor: 'var(--color-line)' }} />
                    )}
                    <div
                      className="absolute left-0 top-1 h-3 w-3 rounded-full border-2 border-white"
                      style={{ backgroundColor: cor, boxShadow: '0 0 0 1px ' + cor }}
                    />
                    <div className="flex items-center gap-2 flex-wrap">
                      {item.estagioNoMomento && (
                        <span
                          className="text-[10px] font-semibold uppercase tracking-wide rounded-full px-2 py-0.5"
                          style={{ backgroundColor: 'color-mix(in srgb, ' + cor + ' 15%, white)', color: cor }}
                        >
                          {item.estagioNoMomento}
                        </span>
                      )}
                      <p className="text-xs" style={{ color: 'var(--color-ink-soft)' }}>{formatarData(item.criadoEm)}</p>
                    </div>
                    <p className="text-sm text-ink mt-1">{item.anotacao}</p>
                    {(item.valor !== null || item.confiabilidade !== null) && (
                      <p className="text-xs mt-1" style={{ color: 'var(--color-ink-soft)' }}>
                        {item.valor !== null && formatarMoeda(item.valor)}
                        {item.confiabilidade !== null && ` · ${item.confiabilidade}% confiança`}
                        {item.classificacao && ` · Classe ${item.classificacao}`}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
