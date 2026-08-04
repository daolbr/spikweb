import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import DotGridLogo from '../components/DotGridLogo';

export default function Login() {
  const { entrar } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  async function aoSubmeter(e: FormEvent) {
    e.preventDefault();
    setErro(null);
    setCarregando(true);
    try {
      await entrar(email, senha);
      navigate('/dashboard');
    } catch {
      setErro('E-mail ou senha inválidos.');
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-10 text-center">
          <div
            className="inline-flex h-14 w-14 items-center justify-center rounded-2xl mb-4"
            style={{ backgroundColor: 'var(--color-ink)' }}
          >
            <DotGridLogo size={5} gap={4} />
          </div>
          <h1
            style={{ fontFamily: 'var(--font-display)' }}
            className="text-2xl font-bold text-ink"
          >
            Spik CRM
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-ink-soft)' }}>
            Entre com sua conta para continuar
          </p>
        </div>

        <form
          onSubmit={aoSubmeter}
          className="bg-white rounded-xl border p-6 space-y-4"
          style={{ borderColor: 'var(--color-line)' }}
        >
          {erro && (
            <div
              className="text-sm rounded-md px-3 py-2"
              style={{ backgroundColor: 'var(--color-clay-100)', color: 'var(--color-clay-700)' }}
            >
              {erro}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">E-mail</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2"
              style={{ borderColor: 'var(--color-line)' }}
              placeholder="voce@empresa.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">Senha</label>
            <input
              type="password"
              required
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2"
              style={{ borderColor: 'var(--color-line)' }}
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={carregando}
            className="w-full rounded-md py-2.5 text-sm font-medium text-white transition disabled:opacity-60"
            style={{ backgroundColor: 'var(--color-petrol-600)' }}
          >
            {carregando ? 'Entrando…' : 'Entrar'}
          </button>
        </form>

        <p className="text-xs text-center mt-6" style={{ color: 'var(--color-ink-soft)' }}>
          Ainda não tem conta? Peça a um administrador para criar seu acesso em{' '}
          <code className="text-xs">/api/auth/registrar</code>.
        </p>
      </div>
    </div>
  );
}
