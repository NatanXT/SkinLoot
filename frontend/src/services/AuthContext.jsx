// src/services/AuthContext.jsx
// Contexto de autenticação consumindo src/services/AuthService.(jsx|js)
// - Import robusto: funciona se o service exportar default OU nomeado
// - Bootstrap tolerante ao formato de resposta (res.data.user || res.data)
// - [NOVO] Hidratação via localStorage ("auth_user") e setUser exposto no contexto

import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
  useMemo,
} from 'react';

// ⬇️ Import “à prova de formato” e respeitando o CASE do arquivo.
// Se o arquivo for "AuthService.jsx", prefira importar exatamente assim:
import * as authServiceModule from './AuthService';

// Se o seu arquivo se chamar "authservice.jsx" (tudo minúsculo),
// troque a linha acima por:
// import * as authServiceModule from "./authservice";

// Pega o default se existir; senão usa o módulo em si (com exports nomeados)
const authService = authServiceModule.default ?? authServiceModule;

const AuthContext = createContext(null);

// Chave simples para persistir o usuário localmente (DEV e bootstrap rápido)
const STORAGE_USER_KEY = 'auth_user';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // usuário atual (ou null)
  const [loading, setLoading] = useState(true); // carregando sessão inicial?

  // Helper: normaliza payload vindo do backend/mock
  const pickPayload = (res) => res?.data?.user ?? res?.data ?? null;

  // Helper: salva user no estado + localStorage
  const saveUser = (payload) => {
    setUser(payload);
    try {
      if (payload)
        localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(payload));
      else localStorage.removeItem(STORAGE_USER_KEY);
    } catch {
      // ignore quota/SSR
    }
  };

  useEffect(() => {
    // 1) Hidrata rapidamente a UI com o usuário salvo (DEV ou cache do /me)
    //    Isso evita "piscar" entre logado ↔ não logado nos primeiros ms.
    try {
      const saved = localStorage.getItem(STORAGE_USER_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') setUser(parsed);
      }
    } catch {
      // ignore JSON parse errors
    }

    // 2) Valida a sessão no backend (se o serviço expõe getCurrentUser)
    if (!authService || typeof authService.getCurrentUser !== 'function') {
      console.error(
        '[AuthContext] AuthService inválido: getCurrentUser não encontrado. ' +
          'Verifique o export default/nomeado do arquivo src/services/AuthService.jsx ' +
          'e o CASE do import no AuthContext.',
      );
      setLoading(false);
      return;
    }

    authService
      .getCurrentUser()
      .then((res) => {
        const payload = pickPayload(res);
        saveUser(payload);
      })
      .catch((error) => {
        // Sessão não encontrada ou erro de rede → mantém/limpa conforme necessário
        if (error?.response) {
          console.log(
            `Sessão não encontrada (Status: ${error.response.status})`,
          );
        } else {
          console.warn(
            'Erro de rede ao verificar sessão. O backend está online?',
          );
        }
        // Se não havia user hidratado (DEV), garante null:
        if (!localStorage.getItem(STORAGE_USER_KEY)) saveUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  // LOGIN
  const login = useCallback(async (email, senha) => {
    if (!authService || typeof authService.login !== 'function') {
      throw new Error(
        '[AuthContext] authService.login não disponível — verifique o export/import.',
      );
    }
    const res = await authService.login(email, senha);
    const payload = pickPayload(res);
    saveUser(payload);
    return res;
  }, []);

  // LOGOUT
  const logout = useCallback(async () => {
    // Se o serviço tiver logout, use; se não, apenas limpe localmente
    try {
      if (authService && typeof authService.logout === 'function') {
        await authService.logout();
      } else {
        console.warn(
          '[AuthContext] authService.logout não disponível — limpando sessão local.',
        );
      }
    } finally {
      saveUser(null);
    }
  }, []);

  // REGISTER
  const register = useCallback(async (nome, email, senha, genero) => {
    if (!authService || typeof authService.register !== 'function') {
      throw new Error(
        '[AuthContext] authService.register não disponível — verifique o export/import.',
      );
    }
    const res = await authService.register(nome, email, senha, genero);
    const payload = pickPayload(res);
    saveUser(payload);
    return res;
  }, []);

  // [NOVO] Expor setUser no contexto (útil para DEV LOGIN do front)
  const value = useMemo(
    () => ({ user, loading, login, logout, register, setUser: saveUser }),
    [user, loading, login, logout, register],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
