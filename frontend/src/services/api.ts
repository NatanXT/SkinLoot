import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080', // A URL do seu backend Spring Boot
  withCredentials: true, // ESSENCIAL para que o navegador envie os HttpOnly cookies
});
// Interceptor de resposta
api.interceptors.response.use(
  (response) => {
    return response; // Se a resposta for bem-sucedida, apenas a retorna
  },
  async (error) => {
    const originalRequest = error.config;

    const publicAuthEndpoints = [
        '/usuarios/login',
        '/usuarios/auth/refresh',
        '/usuarios/auth/me'
    ];

     if (error.response.status === 401 && !originalRequest._retry && !publicAuthEndpoints.includes(originalRequest.url)) {
      originalRequest._retry = true;

      try {
        // Tenta chamar o endpoint de refresh token
        await axios.post('http://localhost:8080/usuarios/auth/refresh', {}, {
          withCredentials: true,
        });
        
        return api(originalRequest);
      } catch (refreshError) {
        // Se o refresh falhar, o ideal é limpar o estado local e redirecionar
        // com o roteador do React, mas window.location é um fallback.
        // Neste ponto, o usuário será deslogado de qualquer forma.
        console.error("Sessão expirada. Faça o login novamente.");
        // O ideal é ter uma função de logout no AuthContext para limpar o estado
        // window.location.href = '/login'; 
        return Promise.reject(refreshError);
      }
    }


    return Promise.reject(error);
  }
);

export default api;