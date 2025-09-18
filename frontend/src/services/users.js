// src/services/users.js
// ============================================================================
// Serviços para Perfil/Minha Conta
// - getMyProfile(): busca o perfil no backend
// - Em MODO MOCK, retorna um usuário local (de auth_user ou fallback padrão)
// ============================================================================

import api, { isDevAuth, DEV_API_ENABLED } from "./api";

// ---------- Mock de perfil ----------
function mockPerfil() {
  // Tenta reaproveitar o user salvo pelo DEV Login
  const raw = localStorage.getItem("auth_user");
  if (raw) {
    try { return JSON.parse(raw); } catch {}
  }
  // Fallback (caso não exista no storage)
  return {
    id: 0,
    nome: "Usuário DEV",
    email: "dev@skinloot.com",
    plano: "plus",
    criadoEm: "2024-01-10T12:00:00Z",
  };
}

/**
 * Busca perfil do usuário logado
 */
export async function getMyProfile() {
  // Modo mock: se flag global estiver ativa ou se token for dev
  if (DEV_API_ENABLED || isDevAuth()) {
    await new Promise((r) => setTimeout(r, 250));
    return mockPerfil();
  }

  // ---------- CHAMADA REAL AO BACKEND (AJUSTE O ENDPOINT) ----------
  // Ex.: GET /users/me
  const { data } = await api.get("/users/me");
  return data;
}

/**
 * Atualiza perfil básico (ajuste conforme seu DTO no Spring)
 */
export async function updateMyProfile(payload) {
  if (DEV_API_ENABLED || isDevAuth()) {
    // Simula atualização local no auth_user
    const atual = mockPerfil();
    const novo = { ...atual, ...payload };
    localStorage.setItem("auth_user", JSON.stringify(novo));
    await new Promise((r) => setTimeout(r, 200));
    return novo;
  }

  const { data } = await api.put("/users/me", payload);
  return data;
}

/**
 * Troca de senha (payload: { currentPassword, newPassword })
 */
export async function changeMyPassword(payload) {
  if (DEV_API_ENABLED || isDevAuth()) {
    await new Promise((r) => setTimeout(r, 200));
    // Apenas “ok” no mock
    return { ok: true };
  }

  const { data } = await api.put("/users/me/password", payload);
  return data;
}
