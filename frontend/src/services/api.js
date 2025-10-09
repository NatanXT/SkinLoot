// src/services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
  timeout: 20000,
  withCredentials: true,
});

// ----- storage (igual ao seu) -----
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
    ['accessToken', 'refreshToken'].forEach((k) => {
      localStorage.removeItem(k);
      sessionStorage.removeItem(k);
    });
  },
};

// ⚙️ Permita configurar vias .env (e mantenha defaults sensatos)
const AUTH_REFRESH_PATH =
  import.meta.env.VITE_AUTH_REFRESH_PATH || '/usuarios/auth/refresh';

api.interceptors.request.use((config) => {
  const token = storage.access;
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let refreshing = null;
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const { response, config } = err || {};
    if (!response) throw err;

    if (response.status === 401 && !config.__isRetry && storage.refresh) {
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
              if (newAccess) storage.access = newAccess;
              return newAccess;
            })
            .finally(() => {
              refreshing = null;
            });
        }

        const newAccess = await refreshing;
        if (!newAccess) throw new Error('Refresh inválido');

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
