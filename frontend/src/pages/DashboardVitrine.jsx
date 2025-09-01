// ======================================================
// DashboardVitrine.jsx
// Caminho: frontend/src/pages/DashboardVitrine.jsx
// - Ranking (plano + likes + recência)
// - Grid com cards grandes
// - Filtros c/ máscara BRL nos preços, Limpar filtros,
//   e sincronização de estado no URL (share/refresh).
// ======================================================

import { useEffect, useMemo, useState, useRef } from "react";
import { useAuth } from "../services/AuthContext"; // Importe o useAuth

import { Link, useNavigate } from "react-router-dom"; // Adicione useNavigate
import "./DashboardVitrine.css";
import MockSkins from "../components/mock/MockSkins.js";
import anuncioService from "../services/anuncioService"; // ✅ Importe o novo serviço




/* ---------- Metadados dos planos ---------- */
const plansMeta = {
  gratuito:      { label: "Gratuito",      weight: 1.0, color: "#454B54" },
  intermediario: { label: "Intermediário", weight: 1.6, color: "#00C896" },
  plus:          { label: "+ Plus",        weight: 2.2, color: "#39FF14" },
};

/* ---------- Defaults / URL helpers ---------- */
const DEFAULT_FILTERS = Object.freeze({
  search: "",
  game: "todos",
  plan: "todos",
  min: 0,
  max: 10000,
});
const DEFAULT_SORT = "relevancia";
const ALLOWED_SORT = new Set(["relevancia", "recentes", "preco_asc", "preco_desc"]);

const onlyDigits = (s) => (s || "").replace(/\D/g, "");
const brlPlain = (n) =>
  Number.isFinite(n)
    ? n.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : "0,00";

/** Lê filtros/sort do URL (se houver), senão usa defaults */
function readStateFromURL() {
  const p = new URLSearchParams(window.location.search);

  const search = p.get("q") ?? DEFAULT_FILTERS.search;
  const game = p.get("game") ?? DEFAULT_FILTERS.game;
  const plan = p.get("plan") ?? DEFAULT_FILTERS.plan;
  const min = Math.max(0, parseInt(p.get("min") ?? DEFAULT_FILTERS.min, 10) || 0);
  const max = Math.max(min, parseInt(p.get("max") ?? DEFAULT_FILTERS.max, 10) || DEFAULT_FILTERS.max);
  const sort = ALLOWED_SORT.has(p.get("sort")) ? p.get("sort") : DEFAULT_SORT;

  return {
    filters: { search, game, plan, min, max },
    sort,
  };
}

/** Escreve filtros/sort no URL (remove params que estão iguais aos defaults) */
function writeStateToURL(filters, sort, replace = true) {
  const p = new URLSearchParams();

  if (filters.search) p.set("q", filters.search);
  if (filters.game !== DEFAULT_FILTERS.game) p.set("game", filters.game);
  if (filters.plan !== DEFAULT_FILTERS.plan) p.set("plan", filters.plan);
  if (filters.min !== DEFAULT_FILTERS.min) p.set("min", String(filters.min));
  if (filters.max !== DEFAULT_FILTERS.max) p.set("max", String(filters.max));
  if (sort !== DEFAULT_SORT) p.set("sort", sort);

  const qs = p.toString();
  const newUrl = qs ? `?${qs}` : window.location.pathname;
  const method = replace ? "replaceState" : "pushState";
  window.history[method]({}, "", newUrl);
}

/* ---------- Mock enrichment ---------- */
function enrichFromMock(list) {
  const plans = ["gratuito", "intermediario", "plus"];
  return list.map((s, i) => ({
    id: String(i + 1),
    title: s.nome,
    image: s.imagemUrl,
    game: "CS2",
    price: Math.round((200 + (i * 137) % 5400 + (i % 3 === 2 ? 800 : 0)) * 10) / 10,
    currency: "BRL",
    seller: { name: `@seller_${i + 1}`, contactUrl: "#" },
    plan: plans[i % plans.length],
    likes: 20 + (i * 73) % 900,
    listedAt: Date.now() - (i + 1) * 1000 * 60 * 60 * (3 + (i % 6)),
  }));
}

