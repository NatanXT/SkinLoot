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
        anuncio.planoNome ?? // <-- 1. Prioridade para o campo que o backend envia
        anuncio.plano ??     // <-- 2. Fallback
        anuncio.plan ??      // <-- 3. Fallback
        'gratuito'           // <-- 4. Default
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
    const sellerId = anuncio.usuarioId ?? anuncio.vendedorId ?? null;
    return {
        id,
        title,
        image,
        game,
        price: Number.isFinite(precoNum) ? precoNum : 0,
        currency: 'BRL',
        seller: { name: sellerName,id: sellerId },
        plan,
        likes,
        listedAt,
        ativo,
        _raw: anuncio,

        // campos que o Perfil usa
        skinNome: title,
        imagemUrl: image, // <- o Perfil lê aqui
        preco: Number.isFinite(precoNum) ? precoNum : 0,
        usuarioId: sellerId, // Para o DashboardVitrine ler diretamente
        usuarioNome: sellerName, // Já estava implícito, mas bom ter explícito
        planoNome: plan, // Para o DashboardVitrine ler diretamente
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

    // PROD: Envia o DTO completo conforme o novo AnuncioRequest do backend
    const body = {
        // Campos principais que permanecem
        titulo: payload.titulo,
        descricao: payload.descricao ?? '',
        preco: payload.preco,
        status: payload.status,
        skinId: payload.skinId ?? null,
        skinName: payload.skinName,

        // --- LÓGICA ATUALIZADA ---
        // REMOVIDO: O campo antigo que recebia um objeto JSON
        // detalhesEspecificos: payload.detalhesEspecificos,

        // ADICIONADOS: Os novos campos para a lógica de jogo específico
        jogoId: payload.jogoId,
        detalhesCsgo: payload.detalhesCsgo,
        detalhesLol: payload.detalhesLol,
        // --- FIM DA ATUALIZAÇÃO ---

        // Campos de imagem (sem alteração)
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
    // Campos que permanecem
    titulo: payload.titulo,
    descricao: payload.descricao ?? '',
    preco: payload.preco,
    status: payload.status,
    skinId: payload.skinId ?? null,
    skinName: payload.skinName,

    // --- CAMPOS ATUALIZADOS ---
    // REMOVIDO: detalhesEspecificos: payload.detalhesEspecificos,
    jogoId: payload.jogoId,                 // NOVO
    detalhesCsgo: payload.detalhesCsgo,     // NOVO
    detalhesLol: payload.detalhesLol,       // NOVO
    // --- FIM DAS ATUALIZAÇÕES ---

    // Campos de imagem (sem alteração)
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

// ================= BUSCAR POR ID =================
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
};
