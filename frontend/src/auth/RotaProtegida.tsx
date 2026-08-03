import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

export default function RotaProtegida({ children }: { children: React.ReactNode }) {
  const { usuario } = useAuth();
  if (!usuario) return <Navigate to="/login" replace />;
  return <>{children}</>;
}
