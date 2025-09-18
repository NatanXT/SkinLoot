// src/services/api.js
// ============================================================================
// Instância Axios única + interceptors para JWT e refresh.
// - Respeita VITE_API_BASE_URL do .env
// - Armazenamento de tokens com "remember" (localStorage ou sessionStorage)
// - Helper isDevAuth(): detecta se estamos em "login dev" (token especial)
// - Suporte a MODO MOCK via VITE_AUTH_MODE=mock ou VITE_ENABLE_DEV_API=true
// ============================================================================

import axios from 'axios';

// ---------- API base ----------
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
  timeout: 20000,
});

// ---------- Storage de tokens (com remember) ----------
/** Lê/grava tokens — se "remember" = true usa localStorage, senão sessionStorage */
const storage = {
  // Flag de “lembrar sessão” no localStorage (sempre aqui)
  get remember() {
    return localStorage.getItem('remember') === 'true';
  },
  set remember(v) {
    localStorage.setItem('remember', v ? 'true' : 'false');
  },

  // Access token salvo no “box” conforme remember
  get access() {
    return (this.remember ? localStorage : sessionStorage).getItem(
      'accessToken',
    );
  },
  set access(v) {
    const box = this.remember ? localStorage : sessionStorage;
    v ? box.setItem('accessToken', v) : box.removeItem('accessToken');
  },

  // Refresh token salvo no “box” conforme remember
  get refresh() {
    return (this.remember ? localStorage : sessionStorage).getItem(
      'refreshToken',
    );
  },
  set refresh(v) {
    const box = this.remember ? localStorage : sessionStorage;
    v ? box.setItem('refreshToken', v) : box.removeItem('refreshToken');
  },

  // Limpa access/refresh dos dois storages
  clear() {
    ['accessToken', 'refreshToken'].forEach((k) => {
      localStorage.removeItem(k);
      sessionStorage.removeItem(k);
    });
  },
};

// ---------- Modo DEV/Mock helpers ----------
// Ativa mocks se:
// - VITE_AUTH_MODE=mock, OU
// - VITE_ENABLE_DEV_API=true (chave auxiliar de desenvolvimento)
const DEV_API_ENABLED =
  import.meta.env.VITE_AUTH_MODE === 'mock' ||
  import.meta.env.VITE_ENABLE_DEV_API === 'true';

/**
 * Retorna true se estivermos “logados” com token de desenvolvimento.
 * Convenção: o DEV Login grava "dev-access-token" como accessToken.
 */
function isDevAuth() {
  const t = storage.access || '';
  return t.startsWith('dev-');
}

// ---------- Interceptors JWT ----------
// Injeta Authorization: Bearer <accessToken> se houver
api.interceptors.request.use((config) => {
  const token = storage.access;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Tenta refresh automático no 401 (se houver refreshToken)
let refreshing = null;
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const { response, config } = err || {};
    if (!response) throw err;

    // Evita loop e tenta refresh uma única vez
    if (response.status === 401 && !config.__isRetry && storage.refresh) {
      try {
        if (!refreshing) {
          refreshing = api
            .post('/auth/refresh', { refreshToken: storage.refresh })
            .then((r) => {
              const novoAccess = r?.data?.accessToken;
              if (novoAccess) storage.access = novoAccess;
              return novoAccess;
            })
            .finally(() => {
              refreshing = null;
            });
        }

        const newAccess = await refreshing;
        if (!newAccess) throw new Error('Refresh inválido');

        // Reexecuta a requisição original com o novo access
        config.__isRetry = true;
        config.headers.Authorization = `Bearer ${newAccess}`;
        return api(config);
      } catch {
        // Refresh falhou → limpa tokens e segue com erro
        storage.clear();
      }
    }

    throw err;
  },
);

export { storage, isDevAuth, DEV_API_ENABLED };
export default api;
