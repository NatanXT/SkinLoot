import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../services/AuthContext';

const PublicRoute = () => {
  const { user } = useAuth(); // Não precisamos mais do 'loading'

  // Lógica direta: tem usuário? Redireciona para a vitrine. Não tem? Mostra o conteúdo.
  return user ? <Navigate to="/vitrine" /> : <Outlet />;
};
export default PublicRoute;
