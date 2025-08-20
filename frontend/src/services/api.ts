import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080', // A URL do seu backend Spring Boot
  withCredentials: true, // ESSENCIAL para que o navegador envie os HttpOnly cookies
});

export default api;