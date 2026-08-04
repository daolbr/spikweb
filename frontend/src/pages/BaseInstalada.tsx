import { useState, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';
import type { BaseInstaladaItem, FunilAgrupado, ListaEmpresas } from '../api/types';

function formatarMoeda(valor: number | string | null) {
  if (valor === null) return '—';
  return Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatarData(data: string | null) {
  if (!data) return '—';
  return new Date(data + 'T00:00:00').toLocaleDateString('pt-BR');
}

function diasParaRenovacao(data: string | null) {
  if (!data) return null;
  return Math.ceil((new Date(data + 'T00:00:00').getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

export default function BaseInstalada() {
  const queryClient = useQueryClient();
  const [mostrarForm, setMostrarForm] = useState(false);
  const [empresaSelecionada, setEmpresaSelecionada] = useState('');

  const { data: itens, isLoading } = useQuery<BaseInstaladaItem[]>({
    queryKey: ['base-instalada'],
    queryFn: async () => {
      const { data } = await api.get('/base-instalada');
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

  const { data: funilOportunidades } = useQuery<FunilAgrupado>({
    queryKey: ['oportunidades', 'funil'],
    queryFn: async () => {
      const { data } = await api.get('/oportunidades/funil');
      return data;
    },
    enabled: mostrarForm,
  });

  const oportunidadesDaEmpresa = empresaSelecionada && funilOportunidades
    ? Object.values(funilOportunidades).flat().filter((o) => o.empresaId === empresaSelecionada)
    : [];

  const criar = useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      const { data } = await api.post('/base-instalada', payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['base-instalada'] });
      setMostrarForm(false);
      setEmpresaSelecionada('');
    },
    onError: (err: any) => alert(err?.response?.data?.message ?? 'Não foi possível criar o item.'),
  });

  const remover = useMutation({
    mutationFn: async (id: string) => api.delete(`/base-instalada/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['base-instalada'] }),
  });

  const gerarRenovacoes = useMutation({
    mutationFn: async () => {
      const { data } = await api.post('/automacoes/gerar-renovacoes');
      return data;
    },
    onSuccess: (data: { geradas: number }) => {
      queryClient.invalidateQueries({ queryKey: ['base-instalada'] });
      alert(
        data.geradas > 0
          ? `${data.geradas} oportunidade${data.geradas === 1 ? '' : 's'} de renovação gerada${data.geradas === 1 ? '' : 's'}.`
          : 'Nenhuma renovação pendente no momento.',
      );
    },
  });

  function aoSubmeter(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const payload: Record<string, unknown> = {
      produtoServico: String(form.get('produtoServico') ?? '').trim(),
      empresaId: String(form.get('empresaId') ?? ''),
      dataVenda: String(form.get('dataVenda') ?? ''),
    };
    const dataRenovacao = String(form.get('dataRenovacao') ?? '');
    const oportunidadeId = String(form.get('oportunidadeId') ?? '');
    const valor = String(form.get('valor') ?? '');
    const observacoes = String(form.get('observacoes') ?? '').trim();
    if (dataRenovacao) payload.dataRenovacao = dataRenovacao;
    if (oportunidadeId) payload.oportunidadeId = oportunidadeId;
    if (valor) payload.valor = Number(valor);
    if (observacoes) payload.observacoes = observacoes;
    if (payload.produtoServico && payload.empresaId && payload.dataVenda) criar.mutate(payload);
  }

  return (
    <div className="p-8 max-w-4xl">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)' }} className="text-2xl font-semibold text-ink">
            Base instalada
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-ink-soft)' }}>
            Produtos e serviços vendidos aos clientes, com datas de renovação
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => gerarRenovacoes.mutate()}
            disabled={gerarRenovacoes.isPending}
            className="rounded-md px-4 py-2 text-sm font-medium border disabled:opacity-60"
            style={{ borderColor: 'var(--color-line)', color: 'var(--color-petrol-600)' }}
          >
            {gerarRenovacoes.isPending ? 'Gerando…' : 'Gerar renovações agora'}
          </button>
          <button
            onClick={() => setMostrarForm(true)}
            className="rounded-md px-4 py-2 text-sm font-medium text-white"
            style={{ backgroundColor: 'var(--color-petrol-600)' }}
          >
            Novo item
          </button>
        </div>
      </div>

      <div className="bg-white border rounded-lg overflow-hidden" style={{ borderColor: 'var(--color-line)' }}>
        {isLoading ? (
          <p className="p-6 text-sm" style={{ color: 'var(--color-ink-soft)' }}>Carregando…</p>
        ) : itens?.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-sm font-medium text-ink">Nenhum item cadastrado ainda</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left" style={{ borderColor: 'var(--color-line)' }}>
                <th className="px-4 py-3 font-medium" style={{ color: 'var(--color-ink-soft)' }}>Produto/Serviço</th>
                <th className="px-4 py-3 font-medium" style={{ color: 'var(--color-ink-soft)' }}>Empresa</th>
                <th className="px-4 py-3 font-medium" style={{ color: 'var(--color-ink-soft)' }}>Venda</th>
                <th className="px-4 py-3 font-medium" style={{ color: 'var(--color-ink-soft)' }}>Renovação</th>
                <th className="px-4 py-3 font-medium text-right" style={{ color: 'var(--color-ink-soft)' }}>Valor</th>
                <th className="px-4 py-3 font-medium" style={{ color: 'var(--color-ink-soft)' }}>Origem</th>
                <th className="w-8"></th>
              </tr>
            </thead>
            <tbody>
              {itens?.map((item) => {
                const dias = diasParaRenovacao(item.dataRenovacao);
                return (
                  <tr key={item.id} className="border-b last:border-0" style={{ borderColor: 'var(--color-line)' }}>
                    <td className="px-4 py-3 font-medium text-ink">{item.produtoServico}</td>
                    <td className="px-4 py-3" style={{ color: 'var(--color-ink-soft)' }}>{item.empresa?.nome}</td>
                    <td className="px-4 py-3" style={{ color: 'var(--color-ink-soft)' }}>{formatarData(item.dataVenda)}</td>
                    <td className="px-4 py-3">
                      <span style={{ color: dias !== null && dias <= 30 && dias >= 0 ? 'var(--color-clay-700)' : 'var(--color-ink-soft)' }}>
                        {formatarData(item.dataRenovacao)}
                      </span>
                      {dias !== null && dias <= 30 && dias >= 0 && (
                        <span className="text-xs ml-1" style={{ color: 'var(--color-clay-700)' }}>({dias}d)</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right text-ink">{formatarMoeda(item.valor)}</td>
                    <td className="px-4 py-3 text-xs" style={{ color: 'var(--color-ink-soft)' }}>
                      {item.oportunidade?.titulo ?? '—'}
                    </td>
                    <td className="px-2 py-3 text-right">
                      <button onClick={() => remover.mutate(item.id)} className="text-xs" style={{ color: 'var(--color-clay-700)' }}>
                        remover
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {mostrarForm && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-40 overflow-y-auto py-8" onClick={() => setMostrarForm(false)}>
          <form
            onClick={(e) => e.stopPropagation()}
            onSubmit={aoSubmeter}
            className="bg-white rounded-lg border p-5 w-full max-w-md space-y-3"
            style={{ borderColor: 'var(--color-line)' }}
          >
            <h2 style={{ fontFamily: 'var(--font-display)' }} className="text-lg font-semibold text-ink mb-1">
              Novo item de base instalada
            </h2>
            <div>
              <label className="block text-xs font-medium text-ink mb-1">Produto/Serviço</label>
              <input name="produtoServico" required autoFocus placeholder="Ex.: Licença CRM Pro" className="w-full rounded-md border px-3 py-2 text-sm" style={{ borderColor: 'var(--color-line)' }} />
            </div>
            <div>
              <label className="block text-xs font-medium text-ink mb-1">Empresa</label>
              <select
                name="empresaId"
                required
                value={empresaSelecionada}
                onChange={(e) => setEmpresaSelecionada(e.target.value)}
                className="w-full rounded-md border px-3 py-2 text-sm"
                style={{ borderColor: 'var(--color-line)' }}
              >
                <option value="">Selecione…</option>
                {empresas?.dados.map((empresa) => (
                  <option key={empresa.id} value={empresa.id}>{empresa.nome}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-ink mb-1">Oportunidade de origem (opcional)</label>
              <select name="oportunidadeId" className="w-full rounded-md border px-3 py-2 text-sm" style={{ borderColor: 'var(--color-line)' }}>
                <option value="">—</option>
                {oportunidadesDaEmpresa.map((o) => (
                  <option key={o.id} value={o.id}>{o.titulo}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-ink mb-1">Data da venda</label>
                <input name="dataVenda" type="date" required className="w-full rounded-md border px-3 py-2 text-sm" style={{ borderColor: 'var(--color-line)' }} />
              </div>
              <div>
                <label className="block text-xs font-medium text-ink mb-1">Data de renovação</label>
                <input name="dataRenovacao" type="date" className="w-full rounded-md border px-3 py-2 text-sm" style={{ borderColor: 'var(--color-line)' }} />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-ink mb-1">Valor (R$)</label>
              <input name="valor" type="number" min="0" step="0.01" className="w-full rounded-md border px-3 py-2 text-sm" style={{ borderColor: 'var(--color-line)' }} />
            </div>
            <div>
              <label className="block text-xs font-medium text-ink mb-1">Observações</label>
              <textarea name="observacoes" rows={2} className="w-full rounded-md border px-3 py-2 text-sm resize-none" style={{ borderColor: 'var(--color-line)' }} />
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
