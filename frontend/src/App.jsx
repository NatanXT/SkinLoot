import React from "react";
// Importa componentes para roteamento do React Router
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

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
    <Router>
      <Routes>
        <Route path="/home" element={<Home />} />
        <Route path="/" element={<DashboardVitrine />} />

        {/* rotas “planas” */}
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/login" element={<Login />} />
        <Route path="/marketplace" element={<Marketplace />} />
        <Route path="/carrinho" element={<Carrinho />} />
        <Route path="/historico" element={<Historico />} />
        <Route path="/suporte" element={<Suporte />} />

        {/* rotas com layout persistente */}
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          {/* se quiser, adicione outras rotas protegidas aqui */}
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}