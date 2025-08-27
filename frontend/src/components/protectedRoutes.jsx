import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../services/AuthContext';

const ProtectedRoute = () => {
  const { user } = useAuth(); // Não precisamos mais do 'loading'

  // A lógica agora é direta: tem usuário? Mostra o conteúdo. Não tem? Redireciona.
  return user ? <Outlet /> : <Navigate to="/login" />;
};

export default ProtectedRoute;