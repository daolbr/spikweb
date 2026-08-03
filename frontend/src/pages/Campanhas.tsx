import { useState, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';
import type { Campanha, StatusCampanha } from '../api/types';

const ROTULO_STATUS: Record<StatusCampanha, string> = {
  PLANEJADA: 'Planejada',
  EM_ANDAMENTO: 'Em andamento',
  CONCLUIDA: 'Concluída',
  CANCELADA: 'Cancelada',
};

function formatarMoeda(valor: number | string | null) {
  if (valor === null) return '—';
  return Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default function Campanhas() {
  const queryClient = useQueryClient();
  const [mostrarForm, setMostrarForm] = useState(false);

  const { data: campanhas, isLoading } = useQuery<Campanha[]>({
    queryKey: ['campanhas'],
    queryFn: async () => {
      const { data } = await api.get('/campanhas');
      return data;
    },
  });

  const criar = useMutation({
    mutationFn: async (payload: { nome: string; orcamento?: number }) => {
      const { data } = await api.post('/campanhas', payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campanhas'] });
      setMostrarForm(false);
    },
  });

  const mudarStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: StatusCampanha }) =>
      api.patch(`/campanhas/${id}/status`, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['campanhas'] }),
  });

  function aoSubmeter(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const nome = String(form.get('nome') ?? '').trim();
    const orcamentoStr = String(form.get('orcamento') ?? '');
    if (nome) criar.mutate({ nome, orcamento: orcamentoStr ? Number(orcamentoStr) : undefined });
  }

  return (
    <div className="p-8 max-w-4xl">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)' }} className="text-2xl font-semibold text-ink">
            Campanhas
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-ink-soft)' }}>
            Ações de marketing e prospecção
          </p>
        </div>
        <button
          onClick={() => setMostrarForm(true)}
          className="rounded-md px-4 py-2 text-sm font-medium text-white"
          style={{ backgroundColor: 'var(--color-petrol-600)' }}
        >
          Nova campanha
        </button>
      </div>

      <div className="bg-white border rounded-lg overflow-hidden" style={{ borderColor: 'var(--color-line)' }}>
        {isLoading ? (
          <p className="p-6 text-sm" style={{ color: 'var(--color-ink-soft)' }}>Carregando…</p>
        ) : campanhas?.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-sm font-medium text-ink">Nenhuma campanha ainda</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left" style={{ borderColor: 'var(--color-line)' }}>
                <th className="px-4 py-3 font-medium" style={{ color: 'var(--color-ink-soft)' }}>Nome</th>
                <th className="px-4 py-3 font-medium" style={{ color: 'var(--color-ink-soft)' }}>Status</th>
                <th className="px-4 py-3 font-medium text-right" style={{ color: 'var(--color-ink-soft)' }}>Orçamento</th>
              </tr>
            </thead>
            <tbody>
              {campanhas?.map((campanha) => (
                <tr key={campanha.id} className="border-b last:border-0" style={{ borderColor: 'var(--color-line)' }}>
                  <td className="px-4 py-3 font-medium text-ink">{campanha.nome}</td>
                  <td className="px-4 py-3">
                    <select
                      value={campanha.status}
                      onChange={(e) => mudarStatus.mutate({ id: campanha.id, status: e.target.value as StatusCampanha })}
                      className="text-xs rounded-md border px-2 py-1"
                      style={{ borderColor: 'var(--color-line)' }}
                    >
                      {Object.entries(ROTULO_STATUS).map(([valor, rotulo]) => (
                        <option key={valor} value={valor}>{rotulo}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-right" style={{ color: 'var(--color-ink-soft)' }}>{formatarMoeda(campanha.orcamento)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {mostrarForm && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-40" onClick={() => setMostrarForm(false)}>
          <form
            onClick={(e) => e.stopPropagation()}
            onSubmit={aoSubmeter}
            className="bg-white rounded-lg border p-5 w-full max-w-sm space-y-3"
            style={{ borderColor: 'var(--color-line)' }}
          >
            <h2 style={{ fontFamily: 'var(--font-display)' }} className="text-lg font-semibold text-ink mb-1">
              Nova campanha
            </h2>
            <div>
              <label className="block text-xs font-medium text-ink mb-1">Nome</label>
              <input name="nome" required autoFocus className="w-full rounded-md border px-3 py-2 text-sm" style={{ borderColor: 'var(--color-line)' }} />
            </div>
            <div>
              <label className="block text-xs font-medium text-ink mb-1">Orçamento (R$)</label>
              <input name="orcamento" type="number" min="0" step="0.01" className="w-full rounded-md border px-3 py-2 text-sm" style={{ borderColor: 'var(--color-line)' }} />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setMostrarForm(false)} className="text-sm rounded-md px-3 py-1.5 border" style={{ borderColor: 'var(--color-line)' }}>
                Cancelar
              </button>
              <button type="submit" disabled={criar.isPending} className="text-sm rounded-md px-3 py-1.5 font-medium text-white disabled:opacity-60" style={{ backgroundColor: 'var(--color-petrol-600)' }}>
                {criar.isPending ? 'Criando…' : 'Criar'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
