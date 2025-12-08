// src/services/api.js
import axios from 'axios';

// instancia
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
  timeout: 20000,
  withCredentials: true, // ok manter; não atrapalha o header Bearer
});

// storage unificado
const storage = {
  get remember() {
    return localStorage.getItem('remember') === 'true';
  },
  set remember(v) {
    localStorage.setItem('remember', v ? 'true' : 'false');
  },

  get access() {
    return (this.remember ? localStorage : sessionStorage).getItem(
      'accessToken',
    );
  },
  set access(v) {
    const box = this.remember ? localStorage : sessionStorage;
    v ? box.setItem('accessToken', v) : box.removeItem('accessToken');
  },

  get refresh() {
    return (this.remember ? localStorage : sessionStorage).getItem(
      'refreshToken',
    );
  },
  set refresh(v) {
    const box = this.remember ? localStorage : sessionStorage;
    v ? box.setItem('refreshToken', v) : box.removeItem('refreshToken');
  },

  clear() {
    ['accessToken', 'refreshToken', 'auth_user', 'remember'].forEach((k) => {
      localStorage.removeItem(k);
      sessionStorage.removeItem(k);
    });
  },
};

// Permite customizar a rota de refresh no .env
const AUTH_REFRESH_PATH =
  import.meta.env.VITE_AUTH_REFRESH_PATH || '/usuarios/auth/refresh';

// request interceptor: injeta Bearer
api.interceptors.request.use((config) => {
  const token = storage.access;
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// response interceptor: tenta refresh 401
let refreshing = null;

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const { response, config } = err || {};
    if (!response) throw err;

    const is401 = response.status === 401;
    const isRetry = config.__isRetry === true;
    const hasRefresh = !!storage.refresh;

    // rotas que NÃO devem tentar refresh
    const publicAuthEndpoints = [
      '/usuarios/login',
      '/usuarios/register',
      AUTH_REFRESH_PATH,
    ];

    if (
      is401 &&
      !isRetry &&
      hasRefresh &&
      !publicAuthEndpoints.some((p) => (config?.url || '').startsWith(p))
    ) {
      try {
        if (!refreshing) {
          refreshing = api
            .post(
              AUTH_REFRESH_PATH,
              { refreshToken: storage.refresh },
              { withCredentials: true },
            )
            .then((r) => {
              const newAccess =
                r?.data?.accessToken || r?.data?.token || r?.data?.access;
              const newRefresh = r?.data?.refreshToken || storage.refresh;
              if (newAccess) storage.access = newAccess;
              if (newRefresh) storage.refresh = newRefresh;
              return newAccess;
            })
            .finally(() => {
              refreshing = null;
            });
        }

        const newAccess = await refreshing;
        if (!newAccess) throw new Error('Refresh inválido');

        // refaz a request original
        config.__isRetry = true;
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${newAccess}`;
        return api(config);
      } catch {
        storage.clear();
      }
    }

    throw err;
  },
);

export { api, storage };
export default api;
