import { useState, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';
import type { Proposta, StatusProposta } from '../api/types';

const ROTULO_STATUS: Record<StatusProposta, string> = {
  RASCUNHO: 'Rascunho',
  ENVIADA: 'Enviada',
  APROVADA: 'Aprovada',
  RECUSADA: 'Recusada',
};

function formatarMoeda(valor: number | string) {
  return Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default function PropostaDetalhe() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [mostrarFormItem, setMostrarFormItem] = useState(false);

  const { data: proposta, isLoading } = useQuery<Proposta>({
    queryKey: ['proposta', id],
    queryFn: async () => {
      const { data } = await api.get(`/propostas/${id}`);
      return data;
    },
  });

  const mudarStatus = useMutation({
    mutationFn: async (status: StatusProposta) => api.patch(`/propostas/${id}/status`, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['proposta', id] }),
  });

  const adicionarItem = useMutation({
    mutationFn: async (payload: { descricao: string; quantidade: number; valorUnitario: number }) => {
      const { data } = await api.post(`/propostas/${id}/itens`, payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proposta', id] });
      setMostrarFormItem(false);
    },
  });

  const removerItem = useMutation({
    mutationFn: async (itemId: string) => api.delete(`/propostas/${id}/itens/${itemId}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['proposta', id] }),
  });

  function aoSubmeterItem(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    adicionarItem.mutate({
      descricao: String(form.get('descricao') ?? ''),
      quantidade: Number(form.get('quantidade') ?? 1),
      valorUnitario: Number(form.get('valorUnitario') ?? 0),
    });
  }

  if (isLoading || !proposta) {
    return <div className="p-8"><p className="text-sm" style={{ color: 'var(--color-ink-soft)' }}>Carregando…</p></div>;
  }

  return (
    <div className="p-8 max-w-3xl">
      <button onClick={() => navigate('/propostas')} className="text-sm mb-4 hover:underline" style={{ color: 'var(--color-ink-soft)' }}>
        ← Propostas
      </button>

      <div className="flex items-start justify-between mb-2">
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)' }} className="text-2xl font-semibold text-ink">
            {proposta.titulo}
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-ink-soft)' }}>{proposta.empresa?.nome}</p>
        </div>
        <select
          value={proposta.status}
          onChange={(e) => mudarStatus.mutate(e.target.value as StatusProposta)}
          className="text-sm rounded-md border px-3 py-1.5 font-medium"
          style={{ borderColor: 'var(--color-line)' }}
        >
          {Object.entries(ROTULO_STATUS).map(([valor, rotulo]) => (
            <option key={valor} value={valor}>{rotulo}</option>
          ))}
        </select>
      </div>

      <div className="flex items-center justify-between mt-8 mb-3">
        <h2 style={{ fontFamily: 'var(--font-display)' }} className="text-lg font-semibold text-ink">
          Itens
        </h2>
        <button
          onClick={() => setMostrarFormItem((v) => !v)}
          className="text-sm rounded-md px-3 py-1.5 font-medium text-white"
          style={{ backgroundColor: 'var(--color-petrol-600)' }}
        >
          Adicionar item
        </button>
      </div>

      {mostrarFormItem && (
        <form onSubmit={aoSubmeterItem} className="bg-white border rounded-lg p-4 mb-4 grid grid-cols-4 gap-3 items-end" style={{ borderColor: 'var(--color-line)' }}>
          <div className="col-span-2">
            <label className="block text-xs font-medium text-ink mb-1">Descrição</label>
            <input name="descricao" required className="w-full rounded-md border px-3 py-2 text-sm" style={{ borderColor: 'var(--color-line)' }} />
          </div>
          <div>
            <label className="block text-xs font-medium text-ink mb-1">Qtd.</label>
            <input name="quantidade" type="number" min="0.01" step="0.01" defaultValue={1} required className="w-full rounded-md border px-3 py-2 text-sm" style={{ borderColor: 'var(--color-line)' }} />
          </div>
          <div>
            <label className="block text-xs font-medium text-ink mb-1">Valor unit. (R$)</label>
            <input name="valorUnitario" type="number" min="0" step="0.01" required className="w-full rounded-md border px-3 py-2 text-sm" style={{ borderColor: 'var(--color-line)' }} />
          </div>
          <div className="col-span-4 flex justify-end gap-2">
            <button type="button" onClick={() => setMostrarFormItem(false)} className="text-sm rounded-md px-3 py-1.5 border" style={{ borderColor: 'var(--color-line)' }}>
              Cancelar
            </button>
            <button type="submit" disabled={adicionarItem.isPending} className="text-sm rounded-md px-3 py-1.5 font-medium text-white disabled:opacity-60" style={{ backgroundColor: 'var(--color-petrol-600)' }}>
              {adicionarItem.isPending ? 'Salvando…' : 'Salvar item'}
            </button>
          </div>
        </form>
      )}

      <div className="bg-white border rounded-lg overflow-hidden" style={{ borderColor: 'var(--color-line)' }}>
        {proposta.itens?.length ? (
          <>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left" style={{ borderColor: 'var(--color-line)' }}>
                  <th className="px-4 py-2 font-medium" style={{ color: 'var(--color-ink-soft)' }}>Descrição</th>
                  <th className="px-4 py-2 font-medium text-right" style={{ color: 'var(--color-ink-soft)' }}>Qtd.</th>
                  <th className="px-4 py-2 font-medium text-right" style={{ color: 'var(--color-ink-soft)' }}>Unit.</th>
                  <th className="px-4 py-2 font-medium text-right" style={{ color: 'var(--color-ink-soft)' }}>Subtotal</th>
                  <th className="w-8"></th>
                </tr>
              </thead>
              <tbody>
                {proposta.itens.map((item) => (
                  <tr key={item.id} className="border-b last:border-0" style={{ borderColor: 'var(--color-line)' }}>
                    <td className="px-4 py-2 text-ink">{item.descricao}</td>
                    <td className="px-4 py-2 text-right" style={{ color: 'var(--color-ink-soft)' }}>{item.quantidade}</td>
                    <td className="px-4 py-2 text-right" style={{ color: 'var(--color-ink-soft)' }}>{formatarMoeda(item.valorUnitario)}</td>
                    <td className="px-4 py-2 text-right font-medium text-ink">
                      {formatarMoeda(Number(item.quantidade) * Number(item.valorUnitario))}
                    </td>
                    <td className="px-2 py-2 text-right">
                      <button
                        onClick={() => removerItem.mutate(item.id)}
                        className="text-xs"
                        style={{ color: 'var(--color-clay-700)' }}
                      >
                        remover
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex justify-end px-4 py-3 border-t" style={{ borderColor: 'var(--color-line)' }}>
              <p className="text-sm font-medium text-ink">
                Total: <span style={{ color: 'var(--color-petrol-600)' }}>{formatarMoeda(proposta.valorTotal)}</span>
              </p>
            </div>
          </>
        ) : (
          <div className="p-10 text-center">
            <p className="text-sm font-medium text-ink">Nenhum item adicionado</p>
          </div>
        )}
      </div>
    </div>
  );
}
