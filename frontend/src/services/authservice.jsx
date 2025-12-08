// src/services/AuthService.js
import api, { storage } from './api';

// Endpoints corretos conforme o backend Java
const AUTH_LOGIN_PATH = '/usuarios/login';
const AUTH_REGISTER_PATH = '/usuarios/register';
const AUTH_ME_PATH = '/usuarios/auth/me';

// LOGIN
export async function login(email, senha, remember = true) {
  storage.remember = !!remember;

  const body = { email, senha };

  const { data } = await api.post(AUTH_LOGIN_PATH, body, {
    withCredentials: true,
  });

  const access = data?.accessToken || data?.token || null;
  const refresh = data?.refreshToken || null;

  if (access) storage.access = access;
  if (refresh) storage.refresh = refresh;

  return { data };
}

// REGISTER
export async function register(nome, email, senha, genero) {
  const body = { nome, email, senha, genero };

  const { data } = await api.post(AUTH_REGISTER_PATH, body, {
    withCredentials: true,
  });

  return { data };
}

// GET CURRENT USER
export const getCurrentUser = () =>
  api.get(AUTH_ME_PATH, { withCredentials: true });

// LOGOUT
export async function logout() {
  storage.clear();
  await api.post('/usuarios/auth/logout', {}, { withCredentials: true });
}

// EXPORT
export default { login, register, getCurrentUser, logout };
