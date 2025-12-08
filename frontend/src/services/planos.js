// src/services/planos.js

import api from './api';
const ENDPOINT_RENOVAR = '/planos/renovar'; // POST { planoAtual }
const ENDPOINT_UPGRADE = '/planos/upgrade'; // POST { planoNovo }

/* Renova o plano atual do usuário.
* @param {string} planoAtual - ex.: "gratuito" | "intermediario" | "plus"
* @returns {Promise<object>} perfil atualizado (real)
*/
export async function renovarPlano(planoAtual) {
  // Modo MOCK/DEV removido.

  const { data } = await api.post(ENDPOINT_RENOVAR, { planoAtual });
  return data;
}

/**
 * Faz upgrade para um novo plano.
 * @param {string} planoNovo - ex.: "intermediario" | "plus"
 * @returns {Promise<object>} perfil atualizado (real)
 */
export async function upgradePlano(planoNovo) {

  const { data } = await api.post(ENDPOINT_UPGRADE, { planoNovo });
  return data;
}
