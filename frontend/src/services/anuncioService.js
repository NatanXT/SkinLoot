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
const CAMINHO_MINHAS = '/anuncios/me';

/**
 * normalizarDoBackend
 * Converte o anúncio do backend para o formato que a Dashboard usa no ranking.
 * Mantemos nomes em português e garantimos chaves: id, title, image, game, price, currency,
 * seller, plan, likes, listedAt.
 */
export function normalizarDoBackend(anuncioBruto) {
  // Id robusto (pega a primeira alternativa disponível)
  const id =
    anuncioBruto?.id ||
    anuncioBruto?.uuid ||
    anuncioBruto?._id ||
    anuncioBruto?.codigo ||
    String(Math.random()).slice(2);

  // Título da skin
  const title = anuncioBruto?.skinNome || anuncioBruto?.nome || anuncioBruto?.titulo || 'Skin';

  // Imagem principal
  const image = anuncioBruto?.imagemUrl || anuncioBruto?.imagem || anuncioBruto?.fotoUrl || '';

  // Jogo (se não vier do backend, padronizamos como CS2 por enquanto)
  const game = anuncioBruto?.jogo || 'CS2';

  // Preço numérico (tenta múltiplos campos)
  const precoNum = Number(
    anuncioBruto?.preco ?? anuncioBruto?.price ?? anuncioBruto?.valor ?? NaN
  );

  // Plano (gratuito/intermediario/plus) — fallback para 'gratuito'
  const planRaw = anuncioBruto?.plano || anuncioBruto?.plan || 'gratuito';
  const plan = String(planRaw).toLowerCase();

  // Curtidas (fallback 0)
  const likes = Number(anuncioBruto?.likes ?? anuncioBruto?.curtidas ?? 0);

  // Data de listagem: tenta vários campos, cai para "agora" se faltar
  const dataStr =
    anuncioBruto?.dataCriacao ||
    anuncioBruto?.criadoEm ||
    anuncioBruto?.createdAt ||
    anuncioBruto?.atualizadoEm;
  const listedAt = dataStr ? Date.parse(dataStr) || Date.now() : Date.now();

  // Vendedor (nome visível no card + fallback)
  const sellerName =
    anuncioBruto?.usuarioNome ||
    anuncioBruto?.vendedorNome ||
    anuncioBruto?.donoNome ||
    'Você';

  return {
    id,
    title,
    image,
    game,
    price: Number.isFinite(precoNum) ? precoNum : 0,
    currency: 'BRL',
    seller: { name: sellerName },
    plan,
    likes,
    listedAt,
    // Mantemos alguns campos originais caso precise em outro lugar
    _raw: anuncioBruto,
  };
}

/**
 * listarMinhasNormalizadas
 * Busca as skins do usuário e entrega já normalizadas para a Dashboard.
 * Aceita retornos em formatos diferentes: array direto ou paginado ({results}, {items}, {content}).
 */
export async function listarMinhasNormalizadas() {
  const { data } = await api.get(CAMINHO_MINHAS);

  const lista =
    (Array.isArray(data) && data) ||
    (Array.isArray(data?.results) && data.results) ||
    (Array.isArray(data?.items) && data.items) ||
    (Array.isArray(data?.content) && data.content) ||
    [];

  return lista.map(normalizarDoBackend);
}

const anuncioService = {
  listarMinhasNormalizadas,
};

export default anuncioService;
