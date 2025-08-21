import React from "react";
// Importa componentes para roteamento do React Router
import {Routes, Route} from "react-router-dom";
import ProtectedRoute from "./components/protectedRoutes"; // Certifique-se de que este import está correto


// Importa as páginas principais da aplicação
import Home from "./pages/home/Home";
import Cadastro from "./pages/cadastro/Cadastro";
import Login from "./pages/login/Login";
import Dashboard from "./pages/dashboard/Dashboard";
import Marketplace from "./pages/marketplace/marketplace";
import Carrinho from "./pages/carrinho/Carrinho";
import Historico from "./pages/historico/Historico";
import Suporte from "./pages/suporte/Suporte";
import NotFound from "./pages/notfound/NotFound";

import DashboardVitrine from "./pages/DashboardVitrine.jsx";

// Importa o componente Layout que contém a estrutura padrão (Sidebar, Header, Footer)
import Layout from "./components/layout/Layout";

export default function App() {
  return (
       <Routes>
      {/* =============================================== */}
      {/* GRUPO 1: Rotas Públicas (acessíveis a todos) */}
      {/* =============================================== */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/cadastro" element={<Cadastro />} />
      <Route path="/marketplace" element={<Marketplace />} />
      {/* Adicione outras rotas 100% públicas aqui */}
      

      {/* =================================================================== */}
      {/* GRUPO 2: Rotas Protegidas (exigem login e usam o Layout) */}
      {/* =================================================================== */}
      <Route 
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/carrinho" element={<Carrinho />} />
        <Route path="/historico" element={<Historico />} />
        <Route path="/suporte" element={<Suporte />} />
        <Route path="/vitrine" element={<DashboardVitrine />} />
        {/* Adicione outras rotas que precisam de login e do Layout aqui */}
      </Route>

      {/* Rota para páginas não encontradas */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}