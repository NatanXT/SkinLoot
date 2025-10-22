// frontend/src/services/anuncioService.js
import api from './api';

// ✅ agora quem decide usar localStorage (mock) é este flag:
const USE_DEV_API = import.meta.env.VITE_ENABLE_DEV_API === 'true';
const LS_KEY = 'dev_skins';

// --------- helpers DEV (localStorage) ----------
function devLoad() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
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

// converte File -> dataURL (persiste entre reloads)
function fileToDataURL(file) {
  return new Promise((resolve, reject) => {
    const rd = new FileReader();
    rd.onload = () => resolve(String(rd.result || ''));
    rd.onerror = reject;
    rd.readAsDataURL(file);
  });
}

/** Extrai { base64, mime } de uma dataURL (ex.: "data:image/png;base64,...."). */
function dataUrlToParts(dataUrl) {
  try {
    if (!dataUrl || typeof dataUrl !== 'string') return {};
    if (!dataUrl.startsWith('data:')) return {};
    const [head, b64] = dataUrl.split(',');
    if (!head || !b64) return {};
    const mime = head.substring(5, head.indexOf(';')) || 'image/*';
    return { base64: b64, mime };
  } catch {
    return {};
  }
}

// ------------ Normalização (quando usar backend) ------------
function normalizarDoBackend(anuncio = {}) {
  const id = anuncio.id ?? anuncio.uuid ?? anuncio._id ?? uid();
  const title =
    anuncio.skinNome ??
    anuncio.skinName ??
    anuncio.titulo ??
    anuncio.nome ??
    'Skin';

  // Se vier Base64 do backend, monta uma dataURL para exibição
  let image = '';
  if (anuncio.skinImageBase64) {
    const mime = anuncio.skinImageMime || 'image/*';
    image = `data:${mime};base64,${anuncio.skinImageBase64}`;
  } else {
    image =
      anuncio.skinIcon ??
      anuncio.skinImageUrl ??
      anuncio.skin_image_url ?? // snake_case
      anuncio.imagemUrl ??
      anuncio.imagem ??
      anuncio.fotoUrl ??
      '';
  }

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

    // campos que o Perfil usa
    skinNome: title,
    imagemUrl: image, // <- o Perfil lê aqui
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
  if (USE_DEV_API) {
    // DEV: lê e traz todas (inclusive inativas) para o Perfil
    return devLoad();
  }
  const { data } = await api.get('/anuncios/user');
  return extrairArray(data).map(normalizarDoBackend);
}

export async function listarFeedNormalizado() {
  if (USE_DEV_API) {
    // DEV: usa as mesmas, mas só ativas para a vitrine
    return devLoad()
      .filter((x) => x.ativo !== false)
      .map((x) => ({
        ...x,
        id: x.id,
        title: x.skinNome,
        image: x.imagemUrl,
        price: x.preco,
        plan: 'gratuito',
        likes: 0,
        listedAt: Date.now(),
        game: 'CS2',
        ativo: x.ativo !== false,
        seller: { name: '—' },
      }));
  }
  const { data } = await api.get('/anuncios');
  return extrairArray(data).map(normalizarDoBackend);
}

// ================= CRUD =================
export async function criarAnuncio(payload) {
  if (USE_DEV_API) {
    const arr = devLoad();

    // Prioriza base64 (se veio do form). Senão, tente File -> dataURL; senão, use a URL.
    let imagemUrl = '';
    if (payload.skinImageBase64) {
      const mime = payload.skinImageMime || 'image/*';
      imagemUrl = `data:${mime};base64,${payload.skinImageBase64}`;
    } else if (payload.imagemFile instanceof File) {
      imagemUrl = await fileToDataURL(payload.imagemFile); // salva dataURL (contém base64)
    } else if (payload.skinImageUrl) {
      imagemUrl = payload.skinImageUrl;
    }
    if (!imagemUrl) imagemUrl = '/img/placeholder.png';

    const novo = {
      id: uid(),
      skinNome: payload.skinName || payload.titulo || 'Skin',
      preco: Number(payload.preco) || 0,
      imagemUrl,
      ativo: true,
    };
    devSave([novo, ...arr]);
    return novo;
  }

  // PROD: envie campos compatíveis com Base64
  const body = {
    titulo: payload.titulo,
    descricao: payload.descricao ?? '',
    preco: payload.preco,
    skin_name: payload.skinName ?? payload.skin_name,
    skinName: payload.skinName,

    // Preferência por Base64:
    skinImageBase64: payload.skinImageBase64 ?? null,
    skinImageMime: payload.skinImageMime ?? null,

    // Fallback opcional: se quiser manter compat com uma API antiga (URL)
    skinImageUrl: payload.skinImageUrl ?? null,

    detalhesEspecificos: payload.detalhesEspecificos ?? {}, // Envia um objeto JSON
  };
  const { data } = await api.post('/anuncios/save', body);
  return normalizarDoBackend(data);
}

export async function editarAnuncio(id, payload) {
  if (USE_DEV_API) {
    const arr = devLoad();
    const i = arr.findIndex((x) => String(x.id) === String(id));
    if (i >= 0) {
      // Preferência por base64 (se veio); senão, tenta File -> dataURL; senão mantém a existente/URL
      let imagemUrl =
        (payload.skinImageBase64 &&
          `data:${payload.skinImageMime || 'image/*'};base64,${
            payload.skinImageBase64
          }`) ||
        arr[i].imagemUrl ||
        '';

      if (!payload.skinImageBase64 && payload.imagemFile instanceof File) {
        imagemUrl = await fileToDataURL(payload.imagemFile);
      } else if (!payload.skinImageBase64 && payload.skinImageUrl) {
        imagemUrl = payload.skinImageUrl;
      }

      const atualizado = {
        ...arr[i],
        skinNome: payload.skinName || payload.titulo || arr[i].skinNome,
        preco: Number(payload.preco ?? arr[i].preco),
        imagemUrl,
      };
      arr[i] = atualizado;
      devSave(arr);
      return atualizado;
    }
    return null;
  }

  // PROD: atualizar com Base64 preferencialmente
  const body = {
    titulo: payload.titulo,
    descricao: payload.descricao ?? '',
    preco: payload.preco,
    skin_name: payload.skinName ?? payload.skin_name,
    skinName: payload.skinName,

    // Preferência por Base64:
    skinImageBase64: payload.skinImageBase64 ?? null,
    skinImageMime: payload.skinImageMime ?? null,

    // Fallback opcional (URL):
    skinImageUrl: payload.skinImageUrl ?? null,

    detalhesEspecificos: payload.detalhesEspecificos ?? {},
  };
  const { data } = await api.put(`/anuncios/${id}`, body);
  return normalizarDoBackend(data);
}

export async function desativarAnuncio(id) {
  if (USE_DEV_API) {
    const arr = devLoad().map((x) =>
      String(x.id) === String(id) ? { ...x, ativo: false } : x,
    );
    devSave(arr);
    return;
  }
  await api.patch(`/anuncios/${id}/desativar`);
}

export async function reativarAnuncio(id) {
  if (USE_DEV_API) {
    const arr = devLoad().map((x) =>
      String(x.id) === String(id) ? { ...x, ativo: true } : x,
    );
    devSave(arr);
    return;
  }
  await api.patch(`/anuncios/${id}/reativar`);
}

export async function likeAnuncio(id) {
  if (USE_DEV_API) return;
  await api.post(`/anuncios/${id}/like`);
}
export async function unlikeAnuncio(id) {
  if (USE_DEV_API) return;
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
