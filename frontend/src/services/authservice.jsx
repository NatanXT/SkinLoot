// src/services/AuthService.js
import api from './api';

// troque os endpoints caso seus controllers usem outros caminhos
const register = (nome, email, senha, genero) =>
  api.post('/usuarios/register', { nome, email, senha, genero });

const login = (email, senha) => api.post('/usuarios/login', { email, senha });

const logout = () => api.post('/usuarios/auth/logout'); // se não tiver, pode só resolver uma Promise

const getCurrentUser = () => api.get('/usuarios/auth/me'); // ou '/usuarios/me' se esse for o seu @GetMapping

export default { register, login, logout, getCurrentUser };