/* ---------- Ranking ---------- */
function useRankedSkins(list, sortBy, filters) {
  return useMemo(() => {
    const now = Date.now();
    const rec = (t) => Math.max(0.6, 1.4 - (now - t) / (1000 * 60 * 60 * 72));

    let filtered = list.filter((s) =>
      (filters.plan === "todos" || s.plan === filters.plan) &&
      (filters.game === "todos" || s.game === filters.game) &&
      s.price >= filters.min &&
      s.price <= filters.max &&
      s.title.toLowerCase().includes(filters.search.toLowerCase())
    );

    const scored = filtered.map((s) => ({
      ...s,
      score: plansMeta[s.plan].weight * Math.pow(s.likes + 1, 0.5) * rec(s.listedAt),
    }));

    if (sortBy === "relevancia") return scored.sort((a, b) => b.score - a.score);
    if (sortBy === "preco_asc") return scored.sort((a, b) => a.price - b.price);
    if (sortBy === "preco_desc") return scored.sort((a, b) => b.price - a.price);
    if (sortBy === "recentes") return scored.sort((a, b) => b.listedAt - a.listedAt);
    return scored;
  }, [list, sortBy, filters]);
}

/* ====================================================== */
/*                      COMPONENTE                        */
/* ====================================================== */

export default function DashboardVitrine() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  // estado inicial vindo do URL (ou defaults)
  const initial = readStateFromURL();

  const [skins] = useState(() => enrichFromMock(MockSkins));
    const [anuncios, setAnuncios] = useState([]);

  const [likes, setLikes] = useState(() => new Set());
  const [sortBy, setSortBy] = useState(initial.sort);
  const [filters, setFilters] = useState(initial.filters);

  // estado visual dos inputs de preço (string mostrada no input)
  const [priceUI, setPriceUI] = useState({
    min: brlPlain(initial.filters.min),
    max: brlPlain(initial.filters.max),
  });

  // sincroniza URL quando filtros/ordenar mudam
  useEffect(() => {
    // garante min <= max
    if (filters.min > filters.max) {
      setFilters((f) => ({ ...f, max: f.min }));
      return;
    }
    writeStateToURL(filters, sortBy, true);
    // atualiza a UI dos prices quando filtros mudarem fora do input
    setPriceUI((p) => ({
      min: document.activeElement === minRef?.current ? p.min : brlPlain(filters.min),
      max: document.activeElement === maxRef?.current ? p.max : brlPlain(filters.max),
    }));
  }, [filters, sortBy]);

   useEffect(() => {
    anuncioService.getAnuncios()
      .then(response => {
        setAnuncios(response.data); // Salva os anúncios no estado
      })
      .catch(err => {
        console.error("Falha ao buscar anúncios:", err);
        setError("Não foi possível carregar os anúncios. Tente novamente mais tarde.");
      })
      .finally(() => {
        setLoading(false); // Finaliza o carregamento, com sucesso ou erro
      });
  }, []);

  const ranked = useRankedSkins(skins, sortBy, filters);

  const toggleLike = (id) =>
    setLikes((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });

  /* ---------- Price inputs: refs + handlers ---------- */
  const minRef = useRef(null);
  const maxRef = useRef(null);

  // Restringe teclado a dígitos e teclas de navegação/edição
  function allowOnlyDigitsKeyDown(e) {
    const allowed = [
      "Backspace", "Delete", "ArrowLeft", "ArrowRight", "Home", "End", "Tab", "Enter",
    ];
    const isCmd = e.ctrlKey || e.metaKey;
    const isShortcut = isCmd && ["a","c","v","x"].includes(e.key.toLowerCase());
    const isDigit = e.key >= "0" && e.key <= "9";
    const isNumpadDigit = e.code && /^Numpad[0-9]$/.test(e.code);
    if (allowed.includes(e.key) || isShortcut || isDigit || isNumpadDigit) return;
    e.preventDefault();
  }


  
  // Cola: mantém somente dígitos
  function handlePasteDigits(e, which) {
    const text = (e.clipboardData || window.clipboardData).getData("text");
    const cleaned = onlyDigits(text);
    e.preventDefault();
    setPriceUI((p) => ({ ...p, [which]: cleaned }));
    setFilters((f) => ({ ...f, [which]: cleaned ? parseInt(cleaned, 10) : 0 }));
  }

  // ----- MIN -----
  const handleMinChange = (e) => {
    const cleaned = onlyDigits(e.target.value);
    setPriceUI((p) => ({ ...p, min: cleaned }));
    setFilters((f) => ({ ...f, min: cleaned ? parseInt(cleaned, 10) : 0 }));
  };
  const handleMinFocus = () => {
    setPriceUI((p) => ({ ...p, min: filters.min ? String(Math.round(filters.min)) : "" }));
  };
  const handleMinBlur = () => {
    setPriceUI((p) => ({ ...p, min: brlPlain(filters.min) }));
  };

  // ----- MAX -----
  const handleMaxChange = (e) => {
    const cleaned = onlyDigits(e.target.value);
    setPriceUI((p) => ({ ...p, max: cleaned }));
    setFilters((f) => ({ ...f, max: cleaned ? parseInt(cleaned, 10) : 0 }));
  };
  const handleMaxFocus = () => {
    setPriceUI((p) => ({ ...p, max: filters.max ? String(Math.round(filters.max)) : "" }));
  };
  const handleMaxBlur = () => {
    setPriceUI((p) => ({ ...p, max: brlPlain(filters.max) }));
  };

  const handleLogout = async () => {
    try {
      await logout();
      // Opcional: redireciona para a home ou login após o logout
      navigate('/');
    } catch (error) {
      console.error("Falha ao fazer logout:", error);
      // Opcional: mostrar uma notificação de erro
    }
  };
  
  // Limpa filtros para defaults
  const handleClearFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setSortBy(DEFAULT_SORT);
    setPriceUI({ min: brlPlain(DEFAULT_FILTERS.min), max: brlPlain(DEFAULT_FILTERS.max) });
    writeStateToURL(DEFAULT_FILTERS, DEFAULT_SORT, false);
  };

  return (
    <div className="dash-root">
      <div className="backdrop" aria-hidden />

      {/* Topbar */}
      <div className="topbar">
        <div className="brand">
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path fill="currentColor" d="M12 2L2 7l10 5 10-5-10-5Zm0 7L2 4v13l10 5 10-5V4l-10 5Z"/>
          </svg>
          <span>SkinLoot</span>
        </div>
        <nav>
          <a href="#grid">Explorar</a>
          <a href="#planos">Planos</a>
          <a href="#">Anunciar</a>
        </nav>
        <div className="actions">
          {user ? (
            // Se o usuário ESTIVER logado
            <>
              <span className="welcome-user">Olá, {user.nome}!</span>
              <button onClick={handleLogout} className="btn btn--ghost sm">Sair</button>
            </>
          ) : (
            // Se o usuário NÃO estiver logado
            <>
              <Link to="/login" className="btn btn--ghost sm">Entrar</Link>
              <Link to="/cadastro" className="btn btn--primary sm">Criar conta</Link>
            </>
          )}
        </div>
      </div>

      {/* Hero */}
      <header className="hero">
        <div className="hero__copy">
          <h1>Vitrine das Skins</h1>
          <p>Somos apenas a vitrine. Anuncie, favorite e, ao comprar, redirecionamos para o site do vendedor.</p>
          <div className="hero__cta">
            <a className="btn btn--primary" href="#grid">Explorar Skins</a>
            <a className="btn btn--ghost" href="#planos">Planos de Destaque</a>
          </div>
        </div>
      </header>

      {/* Filtros */}
      <section className="filters" id="grid">
        <div className="filters__row">
          <div className="field field--search">
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="currentColor" d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16a6.471 6.471 0 0 0 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5Zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14Z"/>
            </svg>
            <input
              placeholder="Buscar skins..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
          </div>

          <div className="field">
            <label>Jogo</label>
            <select
              value={filters.game}
              onChange={(e) => setFilters({ ...filters, game: e.target.value })}
            >
              <option value="todos">Todos</option>
              <option value="CS2">CS2</option>
            </select>
          </div>

          <div className="field">
            <label>Plano</label>
            <select
              value={filters.plan}
              onChange={(e) => setFilters({ ...filters, plan: e.target.value })}
            >
              <option value="todos">Todos</option>
              <option value="gratuito">Gratuito</option>
              <option value="intermediario">Intermediário</option>
              <option value="plus">Plus</option>
            </select>
          </div>

          <div className="field">
            <label>Ordenar</label>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="relevancia">Relevância (plano + likes + recência)</option>
              <option value="recentes">Mais recentes</option>
              <option value="preco_asc">Preço: menor → maior</option>
              <option value="preco_desc">Preço: maior → menor</option>
            </select>
          </div>

          {/* Preço com máscara e prefixo "R$" */}
          <div className="range">
            <label>Preço</label>
            <div className="range__inputs">
              <div className="money">
                <span className="money__prefix">R$</span>
                <input
                  ref={minRef}
                  className="money__field"
                  type="text"
                  inputMode="numeric"
                  pattern="\d*"
                  aria-label="Preço mínimo"
                  value={priceUI.min}
                  onChange={handleMinChange}
                  onFocus={handleMinFocus}
                  onBlur={handleMinBlur}
                  onKeyDown={allowOnlyDigitsKeyDown}
                  onPaste={(e) => handlePasteDigits(e, "min")}
                  placeholder={brlPlain(DEFAULT_FILTERS.min)}
                />
              </div>

              <span>—</span>

              <div className="money">
                <span className="money__prefix">R$</span>
                <input
                  ref={maxRef}
                  className="money__field"
                  type="text"
                  inputMode="numeric"
                  pattern="\d*"
                  aria-label="Preço máximo"
                  value={priceUI.max}
                  onChange={handleMaxChange}
                  onFocus={handleMaxFocus}
                  onBlur={handleMaxBlur}
                  onKeyDown={allowOnlyDigitsKeyDown}
                  onPaste={(e) => handlePasteDigits(e, "max")}
                  placeholder={brlPlain(DEFAULT_FILTERS.max)}
                />
              </div>
            </div>
          </div>

          {/* Ações dos filtros */}
          <div className="filters__actions">
            <button className="btn btn--ghost" onClick={handleClearFilters}>
              Limpar filtros
            </button>
          </div>
        </div>
      </section>

       {/* Grid de Cards */}
      <section className="grid">
        {ranked.map((anuncio) => (
          // Agora passamos o objeto 'anuncio' para o SkinCard
          <SkinCard
            key={anuncio.id} // Use o ID do anúncio
            data={anuncio}
            liked={likes.has(anuncio.id)}
            onLike={() => toggleLike(anuncio.id)}
          />
        ))}
      </section>

      {/* Planos */}
      <section id="planos" className="plans">
        <h2>Planos de Destaque</h2>
        <div className="plans__grid">
          {Object.entries(plansMeta).map(([key, p]) => (
            <div key={key} className={`plan plan--${key}`} style={{ "--plan": p.color }}>
              <h3>{p.label}</h3>
              <ul>
                <li>Prioridade de exibição: <strong>{p.weight}x</strong></li>
                <li>Badge de destaque</li>
                <li>Suporte via e-mail</li>
                {key !== "gratuito" && <li>Relatórios de visualização</li>}
                {key === "plus" && <li>Spotlight na página inicial</li>}
              </ul>
              <button className="btn btn--primary">Assinar</button>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="foot">
        <p>© {new Date().getFullYear()} SkinLoot — Nós apenas conectamos vendedor e comprador.</p>
      </footer>
    </div>
  );
}

/* ---------- Card (componente) ---------- */
function SkinCard({ data, liked, onLike }) {
  const { plan } = data;
  return (
    <article className={`card card--${plan}`} style={{ "--glow": plansMeta[plan].color }}>
      <div className="card__media">
        {/* Imagens do Mock devem estar em /public/img (caminho absoluto /img/...) */}
        <img src={data.image} alt={data.title} loading="lazy" />
        <span className="badge" style={{ background: plansMeta[plan].color }}>{plansMeta[plan].label}</span>
        <button className={`like ${liked ? "is-liked" : ""}`} onClick={onLike} aria-label="Favoritar">
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path fill="currentColor" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 6 4 4 6.5 4c1.74 0 3.41 1.01 4.22 2.53C11.09 5.01 12.76 4 14.5 4 17 4 19 6 19 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
        </button>
      </div>

      <div className="card__body">
        <h3>{data.title}</h3>
        <div className="meta">
          <span className="price">
            {data.currency === "BRL" ? "R$" : data.currency}{" "}
            {data.price.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </span>
          <span className="likes">{data.likes} likes</span>
        </div>
        <div className="seller">
          <span>Vendedor: {data.seller.name}</span>
          <div className="cta">
            <a className="btn btn--ghost" href={data.seller.contactUrl} target="_blank" rel="noreferrer">Contato</a>
            <a className="btn btn--primary" href={data.seller.contactUrl} target="_blank" rel="noreferrer">Comprar fora</a>
          </div>
        </div>
      </div>
    </article>
  );
}
