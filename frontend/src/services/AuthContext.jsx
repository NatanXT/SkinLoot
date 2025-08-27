import React, { createContext, useState, useContext, useEffect, useCallback, useMemo } from 'react';
import authService from './authservice';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Para saber se a autenticação inicial já foi verificada

  useEffect(() => {
    authService.getCurrentUser()
      .then(response => {
        setUser(response.data);
      })
      .catch(error => {
        if (error.response) {
            console.log(`Sessão não encontrada (Status: ${error.response.status})`);
        } else {
            console.warn("Erro de rede ao verificar sessão. O backend está online?");
        }
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const login = useCallback(async (email, senha) => {
    const response = await authService.login(email, senha);
    setUser(response.data.user);
    return response;
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
  }, []);
  
  const register = useCallback(async (nome, email, senha, genero) => {
    const response = await authService.register(nome, email, senha, genero);
    setUser(response.data.user);
    return response;
  }, []);

  // useMemo garante que o objeto de valor só seja recriado se user ou loading mudarem.
  const value = useMemo(() => ({
    user,
    loading,
    login,
    logout,
    register,
  }), [user, loading, login, logout, register]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};