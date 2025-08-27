// import { api } from './api.js'

// const register = (nome, email, senha, genero) => {
//   return api.post('/usuarios/register', {
//     nome,
//     email,
//     senha,
//     genero,
//   });
// };

// const login = (email, senha) => {
//   return api.post('/usuarios/login', {
//     email,
//     senha,
//   });
// };

// const logout = () => {
//   // O backend invalidará os cookies
//   return api.post('/usuarios/auth/logout');
// };

// const getCurrentUser = () => {
//   return api.get('/usuarios/auth/me');
// }

// const authService = {
//   register,
//   login,
//   logout,
//   getCurrentUser,
// };

// export default authService;






// Mock : 





// src/services/api.js
// Instância única do Axios com interceptors.
// Exporta default (api) e também named (api) para compatibilidade.

import axios from "axios";

// Cria a instância com baseURL centralizada
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080",
  timeout: 20000,
});

// (Opcional) Pequeno helper pra tokens caso você use depois
export const storage = {
  get access() {
    return localStorage.getItem("accessToken");
  },
  set access(v) {
    if (v) localStorage.setItem("accessToken", v);
    else localStorage.removeItem("accessToken");
  },
};

// Interceptor de request: injeta Bearer se existir (não atrapalha no mock)
api.interceptors.request.use((config) => {
  const token = storage.access;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Interceptor de response — por agora só propaga o erro
api.interceptors.response.use(
  (res) => res,
  (err) => Promise.reject(err)
);

// Export default para suportar: import api from "./api"
export default api;

// Export nomeado (caso algum arquivo use: import { api } from "./api")
export { api };
