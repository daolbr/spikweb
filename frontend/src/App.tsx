import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './auth/AuthContext';
import RotaProtegida from './auth/RotaProtegida';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Empresas from './pages/Empresas';
import EmpresaDetalhe from './pages/EmpresaDetalhe';
import Oportunidades from './pages/Oportunidades';
import Agenda from './pages/Agenda';
import BaseInstalada from './pages/BaseInstalada';
import ConfiguracaoCamposCustomizados from './pages/ConfiguracaoCamposCustomizados';

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              element={
                <RotaProtegida>
                  <Layout />
                </RotaProtegida>
              }
            >
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/empresas" element={<Empresas />} />
              <Route path="/empresas/:id" element={<EmpresaDetalhe />} />
              <Route path="/oportunidades" element={<Oportunidades />} />
              <Route path="/agenda" element={<Agenda />} />
              <Route path="/base-instalada" element={<BaseInstalada />} />
              <Route path="/configuracoes/campos" element={<ConfiguracaoCamposCustomizados />} />
            </Route>
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}
