// src/services/planos.js
// ============================================================================
// Services para Renovação e Upgrade de plano do usuário
// - Em modo REAL: chama endpoints do backend (ajuste as URLs conforme o seu API).
// - Em modo MOCK: atualiza o objeto "auth_user" salvo no localStorage e devolve
//   o perfil atualizado, simulando sucesso de backend.
// ============================================================================

import api, { DEV_API_ENABLED, isDevAuth } from "./api";

// ⚠️ AJUSTE ESTES ENDPOINTS CONFORME O BACKEND
const ENDPOINT_RENOVAR = "/planos/renovar";     // POST { planoAtual }
const ENDPOINT_UPGRADE = "/planos/upgrade";     // POST { planoNovo }

/** Lê o "auth_user" salvo no localStorage (DEV login o grava lá). */
function readAuthUser() {
  try {
    const raw = localStorage.getItem("auth_user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/** Grava o "auth_user" no localStorage (para refletir alterações de plano). */
function writeAuthUser(user) {
  try {
    if (!user) {
      localStorage.removeItem("auth_user");
    } else {
      localStorage.setItem("auth_user", JSON.stringify(user));
    }
  } catch {
    /* noop */
  }
}

/**
 * Renova o plano atual do usuário.
 * @param {string} planoAtual - ex.: "gratuito" | "intermediario" | "plus"
 * @returns {Promise<object>} perfil atualizado (mock/real)
 */
export async function renovarPlano(planoAtual) {
  // Modo MOCK/DEV
  if (DEV_API_ENABLED || isDevAuth()) {
    await new Promise((r) => setTimeout(r, 350));
    const user = readAuthUser() || {};
    // Aqui você poderia simular uma data de expiração nova:
    const now = Date.now();
    const renovado = {
      ...user,
      plano: planoAtual || user.plano || "gratuito",
      planoRenovadoEm: now,
      planoExpiraEm: now + 30 * 24 * 60 * 60 * 1000, // +30 dias
    };
    writeAuthUser(renovado);
    return renovado;
  }

  // Modo REAL
  const { data } = await api.post(ENDPOINT_RENOVAR, { planoAtual });
  return data;
}

/**
 * Faz upgrade para um novo plano.
 * @param {string} planoNovo - ex.: "intermediario" | "plus"
 * @returns {Promise<object>} perfil atualizado (mock/real)
 */
export async function upgradePlano(planoNovo) {
  // Modo MOCK/DEV
  if (DEV_API_ENABLED || isDevAuth()) {
    await new Promise((r) => setTimeout(r, 350));
    const user = readAuthUser() || {};
    const now = Date.now();
    const atualizado = {
      ...user,
      plano: planoNovo || "intermediario",
      planoAtualizadoEm: now,
      planoExpiraEm: now + 30 * 24 * 60 * 60 * 1000, // +30 dias
    };
    writeAuthUser(atualizado);
    return atualizado;
  }

  // Modo REAL
  const { data } = await api.post(ENDPOINT_UPGRADE, { planoNovo });
  return data;
}
