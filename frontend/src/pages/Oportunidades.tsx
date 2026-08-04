import { useState, type DragEvent, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';
import type { EstagioFunil, FunilAgrupado, ListaEmpresas, QuadroTotais, UsuarioResumo } from '../api/types';
import OportunidadeDrawer from '../components/OportunidadeDrawer';

const COLUNAS: { estagio: EstagioFunil; titulo: string; cor: string }[] = [
  { estagio: 'PROSPECCAO', titulo: 'Prospecção', cor: 'var(--color-ink-soft)' },
  { estagio: 'QUALIFICACAO', titulo: 'Qualificação', cor: 'var(--color-petrol-400)' },
  { estagio: 'PROPOSTA', titulo: 'Proposta', cor: 'var(--color-petrol-600)' },
  { estagio: 'NEGOCIACAO', titulo: 'Negociação', cor: 'var(--color-clay-500)' },
  { estagio: 'GANHA', titulo: 'Ganha', cor: '#3B8054' },
  { estagio: 'PERDIDA', titulo: 'Perdida', cor: 'var(--color-clay-700)' },
];

const COR_CLASSE: Record<string, string> = { A: '#3B8054', B: 'var(--color-clay-500)', C: 'var(--color-ink-soft)' };

function formatarMoeda(valor: number | string) {
  return Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
}

function diasNoEstagio(atualizadoEm: string) {
  return Math.floor((Date.now() - new Date(atualizadoEm).getTime()) / (1000 * 60 * 60 * 24));
}

const ROTULO_ESTAGIO: Record<EstagioFunil, string> = {
  PROSPECCAO: 'Prospecção',
  QUALIFICACAO: 'Qualificação',
  PROPOSTA: 'Proposta',
  NEGOCIACAO: 'Negociação',
  GANHA: 'Ganha',
  PERDIDA: 'Perdida',
};

const COR_ESTAGIO: Record<EstagioFunil, string> = {
  PROSPECCAO: 'var(--color-ink-soft)',
  QUALIFICACAO: 'var(--color-petrol-400)',
  PROPOSTA: 'var(--color-petrol-600)',
  NEGOCIACAO: 'var(--color-clay-500)',
  GANHA: '#3B8054',
  PERDIDA: 'var(--color-clay-700)',
};

function BadgeClasse({ classe }: { classe: string | null }) {
  if (!classe) return null;
  const cor = COR_CLASSE[classe] ?? 'var(--color-ink-soft)';
  return (
    <span
      className="text-[10px] font-bold rounded px-1.5 py-0.5 shrink-0"
      style={{ backgroundColor: 'color-mix(in srgb, ' + cor + ' 18%, white)', color: cor }}
      title={`Classificação ${classe}`}
    >
      {classe}
    </span>
  );
}

export default function Oportunidades() {
  const queryClient = useQueryClient();
  const [oportunidadeArrastada, setOportunidadeArrastada] = useState<string | null>(null);
  const [colunaAlvo, setColunaAlvo] = useState<EstagioFunil | null>(null);
  const [detalheId, setDetalheId] = useState<string | null>(null);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [visualizacao, setVisualizacao] = useState<'kanban' | 'lista'>('kanban');

  const { data: funil, isLoading } = useQuery<FunilAgrupado>({
    queryKey: ['oportunidades', 'funil'],
    queryFn: async () => {
      const { data } = await api.get('/oportunidades/funil');
      return data;
    },
  });

  const { data: quadro } = useQuery<QuadroTotais>({
    queryKey: ['oportunidades', 'quadro-totais'],
    queryFn: async () => {
      const { data } = await api.get('/oportunidades/quadro-totais');
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

  const { data: usuarios } = useQuery<UsuarioResumo[]>({
    queryKey: ['usuarios'],
    queryFn: async () => {
      const { data } = await api.get('/usuarios');
      return data;
    },
    enabled: mostrarForm,
  });

  const mudarEstagio = useMutation({
    mutationFn: async ({ id, estagio }: { id: string; estagio: EstagioFunil }) => {
      const payload: { estagio: EstagioFunil; motivoPerda?: string } = { estagio };
      if (estagio === 'PERDIDA') {
        const motivo = window.prompt('Motivo da perda (obrigatório):');
        if (!motivo?.trim()) {
          throw new Error('CANCELADO_PELO_USUARIO');
        }
        payload.motivoPerda = motivo.trim();
      }
      const { data } = await api.patch(`/oportunidades/${id}/estagio`, payload);
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['oportunidades'] }),
    onError: (err: any) => {
      if (err?.message === 'CANCELADO_PELO_USUARIO') return;
      alert(err?.response?.data?.message ?? 'Não foi possível mudar o estágio.');
    },
  });

  const criarOportunidade = useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      const { data } = await api.post('/oportunidades', payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['oportunidades'] });
      setMostrarForm(false);
    },
    onError: (err: any) => alert(err?.response?.data?.message ?? 'Não foi possível criar a oportunidade.'),
  });

  function aoSoltar(estagio: EstagioFunil) {
    return (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setColunaAlvo(null);
      if (oportunidadeArrastada) {
        mudarEstagio.mutate({ id: oportunidadeArrastada, estagio });
      }
      setOportunidadeArrastada(null);
    };
  }

  function aoSubmeterForm(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const payload: Record<string, unknown> = {
      titulo: String(form.get('titulo') ?? '').trim(),
      empresaId: String(form.get('empresaId') ?? ''),
      valor: Number(form.get('valor') ?? 0),
    };
    const confiabilidade = String(form.get('confiabilidade') ?? '');
    const classificacao = String(form.get('classificacao') ?? '');
    const vendedorId = String(form.get('vendedorId') ?? '');
    const especialistaId = String(form.get('especialistaId') ?? '');
    const vertical = String(form.get('vertical') ?? '').trim();
    if (confiabilidade) payload.confiabilidade = Number(confiabilidade);
    if (classificacao) payload.classificacao = classificacao;
    if (vendedorId) payload.vendedorId = vendedorId;
    if (especialistaId) payload.especialistaId = especialistaId;
    if (vertical) payload.vertical = vertical;
    if (payload.titulo && payload.empresaId) criarOportunidade.mutate(payload);
  }

  const ROTULO_CLASSE_CHAVE: { chave: 'A' | 'B' | 'C'; rotulo: string }[] = [
    { chave: 'A', rotulo: 'Classe A' },
    { chave: 'B', rotulo: 'Classe B' },
    { chave: 'C', rotulo: 'Classe C' },
  ];

  return (
    <div className="p-8 h-screen flex flex-col">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)' }} className="text-2xl font-semibold text-ink">
            Negócios
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-ink-soft)' }}>
            Arraste os cartões entre as colunas para mudar o estágio
          </p>
        </div>
        <button
          onClick={() => setMostrarForm(true)}
          className="rounded-md px-4 py-2 text-sm font-medium text-white"
          style={{ backgroundColor: 'var(--color-petrol-600)' }}
        >
          Nova oportunidade
        </button>
      </div>

      {quadro && (
        <div className="grid grid-cols-4 gap-3 mb-4">
          <div className="bg-white border rounded-lg p-3" style={{ borderColor: 'var(--color-line)' }}>
            <p className="text-xs font-medium" style={{ color: 'var(--color-ink-soft)' }}>Pipeline ativo</p>
            <p className="text-lg font-semibold" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-petrol-600)' }}>
              {formatarMoeda(quadro.geral.valorTotal)}
            </p>
            <p className="text-xs" style={{ color: 'var(--color-ink-soft)' }}>{quadro.geral.total} oportunidades</p>
          </div>
          {ROTULO_CLASSE_CHAVE.map(({ chave, rotulo }) => {
            const info = quadro.porClasse[chave];
            return (
              <div key={chave} className="bg-white border rounded-lg p-3" style={{ borderColor: 'var(--color-line)' }}>
                <p className="text-xs font-medium flex items-center gap-1.5" style={{ color: 'var(--color-ink-soft)' }}>
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: COR_CLASSE[chave] }} />
                  {rotulo}
                </p>
                <p className="text-lg font-semibold" style={{ fontFamily: 'var(--font-display)', color: COR_CLASSE[chave] }}>
                  {formatarMoeda(info.valorTotal)}
                </p>
                <p className="text-xs" style={{ color: 'var(--color-ink-soft)' }}>
                  {info.total} · confiança média {info.confiabilidadeMedia}%
                </p>
              </div>
            );
          })}
        </div>
      )}

      <div className="flex gap-1 mb-4">
        {(['kanban', 'lista'] as const).map((v) => (
          <button
            key={v}
            onClick={() => setVisualizacao(v)}
            className="text-sm rounded-md px-3 py-1.5 font-medium transition capitalize"
            style={{
              backgroundColor: visualizacao === v ? 'var(--color-petrol-600)' : 'transparent',
              color: visualizacao === v ? 'white' : 'var(--color-ink-soft)',
            }}
          >
            {v}
          </button>
        ))}
      </div>

      {isLoading ? (
        <p className="text-sm" style={{ color: 'var(--color-ink-soft)' }}>Carregando…</p>
      ) : visualizacao === 'lista' ? (
        <div className="bg-white border rounded-lg overflow-hidden flex-1 overflow-y-auto" style={{ borderColor: 'var(--color-line)' }}>
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-white">
              <tr className="border-b text-left" style={{ borderColor: 'var(--color-line)' }}>
                <th className="px-4 py-3 font-medium" style={{ color: 'var(--color-ink-soft)' }}>Título</th>
                <th className="px-4 py-3 font-medium" style={{ color: 'var(--color-ink-soft)' }}>Empresa</th>
                <th className="px-4 py-3 font-medium" style={{ color: 'var(--color-ink-soft)' }}>Vendedor</th>
                <th className="px-4 py-3 font-medium" style={{ color: 'var(--color-ink-soft)' }}>Estágio</th>
                <th className="px-4 py-3 font-medium text-right" style={{ color: 'var(--color-ink-soft)' }}>Confiança</th>
                <th className="px-4 py-3 font-medium text-right" style={{ color: 'var(--color-ink-soft)' }}>Valor</th>
                <th className="px-4 py-3 font-medium text-right" style={{ color: 'var(--color-ink-soft)' }}>Dias no estágio</th>
              </tr>
            </thead>
            <tbody>
              {COLUNAS.flatMap((coluna) => (funil?.[coluna.estagio] ?? []).map((o) => ({ ...o, _cor: coluna.cor })))
                .sort((a, b) => Number(b.valor) - Number(a.valor))
                .map((oportunidade) => {
                  const dias = diasNoEstagio(oportunidade.atualizadoEm);
                  return (
                    <tr
                      key={oportunidade.id}
                      onClick={() => setDetalheId(oportunidade.id)}
                      className="border-b last:border-0 cursor-pointer hover:bg-black/[0.02] transition"
                      style={{ borderColor: 'var(--color-line)' }}
                    >
                      <td className="px-4 py-3 font-medium text-ink">
                        <div className="flex items-center gap-1.5">
                          <BadgeClasse classe={oportunidade.classificacao} />
                          {oportunidade.titulo}
                        </div>
                      </td>
                      <td className="px-4 py-3" style={{ color: 'var(--color-ink-soft)' }}>{oportunidade.empresa?.nome}</td>
                      <td className="px-4 py-3" style={{ color: 'var(--color-ink-soft)' }}>{oportunidade.vendedor?.nome ?? '—'}</td>
                      <td className="px-4 py-3">
                        <span
                          className="text-xs font-medium rounded-full px-2 py-0.5"
                          style={{ backgroundColor: 'color-mix(in srgb, ' + COR_ESTAGIO[oportunidade.estagio] + ' 15%, white)', color: COR_ESTAGIO[oportunidade.estagio] }}
                        >
                          {ROTULO_ESTAGIO[oportunidade.estagio]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right" style={{ color: 'var(--color-ink-soft)' }}>
                        {oportunidade.confiabilidade !== null ? `${oportunidade.confiabilidade}%` : '—'}
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-ink">{formatarMoeda(oportunidade.valor)}</td>
                      <td
                        className="px-4 py-3 text-right"
                        style={{ color: dias > 14 && oportunidade.estagio !== 'GANHA' && oportunidade.estagio !== 'PERDIDA' ? 'var(--color-clay-700)' : 'var(--color-ink-soft)' }}
                      >
                        {dias}d
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex-1 min-h-0 flex gap-4 overflow-x-auto pb-4">
          {COLUNAS.map((coluna) => {
            const itens = funil?.[coluna.estagio] ?? [];
            const total = itens.reduce((soma, o) => soma + Number(o.valor), 0);
            return (
              <div
                key={coluna.estagio}
                onDragOver={(e) => {
                  e.preventDefault();
                  setColunaAlvo(coluna.estagio);
                }}
                onDragLeave={() => setColunaAlvo(null)}
                onDrop={aoSoltar(coluna.estagio)}
                className="w-64 shrink-0 flex flex-col rounded-lg border transition-colors"
                style={{
                  borderColor: colunaAlvo === coluna.estagio ? coluna.cor : 'var(--color-line)',
                  backgroundColor: colunaAlvo === coluna.estagio ? 'rgba(0,0,0,0.02)' : 'transparent',
                }}
              >
                <div className="px-3 py-3 border-b" style={{ borderColor: 'var(--color-line)' }}>
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: coluna.cor }} />
                    <span className="text-sm font-medium text-ink">{coluna.titulo}</span>
                    <span className="text-xs ml-auto" style={{ color: 'var(--color-ink-soft)' }}>
                      {itens.length}
                    </span>
                  </div>
                  {total > 0 && (
                    <p className="text-xs mt-1" style={{ color: 'var(--color-ink-soft)' }}>
                      {formatarMoeda(total)}
                    </p>
                  )}
                </div>

                <div className="flex-1 overflow-y-auto p-2 space-y-2 min-h-[100px]">
                  {itens.map((oportunidade) => (
                    <div
                      key={oportunidade.id}
                      draggable
                      onDragStart={() => setOportunidadeArrastada(oportunidade.id)}
                      onClick={() => setDetalheId(oportunidade.id)}
                      className="bg-white border rounded-md p-3 cursor-pointer hover:shadow-sm transition"
                      style={{ borderColor: 'var(--color-line)' }}
                    >
                      <div className="flex items-start gap-1.5">
                        <BadgeClasse classe={oportunidade.classificacao} />
                        <p className="text-sm font-medium text-ink leading-snug flex-1">{oportunidade.titulo}</p>
                      </div>
                      <p className="text-xs mt-1" style={{ color: 'var(--color-ink-soft)' }}>
                        {oportunidade.empresa?.nome}
                      </p>
                      {oportunidade.vendedor && (
                        <p className="text-xs mt-0.5" style={{ color: 'var(--color-ink-soft)' }}>
                          👤 {oportunidade.vendedor.nome}
                        </p>
                      )}
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-xs font-medium" style={{ color: coluna.cor }}>
                          {formatarMoeda(oportunidade.valor)}
                        </p>
                        {oportunidade.confiabilidade !== null && (
                          <p className="text-xs" style={{ color: 'var(--color-ink-soft)' }}>
                            {oportunidade.confiabilidade}%
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {mostrarForm && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-40 overflow-y-auto py-8" onClick={() => setMostrarForm(false)}>
          <form
            onClick={(e) => e.stopPropagation()}
            onSubmit={aoSubmeterForm}
            className="bg-white rounded-lg border p-5 w-full max-w-md space-y-3"
            style={{ borderColor: 'var(--color-line)' }}
          >
            <h2 style={{ fontFamily: 'var(--font-display)' }} className="text-lg font-semibold text-ink mb-1">
              Nova oportunidade
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
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-ink mb-1">Valor estimado (R$)</label>
                <input name="valor" type="number" min="0" step="0.01" className="w-full rounded-md border px-3 py-2 text-sm" style={{ borderColor: 'var(--color-line)' }} />
              </div>
              <div>
                <label className="block text-xs font-medium text-ink mb-1">Confiança (%)</label>
                <input name="confiabilidade" type="number" min="0" max="100" placeholder="0-100" className="w-full rounded-md border px-3 py-2 text-sm" style={{ borderColor: 'var(--color-line)' }} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-ink mb-1">Classificação</label>
                <select name="classificacao" className="w-full rounded-md border px-3 py-2 text-sm" style={{ borderColor: 'var(--color-line)' }}>
                  <option value="">—</option>
                  <option value="A">Classe A</option>
                  <option value="B">Classe B</option>
                  <option value="C">Classe C</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-ink mb-1">Vertical</label>
                <input name="vertical" placeholder="Ex.: Varejo" className="w-full rounded-md border px-3 py-2 text-sm" style={{ borderColor: 'var(--color-line)' }} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-ink mb-1">Vendedor</label>
                <select name="vendedorId" className="w-full rounded-md border px-3 py-2 text-sm" style={{ borderColor: 'var(--color-line)' }}>
                  <option value="">—</option>
                  {usuarios?.map((u) => <option key={u.id} value={u.id}>{u.nome}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-ink mb-1">Especialista</label>
                <select name="especialistaId" className="w-full rounded-md border px-3 py-2 text-sm" style={{ borderColor: 'var(--color-line)' }}>
                  <option value="">—</option>
                  {usuarios?.map((u) => <option key={u.id} value={u.id}>{u.nome}</option>)}
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setMostrarForm(false)} className="text-sm rounded-md px-3 py-1.5 border" style={{ borderColor: 'var(--color-line)' }}>
                Cancelar
              </button>
              <button
                type="submit"
                disabled={criarOportunidade.isPending}
                className="text-sm rounded-md px-3 py-1.5 font-medium text-white disabled:opacity-60"
                style={{ backgroundColor: 'var(--color-petrol-600)' }}
              >
                {criarOportunidade.isPending ? 'Criando…' : 'Criar'}
              </button>
            </div>
          </form>
        </div>
      )}

      {detalheId && <OportunidadeDrawer id={detalheId} onFechar={() => setDetalheId(null)} />}
    </div>
  );
}
