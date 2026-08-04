import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';
import type { CampoComValor, EntidadeCustomizavel } from '../api/types';

interface Props {
  entidade: EntidadeCustomizavel;
  entidadeId: string;
}

// Renderiza os campos customizados definidos para uma entidade (via
// /campos-customizados/valores), já filtrados por permissão do papel do
// usuário logado. Campos sem permissão de edição aparecem desabilitados,
// não escondidos — a pessoa vê o dado mas entende que não pode mexer.
export default function CamposCustomizadosPainel({ entidade, entidadeId }: Props) {
  const queryClient = useQueryClient();
  const [valoresLocais, setValoresLocais] = useState<Record<string, string>>({});

  const { data: campos, isLoading } = useQuery<CampoComValor[]>({
    queryKey: ['campos-customizados-valores', entidade, entidadeId],
    queryFn: async () => {
      const { data } = await api.get('/campos-customizados/valores', {
        params: { entidade, entidadeId },
      });
      return data;
    },
  });

  useEffect(() => {
    if (campos) {
      setValoresLocais(Object.fromEntries(campos.map((c) => [c.id, c.valor ?? ''])));
    }
  }, [campos]);

  const salvar = useMutation({
    mutationFn: async (campoId: string) => {
      const { data } = await api.put('/campos-customizados/valores', {
        entidade,
        entidadeId,
        valores: [{ campoId, valor: valoresLocais[campoId] || null }],
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campos-customizados-valores', entidade, entidadeId] });
    },
    onError: (err: any) => {
      alert(err?.response?.data?.message ?? 'Não foi possível salvar este campo.');
    },
  });

  if (isLoading || !campos || campos.length === 0) return null;

  return (
    <div className="bg-white border rounded-lg p-5 mb-6" style={{ borderColor: 'var(--color-line)' }}>
      <h2 style={{ fontFamily: 'var(--font-display)' }} className="text-sm font-semibold text-ink mb-1">
        Campos customizados
      </h2>
      <p className="text-xs mb-4" style={{ color: 'var(--color-ink-soft)' }}>
        Definidos em Configurações · específicos desta organização
      </p>
      <div className="grid grid-cols-2 gap-4">
        {campos.map((campo) => (
          <div key={campo.id}>
            <label className="block text-xs font-medium text-ink mb-1">
              {campo.rotulo}
              {campo.obrigatorio && <span style={{ color: 'var(--color-clay-700)' }}> *</span>}
              {!campo.podeEditar && (
                <span className="ml-1 text-[10px]" style={{ color: 'var(--color-ink-soft)' }}>
                  (somente leitura)
                </span>
              )}
            </label>

            {campo.tipo === 'BOOLEANO' ? (
              <input
                type="checkbox"
                disabled={!campo.podeEditar}
                checked={valoresLocais[campo.id] === 'true'}
                onChange={(e) => {
                  setValoresLocais((v) => ({ ...v, [campo.id]: String(e.target.checked) }));
                  salvar.mutate(campo.id);
                }}
                className="h-4 w-4"
              />
            ) : campo.tipo === 'LISTA' ? (
              <select
                disabled={!campo.podeEditar}
                value={valoresLocais[campo.id] ?? ''}
                onChange={(e) => setValoresLocais((v) => ({ ...v, [campo.id]: e.target.value }))}
                onBlur={() => salvar.mutate(campo.id)}
                className="w-full rounded-md border px-3 py-2 text-sm disabled:opacity-50 disabled:bg-black/[0.02]"
                style={{ borderColor: 'var(--color-line)' }}
              >
                <option value="">—</option>
                {(campo.opcoesLista ?? '').split(',').filter(Boolean).map((op) => (
                  <option key={op.trim()} value={op.trim()}>{op.trim()}</option>
                ))}
              </select>
            ) : (
              <input
                type={campo.tipo === 'NUMERO' ? 'number' : campo.tipo === 'DATA' ? 'date' : 'text'}
                disabled={!campo.podeEditar}
                value={valoresLocais[campo.id] ?? ''}
                onChange={(e) => setValoresLocais((v) => ({ ...v, [campo.id]: e.target.value }))}
                onBlur={() => salvar.mutate(campo.id)}
                className="w-full rounded-md border px-3 py-2 text-sm disabled:opacity-50 disabled:bg-black/[0.02]"
                style={{ borderColor: 'var(--color-line)' }}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
