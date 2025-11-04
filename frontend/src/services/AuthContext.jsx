// src/services/AuthContext.jsx
import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import * as authServiceModule from './AuthService';
const authService = authServiceModule.default ?? authServiceModule;

const AuthContext = createContext(null);
const STORAGE_USER_KEY = 'auth_user';

// helper pra ler payload (quando endpoints já devolvem o user)
const pickPayload = (res) => res?.data?.user ?? res?.data ?? null;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const saveUser = (u) => {
    setUser(u);
    try {
      if (u) localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(u));
      else localStorage.removeItem(STORAGE_USER_KEY);
    } catch {}
  };

  useEffect(() => {
    // 1) Hidrata visualmente a partir do cache local
    try {
      const saved = localStorage.getItem(STORAGE_USER_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') setUser(parsed);
      }
    } catch {}

    // 2) Valida sessão no backend
    if (!authService?.getCurrentUser) {
      console.error(
        '[AuthContext] getCurrentUser não encontrado em AuthService.',
      );
      setLoading(false);
      return;
    }

    authService
      .getCurrentUser()
      .then((res) => saveUser(pickPayload(res)))
      .catch((error) => {
        if (error?.response?.status === 401) {
          // sessão ausente = esperado na primeira carga se não logou
        } else {
          console.warn(
            'Erro ao checar /me:',
            error?.response?.data || error.message,
          );
        }
        // se não havia cache, assegure null
        if (!localStorage.getItem(STORAGE_USER_KEY)) saveUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  // LOGIN: faz login, depois busca /me (o objeto de usuário)
  const login = useCallback(async (email, senha, remember = true) => {
    if (!authService?.login)
      throw new Error('[AuthContext] authService.login indisponível.');

    await authService.login(email, senha, remember);
    const meRes = await authService.getCurrentUser();
    const me = pickPayload(meRes);
    saveUser(me);
    return me;
  }, []);

  const logout = useCallback(async () => {
    try {
      if (authService?.logout) await authService.logout();
    } finally {
      saveUser(null);
    }
  }, []);

  // opcional: se tiver fluxo de cadastro que já autentica
  const register = useCallback(async (nome, email, senha, genero) => {
    if (!authService?.register)
      throw new Error('[AuthContext] authService.register indisponível.');

    await authService.register(nome, email, senha, genero);
    const meRes = await authService.getCurrentUser().catch(() => null);
    const me = pickPayload(meRes) || null;
    saveUser(me);
    return me;
  }, []);

  const value = useMemo(
    () => ({ user, loading, login, logout, register, setUser: saveUser }),
    [user, loading, login, logout, register],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
