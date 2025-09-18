// src/services/skins.js
// ============================================================================
// Serviços de Skins/Anúncios do usuário
// - getMinhasSkins(): lista skins do usuário
// - criarSkin(payload): cria nova skin
// - getPlanoLimit(plano): limite por plano
// Em MODO MOCK, semeia a lista a partir de MockSkins.js (com as mesmas imagens
// "/img/..." da vitrine) e persiste no localStorage (chave: dev_minhas_skins).
// ============================================================================

import api, { isDevAuth, DEV_API_ENABLED } from "./api";
// usa a mesma fonte de imagens da vitrine
import MockSkins from "../components/mock/MockSkins.js";

// Endpoints (AJUSTE AQUI CONFORME SEU BACKEND)
const ENDPOINT_MINHAS = "/skins/minhas";
const ENDPOINT_CRIAR  = "/skins";

// ---------- Limites por plano ----------
export function getPlanoLimit(plano) {
  const key = String(plano || "").toLowerCase();
  if (key.startsWith("inter")) return 50;   // intermediário
  if (key === "plus" || key === "premium") return Infinity;
  return 20; // gratuito/básico (default)
}

// ---------- Mocks (localStorage) ----------
const LS_KEY = "dev_minhas_skins";

/** Gera um preço “realista” pseudo-aleatório e estável por índice. */
function gerarPrecoPorIndice(i) {
  const base = 200 + ((i * 137) % 5400) + (i % 3 === 2 ? 800 : 0);
  return Math.round(base * 10) / 10; // 1 casa
}

/** Faz o primeiro seed a partir do MockSkins (se ainda não houver dados). */
function seedFromMock() {
  // Cria uma lista a partir do MockSkins com os mesmos caminhos de imagem ("/img/...")
  const seeded = MockSkins.map((s, i) => ({
    id: 1000 + i,                  // id fictício
    skinNome: s.nome,              // título
    preco: gerarPrecoPorIndice(i), // preço teste
    imagemUrl: s.imagemUrl,        // 🔑 mantém o mesmo caminho usado na vitrine
    // (campos extras opcionais)
  }));
  localStorage.setItem(LS_KEY, JSON.stringify(seeded));
  return seeded;
}

/** Lê as skins do storage; se vazio, semeia a partir do MockSkins. */
function lerSkinsDev() {
  const raw = localStorage.getItem(LS_KEY);
  if (raw) {
    try { return JSON.parse(raw); } catch { /* cai no seed */ }
  }
  return seedFromMock();
}

function salvarSkinsDev(lista) {
  localStorage.setItem(LS_KEY, JSON.stringify(lista));
}

// ---------- Serviços ----------
export async function getMinhasSkins() {
  if (DEV_API_ENABLED || isDevAuth()) {
    await new Promise((r) => setTimeout(r, 250));
    return lerSkinsDev(); // ✅ agora vem com as MESMAS imagens do MockSkins
  }

  const { data } = await api.get(ENDPOINT_MINHAS);
  return data;
}

export async function criarSkin(payload) {
  if (DEV_API_ENABLED || isDevAuth()) {
    await new Promise((r) => setTimeout(r, 200));
    const lista = lerSkinsDev();
    const novoId = Math.max(0, ...lista.map((s) => Number(s.id) || 0)) + 1;

    // Se o payload não trouxer imagem, usa uma do MockSkins cíclica só pra não quebrar
    const fallback = MockSkins[(novoId - 1000) % MockSkins.length]?.imagemUrl || "/img/placeholder.png";

    const nova = {
      id: novoId,
      skinNome: payload?.skinNome || payload?.nome || "Nova Skin",
      preco: Number(payload?.preco ?? gerarPrecoPorIndice(novoId)),
      imagemUrl: payload?.imagemUrl || fallback,
      ...payload,
    };
    lista.unshift(nova);
    salvarSkinsDev(lista);
    return nova;
  }

  const { data } = await api.post(ENDPOINT_CRIAR, payload);
  return data;
}
