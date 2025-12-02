// src/App.jsx
import React from 'react';
// OBS: como usamos Router dentro do App, o main.jsx NÃO deve criar Router de novo
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';

// Páginas
import Cadastro from './pages/cadastro/Cadastro';
import Login from './pages/login/Login';
import ForgotPassword from './pages/login/ForgotPassword';
import ResetPassword from './pages/login/ResetPassword';

import Marketplace from './pages/marketplace/Marketplace.jsx';
import Carrinho from './pages/carrinho/Carrinho';
import Historico from './pages/historico/Historico';
import Suporte from './pages/suporte/Suporte';
import NotFound from './pages/notfound/NotFound';
import DashboardVitrine from './pages/dashboard/DashboardVitrine.jsx';
import DetalheAnuncio from './pages/detalhes/DetalheAnuncio.jsx';

import PerfilUsuario from './pages/usuario/PerfilUsuario';

// Página de administração de usuários
import AdminPainel from './pages/admin/AdminPainel.jsx';
import AdminRoute from './components/AdminRoute';
// Context/Auth
import { useAuth } from './services/AuthContext';

// Layout persistente (Sidebar/Header/Footer) para rotas específicas
import Layout from './components/layout/Layout'; // (import mantido caso vá usar em outras rotas)

// ------ Guard de rota (protege rotas que exigem login) ------
function RequireAuth({ children }) {
  const { user } = useAuth(); // espera que seu AuthContext exponha 'user'
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Raiz agora é a Vitrine */}
        <Route path="/" element={<DashboardVitrine />} />

        {/* (Opcional) manter /home compatível redirecionando para / */}
        <Route path="/home" element={<Navigate to="/" replace />} />

        {/* Rotas públicas “planas” */}
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/marketplace" element={<Marketplace />} />
        <Route path="/carrinho" element={<Carrinho />} />
        <Route path="/historico" element={<Historico />} />
        <Route path="/suporte" element={<Suporte />} />
        <Route path="/anuncio/:id" element={<DetalheAnuncio />} />


        {/* Usuario/Perfil (PROTEGIDA) */}
        <Route
          path="/perfil"
          element={
            <RequireAuth>
              <PerfilUsuario />
            </RequireAuth>
          }
        />

        {/* Usuario/Admin (PROTEGIDA) */}
        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<AdminPainel />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}
