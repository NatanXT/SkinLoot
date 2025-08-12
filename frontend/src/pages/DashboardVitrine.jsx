// ======= DashboardVitrine.jsx =======
// Caminho sugerido: frontend/src/pages/DashboardVitrine.jsx
// Lembre-se de criar também o arquivo CSS abaixo e importar aqui.

import { useMemo, useState } from "react";
import "./DashboardVitrine.css";
import MockSkins from "../components/mock/MockSkins.js";

const plansMeta = {
  gratuito: { label: "Gratuito", weight: 1, color: "#454B54" },
  intermediario: { label: "Intermediário", weight: 1.6, color: "#00C896" },
  plus: { label: "+ Plus", weight: 2.2, color: "#39FF14" },
};

function enrichFromMock(list) {
  // Adiciona preço, vendedor, plano e métricas de forma determinística (para demo)
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

function useRankedSkins(list, sortBy, filters) {
  return useMemo(() => {
    const now = Date.now();
    const rec = (t) => Math.max(0.6, 1.4 - (now - t) / (1000 * 60 * 60 * 72));

    let filtered = list.filter((s) =>
      (filters.plan === "todos" || s.plan === filters.plan) &&
      (filters.game === "todos" || s.game === filters.game) &&
      s.price >= filters.min && s.price <= filters.max &&
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

export default function DashboardVitrine() {
  const [skins] = useState(() => enrichFromMock(MockSkins));
  const [likes, setLikes] = useState(() => new Set());
  const [sortBy, setSortBy] = useState("relevancia");
  const [filters, setFilters] = useState({ search: "", game: "todos", plan: "todos", min: 0, max: 10000 });

  const ranked = useRankedSkins(skins, sortBy, filters);

  const toggleLike = (id) => setLikes((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  return (
    <div className="dash-root">
      <div className="backdrop" aria-hidden />

      <div className="topbar">
        <div className="brand">
          <svg width="20" height="20" viewBox="0 0 24 24"><path fill="currentColor" d="M12 2L2 7l10 5 10-5-10-5Zm0 7L2 4v13l10 5 10-5V4l-10 5Z"/></svg>
          <span>SkinLoot</span>
        </div>
        <nav>
          <a href="#grid">Explorar</a>
          <a href="#planos">Planos</a>
          <a href="#">Anunciar</a>
        </nav>
        <div className="actions">
          <button className="btn btn--ghost sm">Entrar</button>
          <button className="btn btn--primary sm">Criar conta</button>
        </div>
      </div>

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

      <section className="filters" id="grid">
        <div className="filters__row">
          <div className="field field--search">
            <svg width="18" height="18" viewBox="0 0 24 24"><path fill="currentColor" d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16a6.471 6.471 0 0 0 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5Zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14Z"/></svg>
            <input placeholder="Buscar skins..." value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} />
          </div>

          <div className="field">
            <label>Jogo</label>
            <select value={filters.game} onChange={(e) => setFilters({ ...filters, game: e.target.value })}>
              <option value="todos">Todos</option>
              <option value="CS2">CS2</option>
            </select>
          </div>

          <div className="field">
            <label>Plano</label>
            <select value={filters.plan} onChange={(e) => setFilters({ ...filters, plan: e.target.value })}>
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

          <div className="range">
            <label>Preço</label>
            <div className="range__inputs">
              <input type="number" min={0} value={filters.min} onChange={(e) => setFilters({ ...filters, min: Number(e.target.value) })} />
              <span>—</span>
              <input type="number" min={0} value={filters.max} onChange={(e) => setFilters({ ...filters, max: Number(e.target.value) })} />
            </div>
          </div>
        </div>
      </section>

      <section className="grid">
        {ranked.map((s) => (
          <SkinCard key={s.id} data={s} liked={likes.has(s.id)} onLike={() => toggleLike(s.id)} />
        ))}
      </section>

      <section id="planos" className="plans">
        <h2>Planos de Destaque</h2>
        <div className="plans__grid">
          {Object.entries(plansMeta).map(([key, p]) => (
            <div key={key} className={`plan plan--${key}`} style={{"--plan": p.color}}>
              <h3>{p.label}</h3>
              <ul>
                <li>Prioridade de exibição: <strong>{p.weight}x</strong></li>
                <li>Badge de destaque</li>
                <li>Suporte via e‑mail</li>
                {key !== "gratuito" && <li>Relatórios de visualização</li>}
                {key === "plus" && <li>Spotlight na página inicial</li>}
              </ul>
              <button className="btn btn--primary">Assinar</button>
            </div>
          ))}
        </div>
      </section>

      <footer className="foot">
        <p>© {new Date().getFullYear()} SkinLoot — Nós apenas conectamos vendedor e comprador.</p>
      </footer>
    </div>
  );
}

function SkinCard({ data, liked, onLike }) {
  const { plan } = data;
  return (
    <article className={`card card--${plan}`} style={{"--glow": plansMeta[plan].color}}>
      <div className="card__media">
        {/* Imagens do Mock devem estar em public/img, pois o caminho começa com /img */}
        <img src={data.image} alt={data.title} loading="lazy" />
        <span className="badge" style={{ background: plansMeta[plan].color }}>{plansMeta[plan].label}</span>
        <button className={`like ${liked ? "is-liked" : ""}`} onClick={onLike} aria-label="Favoritar">
          <svg width="20" height="20" viewBox="0 0 24 24"><path fill="currentColor" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 6 4 4 6.5 4c1.74 0 3.41 1.01 4.22 2.53C11.09 5.01 12.76 4 14.5 4 17 4 19 6 19 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
        </button>
      </div>
      <div className="card__body">
        <h3>{data.title}</h3>
        <div className="meta">
          <span className="price">{data.currency === "BRL" ? "R$" : data.currency} {data.price.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
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