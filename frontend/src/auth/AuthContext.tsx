import { createContext, useContext, useState, type ReactNode } from 'react';
import { api } from '../api/client';
import type { Usuario } from '../api/types';

interface AuthContextValue {
  usuario: Usuario | null;
  entrar: (email: string, senha: string) => Promise<void>;
  sair: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(() => {
    const salvo = localStorage.getItem('spikcrm_usuario');
    return salvo ? JSON.parse(salvo) : null;
  });

  async function entrar(email: string, senha: string) {
    const { data } = await api.post('/auth/login', { email, senha });
    localStorage.setItem('spikcrm_token', data.accessToken);
    localStorage.setItem('spikcrm_usuario', JSON.stringify(data.usuario));
    setUsuario(data.usuario);
  }

  function sair() {
    localStorage.removeItem('spikcrm_token');
    localStorage.removeItem('spikcrm_usuario');
    setUsuario(null);
  }

  return (
    <AuthContext.Provider value={{ usuario, entrar, sair }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth precisa estar dentro de AuthProvider');
  return ctx;
}
