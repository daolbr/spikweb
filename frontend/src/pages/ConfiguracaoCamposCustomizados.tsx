import { useState, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';
import type { CampoCustomizado, EntidadeCustomizavel, PermissaoCampo, TipoCampoCustomizado } from '../api/types';

const ENTIDADES: { valor: EntidadeCustomizavel; rotulo: string }[] = [
  { valor: 'EMPRESA', rotulo: 'Empresas' },
  { valor: 'CONTATO', rotulo: 'Contatos' },
  { valor: 'OPORTUNIDADE', rotulo: 'Oportunidades' },
  { valor: 'ATIVIDADE', rotulo: 'Atividades' },
  { valor: 'PROPOSTA', rotulo: 'Propostas' },
];

const TIPOS: { valor: TipoCampoCustomizado; rotulo: string }[] = [
  { valor: 'TEXTO', rotulo: 'Texto' },
  { valor: 'NUMERO', rotulo: 'Número' },
  { valor: 'DATA', rotulo: 'Data' },
  { valor: 'LISTA', rotulo: 'Lista de opções' },
  { valor: 'BOOLEANO', rotulo: 'Sim/Não' },
];

const PAPEIS: { valor: 'ADMIN' | 'GESTOR' | 'VENDEDOR'; rotulo: string }[] = [
  { valor: 'ADMIN', rotulo: 'Admin' },
  { valor: 'GESTOR', rotulo: 'Gestor' },
  { valor: 'VENDEDOR', rotulo: 'Vendedor' },
];

export default function ConfiguracaoCamposCustomizados() {
  const queryClient = useQueryClient();
  const [entidade, setEntidade] = useState<EntidadeCustomizavel>('EMPRESA');
  const [mostrarForm, setMostrarForm] = useState(false);
  const [campoPermissoes, setCampoPermissoes] = useState<CampoCustomizado | null>(null);

  const { data: campos, isLoading } = useQuery<CampoCustomizado[]>({
    queryKey: ['campos-customizados', entidade],
    queryFn: async () => {
      const { data } = await api.get('/campos-customizados', { params: { entidade } });
      return data;
    },
  });

  const criar = useMutation({
    mutationFn: async (payload: { rotulo: string; tipo: TipoCampoCustomizado; opcoesLista?: string; obrigatorio: boolean }) => {
      const { data } = await api.post('/campos-customizados', { entidade, ...payload });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campos-customizados', entidade] });
      setMostrarForm(false);
    },
    onError: (err: any) => alert(err?.response?.data?.message ?? 'Não foi possível criar o campo.'),
  });

  const remover = useMutation({
    mutationFn: async (id: string) => api.delete(`/campos-customizados/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['campos-customizados', entidade] }),
  });

  const ativar = useMutation({
    mutationFn: async ({ id, ativo }: { id: string; ativo: boolean }) =>
      api.patch(`/campos-customizados/${id}`, { ativo }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['campos-customizados', entidade] }),
  });

  const salvarPermissoes = useMutation({
    mutationFn: async ({ id, permissoes }: { id: string; permissoes: PermissaoCampo[] }) =>
      api.put(`/campos-customizados/${id}/permissoes`, { permissoes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campos-customizados', entidade] });
      setCampoPermissoes(null);
    },
  });

  function aoSubmeterNovoCampo(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const rotulo = String(form.get('rotulo') ?? '').trim();
    const tipo = String(form.get('tipo') ?? 'TEXTO') as TipoCampoCustomizado;
    const opcoesLista = String(form.get('opcoesLista') ?? '').trim();
    const obrigatorio = form.get('obrigatorio') === 'on';
    if (rotulo) criar.mutate({ rotulo, tipo, opcoesLista: opcoesLista || undefined, obrigatorio });
  }

  function permissaoAtual(campo: CampoCustomizado, papel: string): PermissaoCampo {
    return campo.permissoes?.find((p) => p.papel === papel) ?? { papel: papel as any, podeVer: true, podeEditar: true };
  }

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-6">
        <h1 style={{ fontFamily: 'var(--font-display)' }} className="text-2xl font-semibold text-ink">
          Campos customizados
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--color-ink-soft)' }}>
          Adicione campos específicos por entidade e controle quem pode ver ou editar cada um — o motor de dicionário de dados do sistema.
        </p>
      </div>

      <div className="flex gap-1 mb-5">
        {ENTIDADES.map((e) => (
          <button
            key={e.valor}
            onClick={() => setEntidade(e.valor)}
            className="text-sm rounded-md px-3 py-1.5 font-medium transition"
            style={{
              backgroundColor: entidade === e.valor ? 'var(--color-petrol-600)' : 'transparent',
              color: entidade === e.valor ? 'white' : 'var(--color-ink-soft)',
            }}
          >
            {e.rotulo}
          </button>
        ))}
      </div>

      <div className="flex justify-end mb-3">
        <button
          onClick={() => setMostrarForm(true)}
          className="rounded-md px-4 py-2 text-sm font-medium text-white"
          style={{ backgroundColor: 'var(--color-petrol-600)' }}
        >
          Novo campo
        </button>
      </div>

      <div className="bg-white border rounded-lg overflow-hidden" style={{ borderColor: 'var(--color-line)' }}>
        {isLoading ? (
          <p className="p-6 text-sm" style={{ color: 'var(--color-ink-soft)' }}>Carregando…</p>
        ) : campos?.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-sm font-medium text-ink">Nenhum campo customizado ainda para {ENTIDADES.find((e) => e.valor === entidade)?.rotulo}</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left" style={{ borderColor: 'var(--color-line)' }}>
                <th className="px-4 py-3 font-medium" style={{ color: 'var(--color-ink-soft)' }}>Rótulo</th>
                <th className="px-4 py-3 font-medium" style={{ color: 'var(--color-ink-soft)' }}>Tipo</th>
                <th className="px-4 py-3 font-medium" style={{ color: 'var(--color-ink-soft)' }}>Obrigatório</th>
                <th className="px-4 py-3 font-medium" style={{ color: 'var(--color-ink-soft)' }}>Ativo</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {campos?.map((campo) => (
                <tr key={campo.id} className="border-b last:border-0" style={{ borderColor: 'var(--color-line)' }}>
                  <td className="px-4 py-3 font-medium text-ink">{campo.rotulo}</td>
                  <td className="px-4 py-3" style={{ color: 'var(--color-ink-soft)' }}>
                    {TIPOS.find((t) => t.valor === campo.tipo)?.rotulo}
                  </td>
                  <td className="px-4 py-3" style={{ color: 'var(--color-ink-soft)' }}>{campo.obrigatorio ? 'Sim' : 'Não'}</td>
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={campo.ativo}
                      onChange={(e) => ativar.mutate({ id: campo.id, ativo: e.target.checked })}
                      className="h-4 w-4"
                    />
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <button
                      onClick={() => setCampoPermissoes(campo)}
                      className="text-xs font-medium mr-3"
                      style={{ color: 'var(--color-petrol-600)' }}
                    >
                      Permissões
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Remover o campo "${campo.rotulo}"? Os valores salvos também serão apagados.`)) {
                          remover.mutate(campo.id);
                        }
                      }}
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
        )}
      </div>

      {mostrarForm && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-40" onClick={() => setMostrarForm(false)}>
          <form
            onClick={(e) => e.stopPropagation()}
            onSubmit={aoSubmeterNovoCampo}
            className="bg-white rounded-lg border p-5 w-full max-w-sm space-y-3"
            style={{ borderColor: 'var(--color-line)' }}
          >
            <h2 style={{ fontFamily: 'var(--font-display)' }} className="text-lg font-semibold text-ink mb-1">
              Novo campo em {ENTIDADES.find((e) => e.valor === entidade)?.rotulo}
            </h2>
            <div>
              <label className="block text-xs font-medium text-ink mb-1">Rótulo</label>
              <input name="rotulo" required autoFocus placeholder="Ex.: Score de Crédito" className="w-full rounded-md border px-3 py-2 text-sm" style={{ borderColor: 'var(--color-line)' }} />
            </div>
            <div>
              <label className="block text-xs font-medium text-ink mb-1">Tipo</label>
              <select name="tipo" className="w-full rounded-md border px-3 py-2 text-sm" style={{ borderColor: 'var(--color-line)' }}>
                {TIPOS.map((t) => <option key={t.valor} value={t.valor}>{t.rotulo}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-ink mb-1">Opções (só para tipo "Lista", separadas por vírgula)</label>
              <input name="opcoesLista" placeholder="Ex.: Frio, Morno, Quente" className="w-full rounded-md border px-3 py-2 text-sm" style={{ borderColor: 'var(--color-line)' }} />
            </div>
            <label className="flex items-center gap-2 text-sm text-ink">
              <input type="checkbox" name="obrigatorio" className="h-4 w-4" />
              Obrigatório
            </label>
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

      {campoPermissoes && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-40" onClick={() => setCampoPermissoes(null)}>
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-lg border p-5 w-full max-w-md"
            style={{ borderColor: 'var(--color-line)' }}
          >
            <h2 style={{ fontFamily: 'var(--font-display)' }} className="text-lg font-semibold text-ink mb-1">
              Permissões — {campoPermissoes.rotulo}
            </h2>
            <p className="text-xs mb-4" style={{ color: 'var(--color-ink-soft)' }}>
              Controla quem vê e quem pode editar este campo especificamente.
            </p>

            <table className="w-full text-sm mb-4">
              <thead>
                <tr className="text-left">
                  <th className="py-2 font-medium" style={{ color: 'var(--color-ink-soft)' }}>Papel</th>
                  <th className="py-2 font-medium text-center" style={{ color: 'var(--color-ink-soft)' }}>Ver</th>
                  <th className="py-2 font-medium text-center" style={{ color: 'var(--color-ink-soft)' }}>Editar</th>
                </tr>
              </thead>
              <tbody id="tabela-permissoes">
                {PAPEIS.map((papel) => {
                  const perm = permissaoAtual(campoPermissoes, papel.valor);
                  return (
                    <tr key={papel.valor} className="border-t" style={{ borderColor: 'var(--color-line)' }}>
                      <td className="py-2 text-ink">{papel.rotulo}</td>
                      <td className="py-2 text-center">
                        <input
                          type="checkbox"
                          defaultChecked={perm.podeVer}
                          data-papel={papel.valor}
                          data-tipo="ver"
                          className="h-4 w-4"
                        />
                      </td>
                      <td className="py-2 text-center">
                        <input
                          type="checkbox"
                          defaultChecked={perm.podeEditar}
                          data-papel={papel.valor}
                          data-tipo="editar"
                          className="h-4 w-4"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <div className="flex justify-end gap-2">
              <button onClick={() => setCampoPermissoes(null)} className="text-sm rounded-md px-3 py-1.5 border" style={{ borderColor: 'var(--color-line)' }}>
                Cancelar
              </button>
              <button
                onClick={() => {
                  const linhas = document.querySelectorAll('#tabela-permissoes input');
                  const porPapel: Record<string, PermissaoCampo> = {};
                  linhas.forEach((el) => {
                    const input = el as HTMLInputElement;
                    const papel = input.dataset.papel!;
                    porPapel[papel] ??= { papel: papel as any, podeVer: true, podeEditar: true };
                    if (input.dataset.tipo === 'ver') porPapel[papel].podeVer = input.checked;
                    else porPapel[papel].podeEditar = input.checked;
                  });
                  salvarPermissoes.mutate({ id: campoPermissoes.id, permissoes: Object.values(porPapel) });
                }}
                disabled={salvarPermissoes.isPending}
                className="text-sm rounded-md px-3 py-1.5 font-medium text-white disabled:opacity-60"
                style={{ backgroundColor: 'var(--color-petrol-600)' }}
              >
                {salvarPermissoes.isPending ? 'Salvando…' : 'Salvar permissões'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
