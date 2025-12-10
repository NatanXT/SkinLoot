// frontend/src/services/vendedorService.js
import api from './api';
import anuncioService from './anuncioService';
import { getPublicUserProfile } from './publicProfile';

const USE_DEV_API = import.meta.env.VITE_ENABLE_DEV_API === 'true';

/**
 * Normalizes vendor data coming from the backend public user profile endpoint.
 */
function normalizeVendorProfile(raw, overrides = {}) {
  const source = raw && typeof raw === 'object' ? raw : {};

  const id =
    source.id ??
    source.uuid ??
    source.usuarioId ??
    source.userId ??
    overrides.id ??
    null;

  const name =
    source.nome ??
    source.name ??
    source.username ??
    'Usuário da SkinLoot';

  const memberSince =
    source.criadoEm ??
    source.createdAt ??
    source.dataCriacao ??
    source.registeredAt ??
    null;

  const avatar =
    source.avatarUrl ??
    source.fotoUrl ??
    source.profileImage ??
    source.imageUrl ??
    null;

  const avgRating =
    typeof source.avgRating === 'number'
      ? source.avgRating
      : typeof source.mediaNota === 'number'
      ? source.mediaNota
      : typeof source.rating === 'number'
      ? source.rating
      : 0;

  const totalReviews =
    typeof source.totalReviews === 'number'
      ? source.totalReviews
      : typeof source.qtdAvaliacoes === 'number'
      ? source.qtdAvaliacoes
      : typeof source.reviewCount === 'number'
      ? source.reviewCount
      : 0;

  const totalSales =
    typeof source.totalSales === 'number'
      ? source.totalSales
      : typeof source.qtdVendas === 'number'
      ? source.qtdVendas
      : typeof source.salesCount === 'number'
      ? source.salesCount
      : 0;

  return {
    id,
    name,
    avatar,
    memberSince,
    avgRating,
    totalReviews,
    totalSales,
    raw: source,
  };
}

/**
 * Returns the vendor public profile, normalized.
 * Uses /api/public/usuarios/{id} when available.
 */
export async function getVendorPublicProfile(vendorId) {
  if (!vendorId) {
    throw new Error('vendorId is required to fetch vendor profile.');
  }

  if (USE_DEV_API) {
    return normalizeVendorProfile({
      id: String(vendorId),
      nome: 'Vendedor Demo',
      criadoEm: '2024-01-01T00:00:00Z',
    });
  }

  try {
    const data = await getPublicUserProfile(vendorId);
    return normalizeVendorProfile(data, { id: vendorId });
  } catch (error) {
    console.warn('[vendedorService] Failed to fetch public profile:', error);
    // Fallback: still return a minimal profile so UI does not break.
    return normalizeVendorProfile(
      {
        id: vendorId,
        nome: 'Usuário da SkinLoot',
      },
      { id: vendorId },
    );
  }
}

/**
 * Extracts arrays from pageable responses.
 */
function extractArray(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.content)) return data.content;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.results)) return data.results;
  return [];
}

/**
 * Returns all active listings from the vendor.
 * Uses /anuncios/usuario/{id}/ativos.
 */
export async function getVendorSkins(vendorId) {
  if (!vendorId) {
    throw new Error('vendorId is required to fetch vendor skins.');
  }

  if (USE_DEV_API) {
    // In dev mode we simply return an empty list.
    // The UI already handles the "no active listings" state.
    return [];
  }

  const encodedId = encodeURIComponent(vendorId);
  const { data } = await api.get(`/anuncios/usuario/${encodedId}/ativos`);
  const array = extractArray(data);

  const normalizer =
    typeof anuncioService.normalizarDoBackend === 'function'
      ? anuncioService.normalizarDoBackend
      : (x) => x;

  return array.map((item) => normalizer(item));
}

/**
 * Normalizes a single review item coming from /avaliacoes/usuario/{id}.
 */
function normalizeReview(raw, fallbackSellerId) {
  const source = raw && typeof raw === 'object' ? raw : {};

  const id = source.id ?? source.uuid ?? source._id ?? null;

  const rating =
    Number(
      source.nota ??
        source.rating ??
        source.score ??
        source.stars ??
        0,
    ) || 0;

  const authorName =
    source.avaliadorNome ??
    source.autorNome ??
    source.buyerName ??
    source.usuarioNome ??
    source.nome ??
    'Comprador da plataforma';

  const comment =
    source.comentario ??
    source.comment ??
    source.texto ??
    source.message ??
    source.description ??
    '';

  const createdAt =
    source.dataCriacao ??
    source.createdAt ??
    source.date ??
    source.timestamp ??
    null;

  const sellerId =
    source.avaliadoId ??
    source.usuarioAvaliadoId ??
    source.sellerId ??
    fallbackSellerId ??
    null;

  return {
    id,
    sellerId,
    rating,
    authorName,
    comment,
    createdAt,
    raw: source,
  };
}

/**
 * Returns all reviews for a given vendor.
 * Uses /avaliacoes/usuario/{id}.
 */
export async function getVendorReviews(vendorId) {
  if (!vendorId) {
    throw new Error('vendorId is required to fetch vendor reviews.');
  }

  if (USE_DEV_API) {
    return [];
  }

  const encodedId = encodeURIComponent(vendorId);
  const { data } = await api.get(`/avaliacoes/usuario/${encodedId}`);
  const array = Array.isArray(data) ? data : [];
  return array.map((item) => normalizeReview(item, vendorId));
}

/**
 * Aggregates profile + skins + reviews into a single result.
 */
export async function getVendorFullProfile(vendorId) {
  if (!vendorId) {
    throw new Error('vendorId is required to fetch vendor data.');
  }

  if (USE_DEV_API) {
    const vendor = await getVendorPublicProfile(vendorId);
    return {
      vendor,
      skins: [],
      reviews: [],
    };
  }

  const [vendor, skins, reviews] = await Promise.all([
    getVendorPublicProfile(vendorId),
    getVendorSkins(vendorId),
    getVendorReviews(vendorId),
  ]);

  let avgRating = vendor.avgRating;
  let totalReviews = vendor.totalReviews;

  if ((!avgRating || avgRating === 0) && reviews.length > 0) {
    const sum = reviews.reduce((acc, r) => acc + (r.rating || 0), 0);
    avgRating = sum / reviews.length;
    totalReviews = reviews.length;
  }

  const mergedVendor = {
    ...vendor,
    avgRating,
    totalReviews,
  };

  return {
    vendor: mergedVendor,
    skins,
    reviews,
  };
}

const vendedorService = {
  getVendorPublicProfile,
  getVendorSkins,
  getVendorReviews,
  getVendorFullProfile,
};

export default vendedorService;
