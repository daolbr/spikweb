import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';
import type { Empresa, ListaEmpresas } from '../api/types';

const ROTULO_PORTE: Record<string, string> = {
  MEI: 'MEI',
  MICRO: 'Microempresa',
  PEQUENA: 'Pequena empresa',
  MEDIA: 'Média empresa',
  GRANDE: 'Grande empresa',
};

export default function Empresas() {
  const [busca, setBusca] = useState('');
  const [mostrarForm, setMostrarForm] = useState(false);
  const [erroForm, setErroForm] = useState<string | null>(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery<ListaEmpresas>({
    queryKey: ['empresas', busca],
    queryFn: async () => {
      const { data } = await api.get('/empresas', { params: { busca } });
      return data;
    },
  });

  const criarEmpresa = useMutation({
    mutationFn: async (payload: { nome: string; cnpj?: string; porte?: string }) => {
      const { data } = await api.post<Empresa>('/empresas', payload);
      return data;
    },
    onSuccess: (empresa) => {
      queryClient.invalidateQueries({ queryKey: ['empresas'] });
      setMostrarForm(false);
      setErroForm(null);
      navigate(`/empresas/${empresa.id}`);
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message;
      setErroForm(Array.isArray(msg) ? msg[0] : msg ?? 'Não foi possível criar a empresa.');
    },
  });

  function aoSubmeterNovaEmpresa(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const nome = String(form.get('nome') ?? '').trim();
    const cnpj = String(form.get('cnpj') ?? '').trim();
    const porte = String(form.get('porte') ?? '').trim();
    if (nome) criarEmpresa.mutate({ nome, cnpj: cnpj || undefined, porte: porte || undefined });
  }

  return (
    <div className="p-8 max-w-4xl">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)' }} className="text-2xl font-semibold text-ink">
            Empresas
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-ink-soft)' }}>
            {data ? `${data.total} empresa${data.total === 1 ? '' : 's'} cadastrada${data.total === 1 ? '' : 's'}` : ' '}
          </p>
        </div>
        <button
          onClick={() => setMostrarForm((v) => !v)}
          className="rounded-md px-4 py-2 text-sm font-medium text-white"
          style={{ backgroundColor: 'var(--color-petrol-600)' }}
        >
          Nova empresa
        </button>
      </div>

      {mostrarForm && (
        <form
          onSubmit={aoSubmeterNovaEmpresa}
          className="mb-6 bg-white border rounded-lg p-4 space-y-3"
          style={{ borderColor: 'var(--color-line)' }}
        >
          {erroForm && (
            <div className="text-sm rounded-md px-3 py-2" style={{ backgroundColor: 'var(--color-clay-100)', color: 'var(--color-clay-700)' }}>
              {erroForm}
            </div>
          )}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-1">
              <label className="block text-xs font-medium text-ink mb-1.5">Nome da empresa</label>
              <input
                name="nome"
                required
                autoFocus
                placeholder="Ex.: Acme Distribuidora"
                className="w-full rounded-md border px-3 py-2 text-sm outline-none"
                style={{ borderColor: 'var(--color-line)' }}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-ink mb-1.5">CNPJ (opcional)</label>
              <input
                name="cnpj"
                placeholder="XX.XXX.XXX/XXXX-XX"
                className="w-full rounded-md border px-3 py-2 text-sm outline-none"
                style={{ borderColor: 'var(--color-line)' }}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-ink mb-1.5">Porte (opcional)</label>
              <select name="porte" className="w-full rounded-md border px-3 py-2 text-sm outline-none" style={{ borderColor: 'var(--color-line)' }}>
                <option value="">—</option>
                {Object.entries(ROTULO_PORTE).map(([valor, rotulo]) => (
                  <option key={valor} value={valor}>{rotulo}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={criarEmpresa.isPending}
              className="rounded-md px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
              style={{ backgroundColor: 'var(--color-petrol-600)' }}
            >
              {criarEmpresa.isPending ? 'Criando…' : 'Criar'}
            </button>
          </div>
        </form>
      )}

      <div className="mb-4">
        <input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar por nome…"
          className="w-full max-w-xs rounded-md border px-3 py-2 text-sm outline-none"
          style={{ borderColor: 'var(--color-line)' }}
        />
      </div>

      <div className="bg-white border rounded-lg overflow-hidden" style={{ borderColor: 'var(--color-line)' }}>
        {isLoading ? (
          <p className="p-6 text-sm" style={{ color: 'var(--color-ink-soft)' }}>
            Carregando…
          </p>
        ) : data?.dados.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-sm font-medium text-ink">Nenhuma empresa encontrada</p>
            <p className="text-sm mt-1" style={{ color: 'var(--color-ink-soft)' }}>
              Cadastre a primeira empresa para começar.
            </p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left" style={{ borderColor: 'var(--color-line)' }}>
                <th className="px-4 py-3 font-medium" style={{ color: 'var(--color-ink-soft)' }}>Nome</th>
                <th className="px-4 py-3 font-medium" style={{ color: 'var(--color-ink-soft)' }}>Segmento</th>
                <th className="px-4 py-3 font-medium" style={{ color: 'var(--color-ink-soft)' }}>Cidade/UF</th>
              </tr>
            </thead>
            <tbody>
              {data?.dados.map((empresa) => (
                <tr
                  key={empresa.id}
                  onClick={() => navigate(`/empresas/${empresa.id}`)}
                  className="border-b last:border-0 cursor-pointer hover:bg-black/[0.02] transition"
                  style={{ borderColor: 'var(--color-line)' }}
                >
                  <td className="px-4 py-3 font-medium text-ink">{empresa.nome}</td>
                  <td className="px-4 py-3" style={{ color: 'var(--color-ink-soft)' }}>
                    {empresa.segmento ?? '—'}
                  </td>
                  <td className="px-4 py-3" style={{ color: 'var(--color-ink-soft)' }}>
                    {empresa.cidade ? `${empresa.cidade}${empresa.uf ? '/' + empresa.uf : ''}` : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
