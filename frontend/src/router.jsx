// import React from "react";
// import { createBrowserRouter } from "react-router-dom";

// // Importe todos os seus componentes de página e layout
// import Home from "./pages/home/Home";
// import Cadastro from "./pages/cadastro/Cadastro";
// import Login from "./pages/login/Login";
// import Dashboard from "./pages/dashboard/Dashboard";
// import Marketplace from "./pages/marketplace/marketplace";
// import Carrinho from "./pages/carrinho/Carrinho";
// import Historico from "./pages/historico/Historico";
// import Suporte from "./pages/suporte/Suporte";
// import NotFound from "./pages/notfound/NotFound";
// import DashboardVitrine from "./pages/DashboardVitrine.jsx";
// import Layout from "./components/layout/Layout";
// import ProtectedRoute from "./components/protectedRoutes";
// import PublicRoute from "./components/publicRoute"; // <-- Importe o novo componente
// import RootLayout from "./components/rootLayout"; // <-- Importe o novo layout raiz

// const router = createBrowserRouter([
//   {
//     // A ROTA RAIZ AGORA É O NOSSO CONTÊINER DE CARREGAMENTO
//     element: <RootLayout />,
//     errorElement: <NotFound />, // Página de erro genérica
//     children: [
//       // GRUPO 1: Rotas 100% Públicas (para todos)
//       {
//         path: "/",
//         element: <Home />,
//       },
//       {
//         path: "/marketplace",
//         element: <Marketplace />,
//       },

//       // GRUPO 2: Rotas Públicas Apenas para Visitantes (Login, Cadastro)
//       {
//         element: <PublicRoute />,
//         children: [
//           {
//             path: "/login",
//             element: <Login />,
//           },
//           {
//             path: "/cadastro",
//             element: <Cadastro />,
//           },
//         ],
//       },

//       // GRUPO 3: Rotas Protegidas (apenas para usuários logados)
//       {
//         element: (
//           <ProtectedRoute>
//             <Layout />
//           </ProtectedRoute>
//         ),
//         children: [
//           // ... suas rotas protegidas aqui (dashboard, carrinho, etc.)
//           {
//             path: "/dashboard",
//             element: <Dashboard />,
//           },
//           {
//             path: "/vitrine",
//             element: <DashboardVitrine />,
//           }
//         ],
//       },

//       // Rota para URLs não encontradas
//       {
//         path: "*",
//         element: <NotFound />,
//       },
//     ],
//   },
// ]);
// export default router;
