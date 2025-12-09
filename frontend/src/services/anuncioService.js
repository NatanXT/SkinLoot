// frontend/src/services/anuncioService.js
import api from './api';

const USE_DEV_API = import.meta.env.VITE_ENABLE_DEV_API === 'true';
const LS_KEY = 'dev_skins';

//  helpers DEV (localStorage) 
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

//  Normalização (quando usar backend) 
function normalizarDoBackend(anuncio = {}) {
  const id = anuncio.id ?? anuncio.uuid ?? anuncio._id ?? uid();
  const title =
    anuncio.skinNome ??
    anuncio.skinName ??
    anuncio.titulo ??
    anuncio.nome ??
    'Skin';

  // Monta imagem preferindo Base64
  let image = '';
  if (anuncio.skinImageBase64) {
    const mime = anuncio.skinImageMime || 'image/*';
    image = `data:${mime};base64,${anuncio.skinImageBase64}`;
  } else {
    image =
      anuncio.skinIcon ??
      anuncio.skinImageUrl ??
      anuncio.skin_image_url ??
      anuncio.imagemUrl ??
      anuncio.imagem ??
      anuncio.fotoUrl ??
      '';
  }

  // Agora com suporte aos novos campos do backend (e correção do nome do jogo)
  let jogo = anuncio.jogo || null;

  // Detecta automaticamente o nome do jogo se vier vazio
  if (!jogo || Object.keys(jogo).length === 0) {
    if (anuncio.cs2 || anuncio.detalhesCsgo || anuncio.detalhes_csgo) {
      jogo = { nome: 'CS:GO' };
    } else if (anuncio.lol || anuncio.detalhesLol || anuncio.detalhes_lol) {
      jogo = { nome: 'League of Legends' };
    }
  }

  const detalhesCsgo =
    anuncio.detalhesCsgo ||
    anuncio.detalhes_csgo ||
    anuncio.cs2 || // suporte ao backend atual
    null;

  const detalhesLol =
    anuncio.detalhesLol ||
    anuncio.detalhes_lol ||
    anuncio.lol || // suporte ao backend atual
    null;

  // Corrige caso o championName venha null (usa skinNome ou titulo)
  if (detalhesLol && !detalhesLol.championName) {
    detalhesLol.championName =
      anuncio.skinNome || anuncio.titulo || anuncio.nome || '—';
  }

  const game = jogo?.nome ?? anuncio.jogoNome ?? 'CS2';
  const precoNum = Number(anuncio.preco ?? anuncio.price ?? anuncio.valor ?? 0);
  const plan = String(
    anuncio.planoNome ?? anuncio.plano ?? anuncio.plan ?? 'gratuito',
  ).toLowerCase();
  const sellerName = anuncio.usuarioNome ?? anuncio.vendedorNome ?? '—';
  const sellerId = anuncio.usuarioId ?? anuncio.vendedorId ?? null;
  const status = anuncio.status ?? anuncio._status;
  const ativo = String(status || 'ATIVO').toUpperCase() === 'ATIVO';
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

  return {
    id,
    title,
    image,
    game,
    price: Number.isFinite(precoNum) ? precoNum : 0,
    currency: 'BRL',
    seller: { name: sellerName, id: sellerId },
    plan,
    likes,
    listedAt,
    ativo,
    _raw: {
      ...anuncio,
      jogo,
      detalhesCsgo,
      detalhesLol,
    },

    // campos extras usados por componentes
    skinNome: title,
    imagemUrl: image,
    preco: Number.isFinite(precoNum) ? precoNum : 0,
    usuarioId: sellerId,
    usuarioNome: sellerName,
    planoNome: plan,
  };
}

//  BUSCAR POR ID 
export async function buscarPorId(id) {
  if (USE_DEV_API) {
    // DEV: busca no localStorage
    const arr = devLoad();
    const encontrado = arr.find((x) => String(x.id) === String(id));
    return (
      encontrado || {
        id,
        skinNome: 'Skin não encontrada',
        preco: 0,
        imagemUrl: '/img/placeholder.png',
        ativo: false,
        descricao: 'Sem descrição (modo DEV)',
      }
    );
  }

  // PROD: busca via backend real
  const { data } = await api.get(`/anuncios/${id}`);
  return normalizarDoBackend(data);
}

//  LISTAGENS 
function extrairArray(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.content)) return data.content;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.results)) return data.results;
  return [];
}

export async function listarMinhasNormalizadas() {
  if (USE_DEV_API) {
    return devLoad();
  }
  const { data } = await api.get('/anuncios/user');
  return extrairArray(data).map(normalizarDoBackend);
}

export async function listarFeedNormalizado() {
  if (USE_DEV_API) {
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

//  CRUD 
export async function criarAnuncio(payload) {
  const body = {
    titulo: payload.titulo,
    descricao: payload.descricao ?? '',
    preco: payload.preco,
    status: payload.status,
    skinId: payload.skinId ?? null,
    skinName: payload.skinName,
    jogoId: payload.jogoId,
    detalhesCsgo: payload.detalhesCsgo,
    detalhesLol: payload.detalhesLol,
    skinImageUrl: payload.skinImageUrl,
    skinImageBase64: payload.skinImageBase64,
    skinImageMime: payload.skinImageMime,
  };

  const { data } = await api.post('/anuncios/save', body);
  return normalizarDoBackend(data);
}

export async function editarAnuncio(id, payload) {
  if (USE_DEV_API) {
    const arr = devLoad();
    const i = arr.findIndex((x) => String(x.id) === String(id));
    if (i >= 0) {
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

  const body = {
    titulo: payload.titulo,
    descricao: payload.descricao ?? '',
    preco: payload.preco,
    status: payload.status,
    skinId: payload.skinId ?? null,
    skinName: payload.skinName,
    jogoId: payload.jogoId,
    detalhesCsgo: payload.detalhesCsgo,
    detalhesLol: payload.detalhesLol,
    skinImageUrl: payload.skinImageUrl,
    skinImageBase64: payload.skinImageBase64,
    skinImageMime: payload.skinImageMime,
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

export async function buscarAvaliacoesDoVendedor(usuarioId) {
  if (USE_DEV_API) {
    // Mock simples para desenvolvimento sem backend
    return [];
  }
  const { data } = await api.get(`/avaliacoes/usuario/${usuarioId}`);
  return data;
}

export async function enviarAvaliacao(payload) {
  if (USE_DEV_API) {
    console.log('DEV: Avaliação enviada', payload);
    return { success: true };
  }

  // O backend espera um objeto que corresponda ao DTO AvaliacaoRequest
  const body = {
    avaliadoId: payload.vendedorId, // O ID de quem recebe a avaliação
    anuncioId: payload.anuncioId,   // Opcional, para vincular ao anúncio
    nota: payload.nota,
    comentario: payload.comentario
  };

  const { data } = await api.post('/avaliacoes', body);
  return data;
}


export default {
  listarMinhasNormalizadas,
  listarFeedNormalizado,
  buscarPorId,
  criarAnuncio,
  editarAnuncio,
  desativarAnuncio,
  reativarAnuncio,
  likeAnuncio,
  unlikeAnuncio,
  buscarAvaliacoesDoVendedor,
  enviarAvaliacao
};
