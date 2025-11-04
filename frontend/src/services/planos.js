// src/services/planos.js
// ============================================================================
// Services para Renovação e Upgrade de plano do usuário
// - Em modo REAL: chama endpoints do backend (ajuste as URLs conforme o seu API).
// - Em modo MOCK: atualiza o objeto "auth_user" salvo no localStorage e devolve
//   o perfil atualizado, simulando sucesso de backend.
// ============================================================================

import api from './api';
// ⚠️ AJUSTE ESTES ENDPOINTS CONFORME O BACKEND
const ENDPOINT_RENOVAR = '/planos/renovar'; // POST { planoAtual }
const ENDPOINT_UPGRADE = '/planos/upgrade'; // POST { planoNovo }

/* Renova o plano atual do usuário.
* @param {string} planoAtual - ex.: "gratuito" | "intermediario" | "plus"
* @returns {Promise<object>} perfil atualizado (real)
*/
export async function renovarPlano(planoAtual) {
  // Modo MOCK/DEV removido.

  // Modo REAL
  const { data } = await api.post(ENDPOINT_RENOVAR, { planoAtual });
  return data;
}

/**
 * Faz upgrade para um novo plano.
 * @param {string} planoNovo - ex.: "intermediario" | "plus"
 * @returns {Promise<object>} perfil atualizado (real)
 */
export async function upgradePlano(planoNovo) {
  // Modo MOCK/DEV removido.

  // Modo REAL
  const { data } = await api.post(ENDPOINT_UPGRADE, { planoNovo });
  return data;
}
