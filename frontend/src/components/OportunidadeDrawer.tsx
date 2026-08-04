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

const COR_ESTAGIO: Record<string, string> = {
  PROSPECCAO: '#6B6960',
  QUALIFICACAO: '#4A8A76',
  PROPOSTA: '#2E7D67',
  NEGOCIACAO: 'var(--color-clay-500)',
  GANHA: '#3B8054',
  PERDIDA: 'var(--color-clay-700)',
};

export default function OportunidadeDrawer({ id, onFechar }: { id: string; onFechar: () => void }) {
  const queryClient = useQueryClient();
  const [anotacao, setAnotacao] = useState('');

  const { data: oportunidade, isLoading } = useQuery<Oportunidade>({
    queryKey: ['oportunidade', id],
    queryFn: async () => {
      const { data } = await api.get(`/oportunidades/${id}`);
      return data;
    },
  });

  const adicionarHistorico = useMutation({
    mutationFn: async (texto: string) => {
      const { data } = await api.post(`/oportunidades/${id}/historico`, { anotacao: texto });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['oportunidade', id] });
      setAnotacao('');
    },
  });

  function aoSubmeter(e: FormEvent) {
    e.preventDefault();
    if (anotacao.trim()) adicionarHistorico.mutate(anotacao.trim());
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

            <h2 style={{ fontFamily: 'var(--font-display)' }} className="text-xl font-semibold text-ink mb-1">
              {oportunidade.titulo}
            </h2>
            <p className="text-sm mb-4" style={{ color: 'var(--color-ink-soft)' }}>
              {oportunidade.empresa?.nome}
              {oportunidade.contato ? ` · ${oportunidade.contato.nome}` : ''}
            </p>

            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-black/[0.02] rounded-md p-3">
                <p className="text-xs" style={{ color: 'var(--color-ink-soft)' }}>Valor</p>
                <p className="text-sm font-medium text-ink">{formatarMoeda(oportunidade.valor)}</p>
              </div>
              <div className="bg-black/[0.02] rounded-md p-3">
                <p className="text-xs" style={{ color: 'var(--color-ink-soft)' }}>Estágio</p>
                <p className="text-sm font-medium text-ink">{oportunidade.estagio}</p>
              </div>
            </div>

            {oportunidade.motivoPerda && (
              <div className="rounded-md p-3 mb-6 text-sm" style={{ backgroundColor: 'var(--color-clay-100)', color: 'var(--color-clay-700)' }}>
                Motivo da perda: {oportunidade.motivoPerda}
              </div>
            )}

            <CamposCustomizadosPainel entidade="OPORTUNIDADE" entidadeId={oportunidade.id} />

            <h3 className="text-sm font-medium text-ink mb-2">Registrar acompanhamento</h3>

            <form onSubmit={aoSubmeter} className="mb-6">
              <textarea
                value={anotacao}
                onChange={(e) => setAnotacao(e.target.value)}
                placeholder="Registrar uma interação (ligação, reunião, e-mail…)"
                rows={2}
                className="w-full rounded-md border px-3 py-2 text-sm resize-none"
                style={{ borderColor: 'var(--color-line)' }}
              />
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
