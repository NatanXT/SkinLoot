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

    // Se o erro for 401 e a requisição ainda não foi re-tentada
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // Marca como re-tentada

      try {
        // Tenta chamar o endpoint de refresh token
        await axios.post('http://localhost:8080/usuarios/auth/refresh', {}, {
          withCredentials: true,
        });
        
        // Se o refresh funcionou, o novo accessToken está no cookie.
        // Re-tenta a requisição original, que agora deve funcionar.
        return api(originalRequest);
      } catch (refreshError) {
        // Se o refresh falhar (ex: refreshToken expirado), desloga o usuário
        // (Aqui você pode chamar a função de logout do seu AuthContext ou redirecionar para o login)
        console.error("Sessão expirada. Faça o login novamente.");
        window.location.href = '/login'; // Redirecionamento simples
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;