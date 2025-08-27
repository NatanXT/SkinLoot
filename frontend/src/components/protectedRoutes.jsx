// import React from 'react';
// import { Navigate, Outlet } from 'react-router-dom';
// import { useAuth } from '../services/AuthContext';

// const ProtectedRoute = () => {
//   const { user } = useAuth(); // Não precisamos mais do 'loading'

//   // A lógica agora é direta: tem usuário? Mostra o conteúdo. Não tem? Redireciona.
//   return user ? <Outlet /> : <Navigate to="/login" />;
// };

// export default ProtectedRoute;

import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../services/AuthContext';

const ProtectedRoute = () => {
  const { user, loading } = useAuth();
  const loc = useLocation();

  // Enquanto não sabemos se há sessão, não decide (evita flicker)
  if (loading) return null; // se preferir, renderize um spinner aqui

  // Se não logado, envia para /login com ?from=<rota>
  if (!user) {
    const from = encodeURIComponent(loc.pathname + loc.search);
    return <Navigate to={`/login?from=${from}`} replace />;
  }

  // Logado → renderiza a rota filha
  return <Outlet />;
};

export default ProtectedRoute;
