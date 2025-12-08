//frontend/src/services/publicProfile.js
import api from './api';

export async function getPublicUserProfile(userId) {
  if (!userId) {
    throw new Error('UserId is required to fetch public profile.');
  }

  const encodedId = encodeURIComponent(userId);

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
