// src/services/AuthContext.jsx
// Contexto de autenticação consumindo src/services/AuthService.(jsx|js)
// - Import robusto: funciona se o service exportar default OU nomeado
// - Bootstrap tolerante ao formato de resposta (res.data.user || res.data)

import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
  useMemo,
} from "react";

// ⬇️ Import “à prova de formato” e respeitando o CASE do arquivo.
// Se o arquivo for "AuthService.jsx", prefira importar exatamente assim:
import * as authServiceModule from "./AuthService";

// Se o seu arquivo se chamar "authservice.jsx" (tudo minúsculo),
// troque a linha acima por:
// import * as authServiceModule from "./authservice";

// Pega o default se existir; senão usa o módulo em si (com exports nomeados)
const authService = authServiceModule.default ?? authServiceModule;

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);     // usuário atual (ou null)
  const [loading, setLoading] = useState(true); // carregando sessão inicial?

  useEffect(() => {
    // Se o serviço estiver mal importado, evita quebrar a app
    if (!authService || typeof authService.getCurrentUser !== "function") {
      console.error(
        "[AuthContext] AuthService inválido: getCurrentUser não encontrado. " +
          "Verifique o export default/nomeado do arquivo src/services/AuthService.jsx " +
          "e o CASE do import no AuthContext."
      );
      setLoading(false);
      setUser(null);
      return;
    }

    authService
      .getCurrentUser()
      .then((res) => {
        // Mock costuma devolver { data: user }
        // Backend costuma devolver { data: { user } }
        const payload = res?.data?.user ?? res?.data ?? null;
        setUser(payload);
      })
      .catch((error) => {
        // Mantém o comportamento: sessão não encontrada → user = null
        if (error?.response) {
          console.log(
            `Sessão não encontrada (Status: ${error.response.status})`
          );
        } else {
          console.warn(
            "Erro de rede ao verificar sessão. O backend está online?"
          );
        }
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  // LOGIN
  const login = useCallback(async (email, senha) => {
    if (!authService || typeof authService.login !== "function") {
      throw new Error(
        "[AuthContext] authService.login não disponível — verifique o export/import."
      );
    }
    const res = await authService.login(email, senha);
    const payload = res?.data?.user ?? res?.data ?? null;
    setUser(payload);
    return res;
  }, []);

  // LOGOUT
  const logout = useCallback(async () => {
    if (!authService || typeof authService.logout !== "function") {
      // Se não houver endpoint de logout, faça o mínimo: limpar user
      console.warn(
        "[AuthContext] authService.logout não disponível — limpando sessão local."
      );
      setUser(null);
      return;
    }
    await authService.logout();
    setUser(null);
  }, []);

  // REGISTER
  const register = useCallback(async (nome, email, senha, genero) => {
    if (!authService || typeof authService.register !== "function") {
      throw new Error(
        "[AuthContext] authService.register não disponível — verifique o export/import."
      );
    }
    const res = await authService.register(nome, email, senha, genero);
    const payload = res?.data?.user ?? res?.data ?? null;
    setUser(payload);
    return res;
  }, []);

  // Memoiza o value para evitar rerenders desnecessários
  const value = useMemo(
    () => ({ user, loading, login, logout, register }),
    [user, loading, login, logout, register]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
