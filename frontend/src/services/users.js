// frontend/src/services/users.js
import api from './api';

const DEV_ENABLED = import.meta.env.VITE_ENABLE_DEV_LOGIN === 'true';
const STORAGE_USER_KEY = 'auth_user';

// Fallback simples para DEV
function mockPerfil() {
  try {
    const raw = localStorage.getItem(STORAGE_USER_KEY);
    if (raw) {
      const u = JSON.parse(raw);
      if (u && typeof u === 'object') return u;
    }
  } catch {}
  return {
    id: 'dev-user-id',
    nome: 'Usuário DEV',
    email: 'dev@skinloot.com',
    plano: 'plus',
    criadoEm: '2024-01-10T12:00:00Z',
  };
}

export async function getMyProfile() {
  // ✅ Em DEV: não dependa do backend
  if (DEV_ENABLED) {
    return mockPerfil();
  }

  // PROD/real
  const { data } = await api.get('/usuarios/me'); // ajuste se seu endpoint real for outro
  return data;
}

export async function updateMyProfile(payload) {
  const { data } = await api.put('/usuarios/me', payload);
  return data;
}

export async function changeMyPassword(payload) {
  const { data } = await api.put('/usuarios/me/password', payload);
  return data;
}

export default {
  getMyProfile,
  updateMyProfile,
  changeMyPassword,
};
