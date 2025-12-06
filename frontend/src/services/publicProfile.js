// ==========================================================
// publicProfile.js
// Caminho: frontend/src/services/publicProfile.js
// ----------------------------------------------------------
// Service responsável por buscar dados públicos de um usuário
// (vendedor) para exibição no Perfil Público.
// Usa a mesma instância de API (axios) usada no resto do app.
// ==========================================================

import api from './api';

/**
 * Busca um perfil público de usuário/vendedor pelo ID.
 *
 * IMPORTANTE:
 *   Ajuste a URL abaixo para o endpoint real do seu backend.
 *   Exemplos comuns:
 *     - GET /api/public/usuarios/:id
 *     - GET /api/usuarios/public/:id
 *     - GET /api/users/public/:id
 */
export async function getPublicUserProfile(userId) {
  if (!userId) {
    throw new Error('UserId is required to fetch public profile.');
  }

  const encodedId = encodeURIComponent(userId);

  // TODO: ajuste este caminho conforme a sua API real
  const url = `/api/public/usuarios/${encodedId}`;

  const response = await api.get(url);

  // Blindagem: se vier HTML/string (ex.: index.html do Vite),
  // levantamos um erro claro para o chamador tratar.
  if (
    typeof response.data === 'string' ||
    response.headers?.['content-type']?.includes('text/html')
  ) {
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.error(
        '[publicProfile] Expected JSON but got string/HTML. Check API route or Vite proxy.',
        response.data,
      );
    }
    throw new Error('Servidor não retornou um perfil público válido.');
  }

  return response.data;
}
