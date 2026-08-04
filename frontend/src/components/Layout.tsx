import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import DotGridLogo from './DotGridLogo';

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
        className="w-56 shrink-0 flex flex-col relative overflow-hidden"
        style={{ backgroundColor: 'var(--color-ink)' }}
      >
        {/* Mancha de brilho difusa, no mesmo padrão decorativo do material da marca */}
        <div
          className="absolute pointer-events-none"
          style={{
            width: 320, height: 320, left: -110, bottom: -130,
            background: 'radial-gradient(circle at 40% 40%, color-mix(in srgb, var(--color-green-forte) 35%, transparent), color-mix(in srgb, var(--color-green-medio) 14%, transparent) 45%, transparent 72%)',
            filter: 'blur(18px)',
          }}
        />

        <div className="relative px-5 py-5 flex items-center gap-2.5">
          <DotGridLogo />
          <span style={{ fontFamily: 'var(--font-display)' }} className="font-bold text-white">
            Spik CRM
          </span>
        </div>

        <nav className="relative flex-1 px-3 space-y-0.5 mt-2">
          {itensVisiveis.map((item) => (
            <NavLink
              key={item.para}
              to={item.para}
              className="block rounded-md px-3 py-2 text-sm font-medium transition"
              style={({ isActive }) => ({
                backgroundColor: isActive ? 'var(--color-petrol-600)' : 'transparent',
                color: isActive ? 'white' : 'rgba(255,255,255,0.68)',
              })}
            >
              {item.rotulo}
            </NavLink>
          ))}
        </nav>

        <div className="relative px-3 pb-4 pt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.12)' }}>
          <div className="px-3 py-2">
            <p className="text-sm font-medium text-white truncate">{usuario?.nome}</p>
            <p className="text-xs truncate" style={{ color: 'rgba(255,255,255,0.55)' }}>
              {usuario?.papel}
            </p>
          </div>
          <button
            onClick={sair}
            className="w-full text-left rounded-md px-3 py-2 text-sm transition hover:bg-white/5"
            style={{ color: 'rgba(255,255,255,0.68)' }}
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
