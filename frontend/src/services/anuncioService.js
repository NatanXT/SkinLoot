// frontend/src/services/anuncioService.js
import api from './api';

const DEV_ENABLED = import.meta.env.VITE_ENABLE_DEV_LOGIN === 'true';
const LS_KEY = 'dev_skins';

// ---------------- DEV store helpers ----------------
function devLoad() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  // seed inicial
  const seed = [
    {
      id: 'm1',
      skinNome: 'AWP | Asiimov',
      preco: 799.9,
      imagemUrl: '/img/awp_asiimov.png',
      ativo: true,
    },
    {
      id: 'm2',
      skinNome: 'AK-47 | Neon Rider',
      preco: 499.0,
      imagemUrl: '/img/ak47_neon_rider.png',
      ativo: true,
    },
    {
      id: 'm3',
      skinNome: 'Butterfly | Slaughter',
      preco: 3299.0,
      imagemUrl: '/img/butterfly_slaughter.png',
      ativo: false,
    },
  ];
  localStorage.setItem(LS_KEY, JSON.stringify(seed));
  return seed;
}
function devSave(arr) {
  localStorage.setItem(LS_KEY, JSON.stringify(arr));
  return arr;
}
function uid() {
  return 'm' + Math.random().toString(36).slice(2, 9);
}

// ------------ Normalização (para quando usar backend) ------------
function normalizarDoBackend(anuncio = {}) {
  const id = anuncio.id ?? anuncio.uuid ?? anuncio._id ?? uid();
  const title =
    anuncio.skinNome ??
    anuncio.skinName ??
    anuncio.titulo ??
    anuncio.nome ??
    'Skin';
  const image =
    anuncio.skinIcon ??
    anuncio.skinImageUrl ??
    anuncio.imagemUrl ??
    anuncio.imagem ??
    anuncio.fotoUrl ??
    '';
  const game = anuncio.jogo ?? anuncio.jogoNome ?? 'CS2';
  const precoNum = Number(anuncio.preco ?? anuncio.price ?? anuncio.valor ?? 0);
  const plan = String(
    anuncio.plano ?? anuncio.plan ?? 'gratuito',
  ).toLowerCase();
  const likes = Number(
    anuncio.likesCount ?? anuncio.likes ?? anuncio.curtidas ?? 0,
  );
  const dataStr =
    anuncio.dataCriacao ??
    anuncio.criadoEm ??
    anuncio.createdAt ??
    anuncio.atualizadoEm ??
    '';
  const parsed = Date.parse(dataStr);
  const listedAt = Number.isFinite(parsed) ? parsed : Date.now();
  const sellerName = anuncio.usuarioNome ?? anuncio.vendedorNome ?? '—';
  const status = anuncio.status ?? anuncio._status;
  const ativo = String(status || 'ATIVO').toUpperCase() === 'ATIVO';

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
    ativo,
    _raw: anuncio,
    // campos que o Perfil espera
    skinNome: title,
    imagemUrl: image,
    preco: Number.isFinite(precoNum) ? precoNum : 0,
  };
}

function extrairArray(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.content)) return data.content;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.results)) return data.results;
  return [];
}

// ================= LISTAGENS =================
export async function listarMinhasNormalizadas() {
  if (DEV_ENABLED) {
    // ✅ DEV: lê do localStorage
    const arr = devLoad();
    return arr;
  }

  // PROD: ajuste o endpoint para o seu backend (ex.: /anuncios/user)
  const { data } = await api.get('/anuncios/user');
  return extrairArray(data).map(normalizarDoBackend);
}

export async function listarFeedNormalizado() {
  if (DEV_ENABLED) {
    // em DEV, pode simplesmente reaproveitar as mesmas
    return devLoad();
  }
  const { data } = await api.get('/anuncios');
  return extrairArray(data).map(normalizarDoBackend);
}

// ================= CRUD =================
export async function criarAnuncio(payload) {
  if (DEV_ENABLED) {
    const arr = devLoad();
    const novo = {
      id: uid(),
      skinNome: payload.skinName || payload.titulo || 'Skin',
      preco: Number(payload.preco) || 0,
      imagemUrl: payload.skinImageUrl || '/img/placeholder.png',
      ativo: true,
    };
    devSave([novo, ...arr]);
    return novo;
  }

  // PROD: seu backend Spring usa /anuncios/save
  // Se precisar enviar arquivo, adapte para multipart conforme sua UI
  const body = {
    titulo: payload.titulo,
    descricao: payload.descricao ?? '',
    preco: payload.preco,
    skinName: payload.skinName,
    skinImageUrl: payload.skinImageUrl,
    // qualidade: payload.qualidade,
    // desgasteFloat: payload.desgasteFloat,
    // skinId: payload.skinId, // quando integrar com catálogo real
  };
  const { data } = await api.post('/anuncios/save', body);
  return normalizarDoBackend(data);
}

export async function editarAnuncio(id, payload) {
  if (DEV_ENABLED) {
    const arr = devLoad();
    const i = arr.findIndex((x) => String(x.id) === String(id));
    if (i >= 0) {
      const atualizado = {
        ...arr[i],
        skinNome: payload.skinName || payload.titulo || arr[i].skinNome,
        preco: Number(payload.preco ?? arr[i].preco),
        imagemUrl: payload.skinImageUrl || arr[i].imagemUrl,
      };
      arr[i] = atualizado;
      devSave(arr);
      return atualizado;
    }
    return null;
  }

  const body = {
    titulo: payload.titulo,
    descricao: payload.descricao ?? '',
    preco: payload.preco,
    skinName: payload.skinName,
    skinImageUrl: payload.skinImageUrl,
    // qualidade: payload.qualidade,
    // desgasteFloat: payload.desgasteFloat,
    // skinId: payload.skinId,
  };
  const { data } = await api.put(`/anuncios/${id}`, body);
  return normalizarDoBackend(data);
}

export async function desativarAnuncio(id) {
  if (DEV_ENABLED) {
    const arr = devLoad().map((x) =>
      String(x.id) === String(id) ? { ...x, ativo: false } : x,
    );
    devSave(arr);
    return;
  }
  // Spring: altera status -> recomendado ter endpoint específico
  await api.post(`/anuncios/${id}/desativar`);
}

export async function reativarAnuncio(id) {
  if (DEV_ENABLED) {
    const arr = devLoad().map((x) =>
      String(x.id) === String(id) ? { ...x, ativo: true } : x,
    );
    devSave(arr);
    return;
  }
  await api.post(`/anuncios/${id}/reativar`);
}

// (opcional) likes, caso você use
export async function likeAnuncio(id) {
  if (DEV_ENABLED) return;
  await api.post(`/anuncios/${id}/like`);
}
export async function unlikeAnuncio(id) {
  if (DEV_ENABLED) return;
  await api.delete(`/anuncios/${id}/unlike`);
}

export default {
  listarMinhasNormalizadas,
  listarFeedNormalizado,
  criarAnuncio,
  editarAnuncio,
  desativarAnuncio,
  reativarAnuncio,
  likeAnuncio,
  unlikeAnuncio,
};
