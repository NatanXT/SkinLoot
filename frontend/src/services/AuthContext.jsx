import React, { createContext, useState, useContext, useEffect } from 'react';
import authService from './authservice';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Para saber se a autenticação inicial já foi verificada

  useEffect(() => {
    // Tenta buscar o usuário ao carregar a aplicação para manter a sessão ativa
    authService.getCurrentUser()
      .then(response => {
        setUser(response.data);
      })
      .catch(error => {
        console.log("Nenhum usuário logado na sessão.");
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const login = async (email, senha) => {
    const response = await authService.login(email, senha);
    setUser(response.data.user); // O backend retorna o usuário no corpo da resposta
    return response;
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };
  
  const register = async (nome, email, senha, genero) => {
    const response = await authService.register(nome, email, senha, genero);
    setUser(response.data.user);
    return response;
  };

  const value = {
    user,
    loading,
    login,
    logout,
    register,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook customizado para facilitar o uso do contexto
export const useAuth = () => {
  return useContext(AuthContext);
};