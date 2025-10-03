// frontend/src/services/anuncioService.js
// Serviço responsável por buscar e normalizar os anúncios (skins) do usuário logado.
// Usa a instância Axios centralizada (api) e retorna os itens prontos para a Dashboard.
// ------------------------------------------------------------------------------

import api from './api.js';

/**
 * CAMINHO DA API:
 * - Ajuste aqui caso seu backend utilize outra rota (ex.: '/usuarios/me/anuncios' ou '/anuncios/minhas').
 * - Padrão usado: GET /anuncios/me  -> lista os anúncios do usuário autenticado.
 */
const CAMINHO_MINHAS = '/anuncios/user';
const CAMINHO_FEED = '/anuncios';

/**
 * normalizarDoBackend
 * Converte o anúncio do backend para o formato que a Dashboard usa no ranking.
 * Mantemos nomes em português e garantimos chaves: id, title, image, game, price, currency,
 * seller, plan, likes, listedAt.
 */
export function normalizarDoBackend(anuncio) {
  // Id robusto (pega a primeira alternativa disponível)
  const id = anuncio.id || anuncio.uuid || anuncio._id;

  // Título da skin
  const title =
    anuncio.skinNome ||
    anuncio.skinName ||
    anuncio.titulo ||
    anuncio.nome ||
    'Skin';

  // Imagem principal
  const image =
    anuncio.skinIcon ||
    anuncio.skinImageUrl ||
    anuncio.imagemUrl ||
    anuncio.imagem ||
    anuncio.fotoUrl ||
    '';

  // Jogo (se não vier do backend, padronizamos como CS2 por enquanto)
  const game = anuncio.jogo || anuncio.jogoNome || 'CS2';

  // Preço numérico (tenta múltiplos campos)
  const precoNum = Number(anuncio.preco ?? anuncio.price ?? anuncio.valor ?? 0);

  // Plano (gratuito/intermediario/plus) — fallback para 'gratuito'
  const planRaw = anuncio?.plano || anuncio?.plan || 'gratuito';
  const plan = String(planRaw).toLowerCase();

  // Curtidas (fallback 0)
  const likes = Number(anuncio?.likes ?? anuncio?.curtidas ?? 0);

  // Data de listagem: tenta vários campos, cai para "agora" se faltar
  const dataStr =
    anuncio?.dataCriacao ||
    anuncio?.criadoEm ||
    anuncio?.createdAt ||
    anuncio?.atualizadoEm;
  const listedAt = dataStr ? Date.parse(dataStr) || Date.now() : Date.now();
  const listedAt =
    Date.parse(
      anuncio.dataCriacao || anuncio.criadoEm || anuncio.createdAt || '',
    ) || Date.now();

  // Vendedor (nome visível no card + fallback)
  const sellerName = anuncio.usuarioNome || anuncio.vendedorNome || '—';

  return {
    id,
    title,
    image,
    game,
    price: Number.isFinite(precoNum) ? precoNum : 0,
    currency: 'BRL',
    seller: { name: sellerName },
    plan: (anuncio.plano || anuncio.plan || 'gratuito').toLowerCase(),
    likes: anuncio.likesCount ?? anuncio.likes ?? 0,
    listedAt,
    // Mantemos alguns campos originais caso precise em outro lugar
    _raw: anuncio,
  };
}

/**
 * listarMinhasNormalizadas
 * Busca as skins do usuário e entrega já normalizadas para a Dashboard.
 * Aceita retornos em formatos diferentes: array direto ou paginado ({results}, {items}, {content}).
 */
export async function listarMinhasNormalizadas() {
  const { data } = await api.get(CAMINHO_MINHAS);
  const arr = Array.isArray(data) ? data : [];
  return arr.map(normalizarDoBackend);
}

export async function listarFeedNormalizado() {
  const { data } = await api.get(CAMINHO_FEED);
  const arr = Array.isArray(data) ? data : [];
  return arr.map(normalizarDoBackend);
}

export async function likeAnuncio(id) {
  await api.post(`/anuncios/${id}/like`);
}
export async function unlikeAnuncio(id) {
  await api.delete(`/anuncios/${id}/unlike`);
}

export default {
  listarMinhasNormalizadas,
  listarFeedNormalizado,
  likeAnuncio,
  unlikeAnuncio,
};
