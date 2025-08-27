import React from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../services/AuthContext'; // Ajuste o caminho se necessário

const RootLayout = () => {
  const { loading } = useAuth();

  if (loading) {
    // Você pode criar um componente de Spinner/Loader mais bonito aqui
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <h1>Carregando aplicação...</h1>
      </div>
    );
  }

  // Quando o carregamento terminar, renderiza a rota solicitada
  return <Outlet />;
};

export default RootLayout;