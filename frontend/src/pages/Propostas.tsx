import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';
import type { ListaEmpresas, Proposta, StatusProposta } from '../api/types';

const ROTULO_STATUS: Record<StatusProposta, string> = {
  RASCUNHO: 'Rascunho',
  ENVIADA: 'Enviada',
  APROVADA: 'Aprovada',
  RECUSADA: 'Recusada',
};

const COR_STATUS: Record<StatusProposta, string> = {
  RASCUNHO: 'var(--color-ink-soft)',
  ENVIADA: 'var(--color-petrol-400)',
  APROVADA: '#3B8054',
  RECUSADA: 'var(--color-clay-700)',
};

function formatarMoeda(valor: number | string) {
  return Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default function Propostas() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [mostrarForm, setMostrarForm] = useState(false);

  const { data: propostas, isLoading } = useQuery<Proposta[]>({
    queryKey: ['propostas'],
    queryFn: async () => {
      const { data } = await api.get('/propostas');
      return data;
    },
  });

  const { data: empresas } = useQuery<ListaEmpresas>({
    queryKey: ['empresas', 'seletor'],
    queryFn: async () => {
      const { data } = await api.get('/empresas', { params: { tamanhoPagina: 100 } });
      return data;
    },
    enabled: mostrarForm,
  });

  const criar = useMutation({
    mutationFn: async (payload: { titulo: string; empresaId: string }) => {
      const { data } = await api.post('/propostas', payload);
      return data;
    },
    onSuccess: (proposta) => {
      queryClient.invalidateQueries({ queryKey: ['propostas'] });
      navigate(`/propostas/${proposta.id}`);
    },
  });

  function aoSubmeter(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const titulo = String(form.get('titulo') ?? '').trim();
    const empresaId = String(form.get('empresaId') ?? '');
    if (titulo && empresaId) criar.mutate({ titulo, empresaId });
  }

  return (
    <div className="p-8 max-w-4xl">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)' }} className="text-2xl font-semibold text-ink">
            Propostas
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-ink-soft)' }}>
            {propostas ? `${propostas.length} proposta${propostas.length === 1 ? '' : 's'}` : ' '}
          </p>
        </div>
        <button
          onClick={() => setMostrarForm(true)}
          className="rounded-md px-4 py-2 text-sm font-medium text-white"
          style={{ backgroundColor: 'var(--color-petrol-600)' }}
        >
          Nova proposta
        </button>
      </div>

      <div className="bg-white border rounded-lg overflow-hidden" style={{ borderColor: 'var(--color-line)' }}>
        {isLoading ? (
          <p className="p-6 text-sm" style={{ color: 'var(--color-ink-soft)' }}>Carregando…</p>
        ) : propostas?.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-sm font-medium text-ink">Nenhuma proposta ainda</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left" style={{ borderColor: 'var(--color-line)' }}>
                <th className="px-4 py-3 font-medium" style={{ color: 'var(--color-ink-soft)' }}>Título</th>
                <th className="px-4 py-3 font-medium" style={{ color: 'var(--color-ink-soft)' }}>Empresa</th>
                <th className="px-4 py-3 font-medium" style={{ color: 'var(--color-ink-soft)' }}>Status</th>
                <th className="px-4 py-3 font-medium text-right" style={{ color: 'var(--color-ink-soft)' }}>Valor</th>
              </tr>
            </thead>
            <tbody>
              {propostas?.map((proposta) => (
                <tr
                  key={proposta.id}
                  onClick={() => navigate(`/propostas/${proposta.id}`)}
                  className="border-b last:border-0 cursor-pointer hover:bg-black/[0.02] transition"
                  style={{ borderColor: 'var(--color-line)' }}
                >
                  <td className="px-4 py-3 font-medium text-ink">{proposta.titulo}</td>
                  <td className="px-4 py-3" style={{ color: 'var(--color-ink-soft)' }}>{proposta.empresa?.nome}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-medium" style={{ color: COR_STATUS[proposta.status] }}>
                      {ROTULO_STATUS[proposta.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-ink">{formatarMoeda(proposta.valorTotal)}</td>
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
              Nova proposta
            </h2>
            <div>
              <label className="block text-xs font-medium text-ink mb-1">Título</label>
              <input name="titulo" required autoFocus className="w-full rounded-md border px-3 py-2 text-sm" style={{ borderColor: 'var(--color-line)' }} />
            </div>
            <div>
              <label className="block text-xs font-medium text-ink mb-1">Empresa</label>
              <select name="empresaId" required className="w-full rounded-md border px-3 py-2 text-sm" style={{ borderColor: 'var(--color-line)' }}>
                <option value="">Selecione…</option>
                {empresas?.dados.map((empresa) => (
                  <option key={empresa.id} value={empresa.id}>{empresa.nome}</option>
                ))}
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setMostrarForm(false)} className="text-sm rounded-md px-3 py-1.5 border" style={{ borderColor: 'var(--color-line)' }}>
                Cancelar
              </button>
              <button
                type="submit"
                disabled={criar.isPending}
                className="text-sm rounded-md px-3 py-1.5 font-medium text-white disabled:opacity-60"
                style={{ backgroundColor: 'var(--color-petrol-600)' }}
              >
                {criar.isPending ? 'Criando…' : 'Criar'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
