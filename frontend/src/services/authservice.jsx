import api from './api';

const register = (nome, email, senha, genero) => {
  return api.post('/usuarios/register', {
    nome,
    email,
    senha,
    genero,
  });
};

const login = (email, senha) => {
  return api.post('/usuarios/login', {
    email,
    senha,
  });
};

const logout = () => {
  // O backend invalidará os cookies
  return api.post('/usuarios/auth/logout');
};

const getCurrentUser = () => {
  return api.get('/usuarios/auth/me');
}

const authService = {
  register,
  login,
  logout,
  getCurrentUser,
};

export default authService;