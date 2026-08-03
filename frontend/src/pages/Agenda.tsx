import { useState, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';
import type { Atividade, ListaEmpresas, TipoAtividade } from '../api/types';

const ROTULOS_TIPO: Record<TipoAtividade, string> = {
  LIGACAO: 'Ligação',
  REUNIAO: 'Reunião',
  EMAIL: 'E-mail',
  VISITA: 'Visita',
  TAREFA: 'Tarefa',
};

const FILTROS = ['PENDENTE', 'CONCLUIDA', 'TODAS'] as const;
type Filtro = (typeof FILTROS)[number];
const ROTULO_FILTRO: Record<Filtro, string> = {
  PENDENTE: 'Pendentes',
  CONCLUIDA: 'Concluídas',
  TODAS: 'Todas',
};

function chaveDoDia(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' });
}

function formatarHora(iso: string) {
  return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

export default function Agenda() {
  const queryClient = useQueryClient();
  const [filtro, setFiltro] = useState<Filtro>('PENDENTE');
  const [mostrarForm, setMostrarForm] = useState(false);

  const { data: atividades, isLoading } = useQuery<Atividade[]>({
    queryKey: ['atividades'],
    queryFn: async () => {
      const { data } = await api.get('/atividades');
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

  const concluir = useMutation({
    mutationFn: async (id: string) => api.patch(`/atividades/${id}/concluir`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['atividades'] }),
  });

  const criar = useMutation({
    mutationFn: async (payload: {
      titulo: string;
      tipo: TipoAtividade;
      empresaId: string;
      dataInicio: string;
    }) => {
      const { data } = await api.post('/atividades', payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['atividades'] });
      setMostrarForm(false);
    },
  });

  function aoSubmeter(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const titulo = String(form.get('titulo') ?? '').trim();
    const empresaId = String(form.get('empresaId') ?? '');
    const tipo = String(form.get('tipo') ?? 'TAREFA') as TipoAtividade;
    const data = String(form.get('data') ?? '');
    const hora = String(form.get('hora') ?? '09:00');
    if (titulo && empresaId && data) {
      criar.mutate({ titulo, tipo, empresaId, dataInicio: `${data}T${hora}:00` });
    }
  }

  const filtradas = (atividades ?? []).filter((a) => filtro === 'TODAS' || a.status === filtro);
  const grupos = filtradas.reduce<Record<string, Atividade[]>>((acc, a) => {
    const chave = chaveDoDia(a.dataInicio);
    (acc[chave] ??= []).push(a);
    return acc;
  }, {});

  return (
    <div className="p-8 max-w-3xl">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)' }} className="text-2xl font-semibold text-ink">
            Agenda
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-ink-soft)' }}>
            Atividades e tarefas com clientes
          </p>
        </div>
        <button
          onClick={() => setMostrarForm(true)}
          className="rounded-md px-4 py-2 text-sm font-medium text-white"
          style={{ backgroundColor: 'var(--color-petrol-600)' }}
        >
          Nova atividade
        </button>
      </div>

      <div className="flex gap-1 mb-5">
        {FILTROS.map((f) => (
          <button
            key={f}
            onClick={() => setFiltro(f)}
            className="text-sm rounded-md px-3 py-1.5 font-medium transition"
            style={{
              backgroundColor: filtro === f ? 'var(--color-petrol-600)' : 'transparent',
              color: filtro === f ? 'white' : 'var(--color-ink-soft)',
            }}
          >
            {ROTULO_FILTRO[f]}
          </button>
        ))}
      </div>

      {isLoading ? (
        <p className="text-sm" style={{ color: 'var(--color-ink-soft)' }}>Carregando…</p>
      ) : Object.keys(grupos).length === 0 ? (
        <div className="bg-white border rounded-lg p-10 text-center" style={{ borderColor: 'var(--color-line)' }}>
          <p className="text-sm font-medium text-ink">Nenhuma atividade por aqui</p>
          <p className="text-sm mt-1" style={{ color: 'var(--color-ink-soft)' }}>
            Crie a primeira atividade para começar a organizar sua agenda.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grupos).map(([dia, itens]) => (
            <div key={dia}>
              <h3 className="text-xs font-medium uppercase tracking-wide mb-2" style={{ color: 'var(--color-ink-soft)' }}>
                {dia}
              </h3>
              <div className="bg-white border rounded-lg divide-y" style={{ borderColor: 'var(--color-line)' }}>
                {itens.map((atividade) => (
                  <div key={atividade.id} className="flex items-center gap-3 px-4 py-3" style={{ borderColor: 'var(--color-line)' }}>
                    <input
                      type="checkbox"
                      checked={atividade.status === 'CONCLUIDA'}
                      disabled={atividade.status !== 'PENDENTE' || concluir.isPending}
                      onChange={() => concluir.mutate(atividade.id)}
                      className="h-4 w-4 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-sm font-medium text-ink"
                        style={atividade.status === 'CONCLUIDA' ? { textDecoration: 'line-through', color: 'var(--color-ink-soft)' } : undefined}
                      >
                        {atividade.titulo}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--color-ink-soft)' }}>
                        {atividade.empresa?.nome}
                      </p>
                    </div>
                    <span
                      className="text-xs rounded-full px-2 py-0.5 shrink-0"
                      style={{ backgroundColor: 'var(--color-petrol-50)', color: 'var(--color-petrol-600)' }}
                    >
                      {ROTULOS_TIPO[atividade.tipo]}
                    </span>
                    <span className="text-xs shrink-0 w-12 text-right" style={{ color: 'var(--color-ink-soft)' }}>
                      {formatarHora(atividade.dataInicio)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {mostrarForm && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-40" onClick={() => setMostrarForm(false)}>
          <form
            onClick={(e) => e.stopPropagation()}
            onSubmit={aoSubmeter}
            className="bg-white rounded-lg border p-5 w-full max-w-sm space-y-3"
            style={{ borderColor: 'var(--color-line)' }}
          >
            <h2 style={{ fontFamily: 'var(--font-display)' }} className="text-lg font-semibold text-ink mb-1">
              Nova atividade
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
            <div>
              <label className="block text-xs font-medium text-ink mb-1">Tipo</label>
              <select name="tipo" className="w-full rounded-md border px-3 py-2 text-sm" style={{ borderColor: 'var(--color-line)' }}>
                {Object.entries(ROTULOS_TIPO).map(([valor, rotulo]) => (
                  <option key={valor} value={valor}>{rotulo}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-ink mb-1">Data</label>
                <input name="data" type="date" required className="w-full rounded-md border px-3 py-2 text-sm" style={{ borderColor: 'var(--color-line)' }} />
              </div>
              <div>
                <label className="block text-xs font-medium text-ink mb-1">Hora</label>
                <input name="hora" type="time" defaultValue="09:00" className="w-full rounded-md border px-3 py-2 text-sm" style={{ borderColor: 'var(--color-line)' }} />
              </div>
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
