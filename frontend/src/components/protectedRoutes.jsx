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
  // 1.Pegue 'isCheckingAuth' em vez de 'loading'
  const { user, isCheckingAuth } = useAuth();
  const loc = useLocation();

  // 2.Se estiver checando, retorna null (tela branca) para esperar
  if (isCheckingAuth) return null;

  // Se terminou de checar e não tem usuário, redireciona
  if (!user) {
    const from = encodeURIComponent(loc.pathname + loc.search);
    return <Navigate to={`/login?from=${from}`} replace />;
  }

  // Se tem usuário, mostra o conteúdo
  return <Outlet />;
};

export default ProtectedRoute;
