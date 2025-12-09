
// import { api } from './api'; // assinatura mantida p/ futura API 
import MockSkins from '../components/mock/MockSkins'; 

const CHAVE_STORE = 'minhas_skins';

// Helpers de mock
function lerStore() {
  try {
    const raw = localStorage.getItem(CHAVE_STORE);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
function salvarStore(lista) {
  try { localStorage.setItem(CHAVE_STORE, JSON.stringify(lista)); } catch {}
}

/** Converte File -> DataURL para pré-visualizar/guardar localmente. */
function fileParaDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => resolve(reader.result);
    reader.readAsDataURL(file);
  });
}

// services/skins.js
export async function criarSkin(payload = {}) {
  const lista = lerStore();

  // gera id único simples
  const id = `SKN-${Date.now()}`;

  let novaImagem = null;
  if (payload.imagemFile instanceof File) {
    novaImagem = await fileParaDataUrl(payload.imagemFile);
  } else if (typeof payload.imagemUrl === 'string' && payload.imagemUrl.trim()) {
    novaImagem = String(payload.imagemUrl).trim();
  }

  const novaSkin = {
    id,
    skinNome: String(payload.skinNome || 'Nova Skin'),
    preco: Number(payload.preco) || 0,
    imagemUrl: novaImagem || '/img/placeholder.png',
    ativo: true,
  };

  lista.push(novaSkin);
  salvarStore(lista);
  await new Promise(r => setTimeout(r, 200));
  return novaSkin;
}

export async function getMinhasSkins() {
  let lista = lerStore();
  if (!Array.isArray(lista) || lista.length === 0 || lista.some(s => !s.imagemUrl)) {
    lista = (MockSkins || []).map((item, idx) => {
      const idNum = 1001 + idx;
      const precoBase = 59.9 + (idx % 7) * 10;
      return {
        id: `SKN-${idNum}`,
        skinNome: item.nome || `Skin ${idNum}`,
        preco: Number(precoBase.toFixed(2)),
        imagemUrl: item.imagemUrl, // já é uma URL absoluta gerada pelo bundler
        ativo: true,
      };
    });
    salvarStore(lista);
  }
  await new Promise(r => setTimeout(r, 150));
  return lista;
}

export function getPlanoLimit(planoKey) {
  switch (String(planoKey).toLowerCase()) {
    case 'gratuito':      return 5;
    case 'intermediario': return 20;
    case 'plus':          return Infinity;
    default:              return 5;
  }
}

/**
 * Edita uma skin.
 * payload: { skinNome?: string, preco?: number, imagemUrl?: string, imagemFile?: File }
 * - Se imagemFile vier, salva como DataURL no mock (preview imediato).
 * - Se imagemUrl vier, usa a URL.
 */
export async function editarSkin(id, payload = {}) {
  const lista = lerStore();
  const idx = lista.findIndex(s => String(s.id) === String(id));
  if (idx === -1) throw new Error('Skin não encontrada');

  let novaImagem = undefined;

  // Prioridade: arquivo > URL
  if (payload.imagemFile instanceof File) {
    novaImagem = await fileParaDataUrl(payload.imagemFile);
  } else if (typeof payload.imagemUrl === 'string' && payload.imagemUrl.trim()) {
    novaImagem = String(payload.imagemUrl).trim();
  }

  const atual = lista[idx];
  const atualizado = {
    ...atual,
    ...(payload.skinNome != null ? { skinNome: String(payload.skinNome) } : {}),
    ...(payload.preco != null    ? { preco: Number(payload.preco) }      : {}),
    ...(novaImagem != null       ? { imagemUrl: novaImagem }             : {}),
  };

  lista[idx] = atualizado;
  salvarStore(lista);
  await new Promise(r => setTimeout(r, 200));
  return atualizado;

  // const form = new FormData();
  // if (payload.skinNome) form.append('skinNome', payload.skinNome);
  // if (payload.preco!=null) form.append('preco', payload.preco);
  // if (payload.imagemFile) form.append('imagem', payload.imagemFile);
  // if (payload.imagemUrl) form.append('imagemUrl', payload.imagemUrl);
  // const { data } = await api.put(`/skins/${id}`, form);
  // return data;
}

/**
 * Desativa uma skin (soft delete).
 * @param {string} id
 * @returns {Promise<{id:string, ativo:boolean}>}
 */
export async function desativarSkin(id) {
  const lista = lerStore();
  const idx = lista.findIndex(s => String(s.id) === String(id));
  if (idx === -1) throw new Error('Skin não encontrada');

  lista[idx] = { ...lista[idx], ativo: false };
  salvarStore(lista);

  await new Promise(r => setTimeout(r, 200));

  // const { data } = await api.post(`/skins/${id}/desativar`);
  // return data;

  return { id, ativo: false };
}

/**
 * Reativa uma skin (marca ativo=true).
 * @param {string} id
 * @returns {Promise<{id:string, ativo:boolean}>}
 */
export async function reativarSkin(id) {
  const lista = lerStore();
  const idx = lista.findIndex(s => String(s.id) === String(id));
  if (idx === -1) throw new Error('Skin não encontrada');

  lista[idx] = { ...lista[idx], ativo: true };
  salvarStore(lista);

  await new Promise(r => setTimeout(r, 200));

  // const { data } = await api.post(`/skins/${id}/reativar`);
  // return data;

  return { id, ativo: true };
}
