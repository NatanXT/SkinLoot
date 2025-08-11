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

// Importa o componente Layout que contém a estrutura padrão (Sidebar, Header, Footer)
import Layout from "./components/layout/Layout";

function App() {
  return (
    // Componente Router envolve toda a aplicação para habilitar navegação entre páginas
    <Router>
      {/* Componente Routes gerencia a definição das rotas */}
      <Routes>
        {/* Rota para a página inicial */}
        <Route path="/" element={<Home />} />
        
        {/* Rota para a página de cadastro de usuário */}
        <Route path="/cadastro" element={<Cadastro />} />
        
        {/* Rota para a página de login */}
        <Route path="/login" element={<Login />} />
        
        {/* Rota para o marketplace, listagem de skins disponíveis */}
        <Route path="/marketplace" element={<Marketplace />} />
        
        {/* Rota para o carrinho de compras */}
        <Route path="/carrinho" element={<Carrinho />} />
        
        {/* Rota para histórico de compras e vendas do usuário */}
        <Route path="/historico" element={<Historico />} />
        
        {/* Rota para a central de suporte */}
        <Route path="/suporte" element={<Suporte />} />
        
        {/* Rota coringa para páginas não encontradas (404) */}
        <Route path="*" element={<NotFound />} />
        
        {/* Rota para o dashboard, área protegida que utiliza o Layout (Sidebar, Header, Footer) */}
        <Route
          path="/dashboard"
          element={
            <Layout>
              <Dashboard />
            </Layout>
          }
        />
      </Routes>
    </Router>
  );
}

// Exporta o componente principal da aplicação para ser usado na inicialização
export default App;
