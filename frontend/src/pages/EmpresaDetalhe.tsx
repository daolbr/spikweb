import { useState, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';
import type { Contato, Empresa } from '../api/types';
import CamposCustomizadosPainel from '../components/CamposCustomizadosPainel';

const ROTULO_PORTE: Record<string, string> = {
  MEI: 'MEI',
  MICRO: 'Microempresa',
  PEQUENA: 'Pequena empresa',
  MEDIA: 'Média empresa',
  GRANDE: 'Grande empresa',
};

const CAMPOS_EMPRESA: { chave: keyof Empresa; rotulo: string; formatar?: (v: unknown) => string }[] = [
  { chave: 'cnpj', rotulo: 'CNPJ' },
  { chave: 'porte', rotulo: 'Porte', formatar: (v) => ROTULO_PORTE[v as string] ?? '' },
  { chave: 'segmento', rotulo: 'Segmento' },
  { chave: 'cidade', rotulo: 'Cidade' },
  { chave: 'uf', rotulo: 'UF' },
  { chave: 'telefone', rotulo: 'Telefone' },
  { chave: 'site', rotulo: 'Site' },
];

export default function EmpresaDetalhe() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [mostrarFormContato, setMostrarFormContato] = useState(false);

  const { data: empresa, isLoading } = useQuery<Empresa>({
    queryKey: ['empresa', id],
    queryFn: async () => {
      const { data } = await api.get(`/empresas/${id}`);
      return data;
    },
  });

  const criarContato = useMutation({
    mutationFn: async (payload: Partial<Contato>) => {
      const { data } = await api.post('/contatos', { ...payload, empresaId: id });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['empresa', id] });
      setMostrarFormContato(false);
    },
  });

  const removerEmpresa = useMutation({
    mutationFn: async () => api.delete(`/empresas/${id}`),
    onSuccess: () => navigate('/empresas'),
  });

  function aoSubmeterContato(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    criarContato.mutate({
      nome: String(form.get('nome') ?? ''),
      email: String(form.get('email') ?? '') || undefined,
      cargo: String(form.get('cargo') ?? '') || undefined,
      telefone: String(form.get('telefone') ?? '') || undefined,
    } as Partial<Contato>);
  }

  if (isLoading || !empresa) {
    return (
      <div className="p-8">
        <p className="text-sm" style={{ color: 'var(--color-ink-soft)' }}>Carregando…</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl">
      <button
        onClick={() => navigate('/empresas')}
        className="text-sm mb-4 hover:underline"
        style={{ color: 'var(--color-ink-soft)' }}
      >
        ← Empresas
      </button>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)' }} className="text-2xl font-semibold text-ink">
            {empresa.nome}
          </h1>
          {empresa.segmento && (
            <p className="text-sm mt-1" style={{ color: 'var(--color-ink-soft)' }}>{empresa.segmento}</p>
          )}
        </div>
        <button
          onClick={() => {
            if (confirm(`Remover ${empresa.nome}? Esta ação não pode ser desfeita.`)) {
              removerEmpresa.mutate();
            }
          }}
          className="text-sm rounded-md px-3 py-1.5 border"
          style={{ borderColor: 'var(--color-line)', color: 'var(--color-clay-700)' }}
        >
          Remover empresa
        </button>
      </div>

      <div
        className="bg-white border rounded-lg p-5 grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8"
        style={{ borderColor: 'var(--color-line)' }}
      >
        {CAMPOS_EMPRESA.map(({ chave, rotulo, formatar }) => (
          <div key={chave}>
            <p className="text-xs font-medium mb-0.5" style={{ color: 'var(--color-ink-soft)' }}>
              {rotulo}
            </p>
            <p className="text-sm text-ink">
              {formatar ? formatar(empresa[chave]) || '—' : (empresa[chave] as string) || '—'}
            </p>
          </div>
        ))}
      </div>

      <CamposCustomizadosPainel entidade="EMPRESA" entidadeId={empresa.id} />

      <div className="flex items-center justify-between mb-3">
        <h2 style={{ fontFamily: 'var(--font-display)' }} className="text-lg font-semibold text-ink">
          Contatos
        </h2>
        <button
          onClick={() => setMostrarFormContato((v) => !v)}
          className="text-sm rounded-md px-3 py-1.5 font-medium text-white"
          style={{ backgroundColor: 'var(--color-petrol-600)' }}
        >
          Novo contato
        </button>
      </div>

      {mostrarFormContato && (
        <form
          onSubmit={aoSubmeterContato}
          className="bg-white border rounded-lg p-4 mb-4 grid grid-cols-2 gap-3"
          style={{ borderColor: 'var(--color-line)' }}
        >
          <input name="nome" required placeholder="Nome" className="rounded-md border px-3 py-2 text-sm" style={{ borderColor: 'var(--color-line)' }} />
          <input name="cargo" placeholder="Cargo" className="rounded-md border px-3 py-2 text-sm" style={{ borderColor: 'var(--color-line)' }} />
          <input name="email" type="email" placeholder="E-mail" className="rounded-md border px-3 py-2 text-sm" style={{ borderColor: 'var(--color-line)' }} />
          <input name="telefone" placeholder="Telefone" className="rounded-md border px-3 py-2 text-sm" style={{ borderColor: 'var(--color-line)' }} />
          <div className="col-span-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setMostrarFormContato(false)}
              className="text-sm rounded-md px-3 py-1.5 border"
              style={{ borderColor: 'var(--color-line)' }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={criarContato.isPending}
              className="text-sm rounded-md px-3 py-1.5 font-medium text-white disabled:opacity-60"
              style={{ backgroundColor: 'var(--color-petrol-600)' }}
            >
              {criarContato.isPending ? 'Salvando…' : 'Salvar contato'}
            </button>
          </div>
        </form>
      )}

      <div className="bg-white border rounded-lg overflow-hidden" style={{ borderColor: 'var(--color-line)' }}>
        {empresa.contatos?.length ? (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left" style={{ borderColor: 'var(--color-line)' }}>
                <th className="px-4 py-3 font-medium" style={{ color: 'var(--color-ink-soft)' }}>Nome</th>
                <th className="px-4 py-3 font-medium" style={{ color: 'var(--color-ink-soft)' }}>Cargo</th>
                <th className="px-4 py-3 font-medium" style={{ color: 'var(--color-ink-soft)' }}>E-mail</th>
                <th className="px-4 py-3 font-medium" style={{ color: 'var(--color-ink-soft)' }}>Telefone</th>
              </tr>
            </thead>
            <tbody>
              {empresa.contatos.map((contato) => (
                <tr key={contato.id} className="border-b last:border-0" style={{ borderColor: 'var(--color-line)' }}>
                  <td className="px-4 py-3 font-medium text-ink">{contato.nome}</td>
                  <td className="px-4 py-3" style={{ color: 'var(--color-ink-soft)' }}>{contato.cargo ?? '—'}</td>
                  <td className="px-4 py-3" style={{ color: 'var(--color-ink-soft)' }}>{contato.email ?? '—'}</td>
                  <td className="px-4 py-3" style={{ color: 'var(--color-ink-soft)' }}>{contato.telefone ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-10 text-center">
            <p className="text-sm font-medium text-ink">Nenhum contato cadastrado</p>
            <p className="text-sm mt-1" style={{ color: 'var(--color-ink-soft)' }}>
              Adicione o primeiro contato desta empresa.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
