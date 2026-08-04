import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

const ITENS_NAV = [
  { para: '/dashboard', rotulo: 'Indicadores' },
  { para: '/oportunidades', rotulo: 'Negócios' },
  { para: '/agenda', rotulo: 'Agenda' },
  { para: '/empresas', rotulo: 'Empresas' },
  { para: '/base-instalada', rotulo: 'Base instalada' },
  { para: '/perfil-cliente', rotulo: 'Perfil ideal' },
];

export default function Layout() {
  const { usuario, sair } = useAuth();
  const itensVisiveis =
    usuario?.papel === 'ADMIN'
      ? [...ITENS_NAV, { para: '/configuracoes/campos', rotulo: 'Campos customizados' }]
      : ITENS_NAV;

  return (
    <div className="min-h-screen flex">
      <aside
        className="w-56 shrink-0 border-r flex flex-col"
        style={{ borderColor: 'var(--color-line)' }}
      >
        <div className="px-5 py-5 flex items-center gap-2.5">
          <div
            className="h-8 w-8 rounded-md flex items-center justify-center text-white text-sm font-semibold"
            style={{ backgroundColor: 'var(--color-petrol-600)', fontFamily: 'var(--font-display)' }}
          >
            S
          </div>
          <span style={{ fontFamily: 'var(--font-display)' }} className="font-semibold text-ink">
            Spik CRM
          </span>
        </div>

        <nav className="flex-1 px-3 space-y-0.5 mt-2">
          {itensVisiveis.map((item) => (
            <NavLink
              key={item.para}
              to={item.para}
              className="block rounded-md px-3 py-2 text-sm font-medium transition hover:bg-black/5"
              style={({ isActive }) => ({
                backgroundColor: isActive ? 'var(--color-petrol-600)' : 'transparent',
                color: isActive ? 'white' : 'var(--color-ink)',
              })}
            >
              {item.rotulo}
            </NavLink>
          ))}
        </nav>

        <div className="px-3 pb-4 pt-2 border-t" style={{ borderColor: 'var(--color-line)' }}>
          <div className="px-3 py-2">
            <p className="text-sm font-medium text-ink truncate">{usuario?.nome}</p>
            <p className="text-xs truncate" style={{ color: 'var(--color-ink-soft)' }}>
              {usuario?.papel}
            </p>
          </div>
          <button
            onClick={sair}
            className="w-full text-left rounded-md px-3 py-2 text-sm hover:bg-black/5 transition"
            style={{ color: 'var(--color-ink-soft)' }}
          >
            Sair
          </button>
        </div>
      </aside>

      <main className="flex-1 min-w-0">
        <Outlet />
      </main>
    </div>
  );
}
