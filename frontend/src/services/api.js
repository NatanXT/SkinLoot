// Instância Axios única + interceptors para JWT e refresh.
// Ajuste o VITE_API_BASE_URL no .env (ex.: http://localhost:8080).
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080",
  timeout: 20000,
});

/** Lê/grava tokens — se "lembrar" = true usa localStorage, senão sessionStorage */
const storage = {
  get remember() {
    return localStorage.getItem("remember") === "true";
  },
  set remember(v) {
    localStorage.setItem("remember", v ? "true" : "false");
  },
  get access() {
    return (this.remember ? localStorage : sessionStorage).getItem("accessToken");
  },
  set access(v) {
    const box = this.remember ? localStorage : sessionStorage;
    v ? box.setItem("accessToken", v) : box.removeItem("accessToken");
  },
  get refresh() {
    return (this.remember ? localStorage : sessionStorage).getItem("refreshToken");
  },
  set refresh(v) {
    const box = this.remember ? localStorage : sessionStorage;
    v ? box.setItem("refreshToken", v) : box.removeItem("refreshToken");
  },
  clear() {
    ["accessToken", "refreshToken"].forEach((k) => {
      localStorage.removeItem(k);
      sessionStorage.removeItem(k);
    });
  },
};

// Injeta Authorization: Bearer <token> se houver
api.interceptors.request.use((config) => {
  const token = storage.access;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Tenta refresh automático no 401, se houver refreshToken
let refreshing = null;
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const { response, config } = err || {};
    if (!response) throw err;

    // Evita loop infinito e só tenta refresh se houver refreshToken
    if (response.status === 401 && !config.__isRetry && storage.refresh) {
      try {
        if (!refreshing) {
          refreshing = api
            .post("/auth/refresh", { refreshToken: storage.refresh })
            .then((r) => {
              storage.access = r.data?.accessToken;
              return r.data?.accessToken;
            })
            .finally(() => {
              refreshing = null;
            });
        }
        const newAccess = await refreshing;
        // Reexecuta a request original com o novo access token
        config.__isRetry = true;
        config.headers.Authorization = `Bearer ${newAccess}`;
        return api(config);
      } catch (e) {
        // Refresh falhou → limpa tokens
        storage.clear();
      }
    }
    throw err;
  }
);

export { storage };
export default api;
