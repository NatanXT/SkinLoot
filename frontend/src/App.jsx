// src/App.jsx
import React from "react";
// OBS: como usamos Router dentro do App, o main.jsx NÃO deve criar Router de novo
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// Páginas
import Cadastro from "./pages/cadastro/Cadastro";
import Login from "./pages/login/Login";
import ForgotPassword from "./pages/login/ForgotPassword";
import ResetPassword from "./pages/login/ResetPassword";
import Dashboard from "./pages/dashboard/Dashboard";
import Marketplace from "./pages/marketplace/marketplace";
import Carrinho from "./pages/carrinho/Carrinho";
import Historico from "./pages/historico/Historico";
import Suporte from "./pages/suporte/Suporte";
import NotFound from "./pages/notfound/NotFound";
import Perfil from "./pages/contas/Perfil.jsx";
import DashboardVitrine from "./pages/DashboardVitrine.jsx";

// Layout persistente (Sidebar/Header/Footer) para rotas específicas
import Layout from "./components/layout/Layout";

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
        <Route path="/perfil" element={<Perfil />} />

        {/* Rotas com layout persistente */}
        {/* IMPORTANTE: o componente Layout PRECISA ter <Outlet/> para os filhos renderizarem */}
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          {/* adicione outras páginas que usam o mesmo Layout aqui */}
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}
