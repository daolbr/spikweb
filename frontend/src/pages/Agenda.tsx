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
  PROSPECCAO: 'Prospecção',
  FIDELIZACAO: 'Fidelização',
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

const DIAS_SEMANA = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];
const NOMES_MES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

function CalendarioMensal({
  atividades,
  onSelecionarDia,
}: {
  atividades: Atividade[];
  onSelecionarDia: (atividade: Atividade) => void;
}) {
  const [referencia, setReferencia] = useState(new Date());
  const ano = referencia.getFullYear();
  const mes = referencia.getMonth();

  const primeiroDiaSemana = new Date(ano, mes, 1).getDay();
  const diasNoMes = new Date(ano, mes + 1, 0).getDate();
  const hoje = new Date();
  const ehHoje = (dia: number) => hoje.getFullYear() === ano && hoje.getMonth() === mes && hoje.getDate() === dia;

  const porDia = new Map<number, Atividade[]>();
  for (const atividade of atividades) {
    const data = new Date(atividade.dataInicio);
    if (data.getFullYear() === ano && data.getMonth() === mes) {
      const dia = data.getDate();
      (porDia.get(dia) ?? porDia.set(dia, []).get(dia)!).push(atividade);
    }
  }

  const celulas: (number | null)[] = [
    ...Array(primeiroDiaSemana).fill(null),
    ...Array.from({ length: diasNoMes }, (_, i) => i + 1),
  ];

  return (
    <div className="bg-white border rounded-lg overflow-hidden" style={{ borderColor: 'var(--color-line)' }}>
      <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'var(--color-line)' }}>
        <button onClick={() => setReferencia(new Date(ano, mes - 1, 1))} className="text-sm px-2" style={{ color: 'var(--color-ink-soft)' }}>‹</button>
        <p className="text-sm font-medium text-ink">{NOMES_MES[mes]} {ano}</p>
        <button onClick={() => setReferencia(new Date(ano, mes + 1, 1))} className="text-sm px-2" style={{ color: 'var(--color-ink-soft)' }}>›</button>
      </div>
      <div className="grid grid-cols-7 text-center text-xs font-medium py-2" style={{ color: 'var(--color-ink-soft)' }}>
        {DIAS_SEMANA.map((d) => <div key={d}>{d}</div>)}
      </div>
      <div className="grid grid-cols-7 border-t" style={{ borderColor: 'var(--color-line)' }}>
        {celulas.map((dia, i) => (
          <div
            key={i}
            className="min-h-[84px] border-b border-r p-1.5"
            style={{ borderColor: 'var(--color-line)' }}
          >
            {dia && (
              <>
                <p
                  className="text-xs mb-1 h-5 w-5 flex items-center justify-center rounded-full"
                  style={ehHoje(dia) ? { backgroundColor: 'var(--color-petrol-600)', color: 'white' } : { color: 'var(--color-ink-soft)' }}
                >
                  {dia}
                </p>
                <div className="space-y-0.5">
                  {(porDia.get(dia) ?? []).slice(0, 3).map((a) => (
                    <button
                      key={a.id}
                      onClick={() => onSelecionarDia(a)}
                      className="w-full text-left text-[10px] leading-tight rounded px-1 py-0.5 truncate block"
                      style={{
                        backgroundColor: a.status === 'CONCLUIDA' ? 'var(--color-line)' : 'var(--color-petrol-50)',
                        color: a.status === 'CONCLUIDA' ? 'var(--color-ink-soft)' : 'var(--color-petrol-600)',
                        textDecoration: a.status === 'CONCLUIDA' ? 'line-through' : undefined,
                      }}
                      title={a.titulo}
                    >
                      {formatarHora(a.dataInicio)} {a.titulo}
                    </button>
                  ))}
                  {(porDia.get(dia)?.length ?? 0) > 3 && (
                    <p className="text-[10px]" style={{ color: 'var(--color-ink-soft)' }}>
                      +{(porDia.get(dia)?.length ?? 0) - 3} mais
                    </p>
                  )}
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Agenda() {
  const queryClient = useQueryClient();
  const [filtro, setFiltro] = useState<Filtro>('PENDENTE');
  const [mostrarForm, setMostrarForm] = useState(false);
  const [visualizacao, setVisualizacao] = useState<'lista' | 'calendario' | 'priorizada'>('lista');

  const { data: atividades, isLoading } = useQuery<Atividade[]>({
    queryKey: ['atividades'],
    queryFn: async () => {
      const { data } = await api.get('/atividades');
      return data;
    },
    enabled: visualizacao !== 'priorizada',
  });

  const { data: priorizadas, isLoading: carregandoPriorizadas } = useQuery<Atividade[]>({
    queryKey: ['atividades', 'priorizadas'],
    queryFn: async () => {
      const { data } = await api.get('/atividades/priorizadas');
      return data;
    },
    enabled: visualizacao === 'priorizada',
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['atividades'] });
    },
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
    <div className="p-8" style={{ maxWidth: visualizacao === 'calendario' ? '56rem' : '48rem' }}>
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

      <div className="flex items-center justify-between mb-5">
        <div className="flex gap-1">
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
        <div className="flex gap-1">
          {(['lista', 'calendario', 'priorizada'] as const).map((v) => (
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
      </div>

      {visualizacao === 'priorizada' ? (
        carregandoPriorizadas ? (
          <p className="text-sm" style={{ color: 'var(--color-ink-soft)' }}>Carregando…</p>
        ) : (
          <div className="bg-white border rounded-lg overflow-hidden" style={{ borderColor: 'var(--color-line)' }}>
            <div className="px-4 py-2.5 border-b text-xs" style={{ borderColor: 'var(--color-line)', color: 'var(--color-ink-soft)' }}>
              Ordenado por avanço no funil — negócios em negociação primeiro, prospecção por último
            </div>
            {priorizadas?.length === 0 ? (
              <div className="p-10 text-center">
                <p className="text-sm font-medium text-ink">Nenhuma atividade pendente</p>
              </div>
            ) : (
              <div className="divide-y" style={{ borderColor: 'var(--color-line)' }}>
                {priorizadas?.map((atividade) => (
                  <div key={atividade.id} className="flex items-center gap-3 px-4 py-3">
                    <input
                      type="checkbox"
                      disabled={concluir.isPending}
                      onChange={() => concluir.mutate(atividade.id)}
                      className="h-4 w-4 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-ink truncate">{atividade.titulo}</p>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--color-ink-soft)' }}>
                        {atividade.empresa?.nome}
                        {atividade.oportunidade ? ` · ${atividade.oportunidade.titulo}` : ''}
                      </p>
                    </div>
                    {atividade.oportunidade && (
                      <span
                        className="text-xs font-medium rounded-full px-2 py-0.5 shrink-0"
                        style={{ backgroundColor: 'var(--color-petrol-50)', color: 'var(--color-petrol-600)' }}
                      >
                        {atividade.oportunidade.estagio}
                      </span>
                    )}
                    <span className="text-xs shrink-0" style={{ color: 'var(--color-ink-soft)' }}>
                      {formatarHora(atividade.dataInicio)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      ) : isLoading ? (
        <p className="text-sm" style={{ color: 'var(--color-ink-soft)' }}>Carregando…</p>
      ) : visualizacao === 'calendario' ? (
        <CalendarioMensal atividades={filtradas} onSelecionarDia={(a) => a.status === 'PENDENTE' && concluir.mutate(a.id)} />
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
