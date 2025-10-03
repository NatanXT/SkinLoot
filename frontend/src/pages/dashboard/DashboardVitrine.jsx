// ======================================================
// DashboardVitrine.jsx
// Caminho: frontend/src/pages/dashboard/DashboardVitrine.jsx
// - Ranking (plano + likes + recência)
// - Grid com cards grandes
// - Filtros c/ máscara BRL nos preços, Limpar filtros,
//   e sincronização de estado no URL (share/refresh).
// - Scroll suave (manual) com compensação da topbar
// - [Logado] Avatar com menu: atraso no mouseout + “pin” ao clicar,
//   fecha ao clicar fora ou pressionar ESC.
// - Botão Contato abre ChatFlutuante; mini-botão quando fechado.
// - ✅ Mistura as skins mockadas com as skins do usuário logado.
// - ✅ NOVO: “Mensagens” só aparece logado; “Contato”/“Comprar fora” redirecionam ao login se anônimo.
// ======================================================

import { useEffect, useMemo, useState, useRef } from 'react';
import { useAuth } from '../../services/AuthContext.jsx';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './DashboardVitrine.css';
import MockSkins from '../../components/mock/MockSkins.js';
import AuthBrand from '../../components/logo/AuthBrand.jsx';
import ChatFlutuante from '../../components/chat/ChatFlutuante';

// Service para pegar minhas skins no backend
import anuncioService from '../../services/anuncioService.js';

/* ---------- Metadados dos planos ---------- */
const plansMeta = {
  gratuito: { label: 'Gratuito', weight: 1.0, color: '#454B54' },
  intermediario: { label: 'Intermediário', weight: 1.6, color: '#00C896' },
  plus: { label: '+ Plus', weight: 2.2, color: '#39FF14' },
};

/* ---------- Defaults / URL helpers ---------- */
const DEFAULT_FILTERS = Object.freeze({
  search: '',
  game: 'todos',
  plan: 'todos',
  min: 0,
  max: 10000,
});
const DEFAULT_SORT = 'relevancia';
const ALLOWED_SORT = new Set([
  'relevancia',
  'recentes',
  'preco_asc',
  'preco_desc',
]);

const onlyDigits = (s) => (s || '').replace(/\D/g, '');
const brlPlain = (n) =>
  Number.isFinite(n)
    ? n.toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    : '0,00';

/** Lê filtros/sort do URL (se houver), senão usa defaults */
function readStateFromURL() {
  const p = new URLSearchParams(window.location.search);
  const search = p.get('q') ?? DEFAULT_FILTERS.search;
  const game = p.get('game') ?? DEFAULT_FILTERS.game;
  const plan = p.get('plan') ?? DEFAULT_FILTERS.plan;
  const min = Math.max(
    0,
    parseInt(p.get('min') ?? DEFAULT_FILTERS.min, 10) || 0,
  );
  const max = Math.max(
    min,
    parseInt(p.get('max') ?? DEFAULT_FILTERS.max, 10) || DEFAULT_FILTERS.max,
  );
  const sort = ALLOWED_SORT.has(p.get('sort')) ? p.get('sort') : DEFAULT_SORT;
  return { filters: { search, game, plan, min, max }, sort };
}

/** Escreve filtros/sort no URL (remove params iguais aos defaults) */
function writeStateToURL(filters, sort, replace = true) {
  const p = new URLSearchParams();
  if (filters.search) p.set('q', filters.search);
  if (filters.game !== DEFAULT_FILTERS.game) p.set('game', filters.game);
  if (filters.plan !== DEFAULT_FILTERS.plan) p.set('plan', filters.plan);
  if (filters.min !== DEFAULT_FILTERS.min) p.set('min', String(filters.min));
  if (filters.max !== DEFAULT_FILTERS.max) p.set('max', String(filters.max));
  if (sort !== DEFAULT_SORT) p.set('sort', sort);
  const qs = p.toString();
  const newUrl = qs ? `?${qs}` : window.location.pathname;
  const method = replace ? 'replaceState' : 'pushState';
  window.history[method]({}, '', newUrl);
}

/* ---------- Mock enrichment ---------- */
function enrichFromMock(list) {
  const plans = ['gratuito', 'intermediario', 'plus'];
  return list.map((s, i) => ({
    id: `mock-${i + 1}`,
    title: s.nome,
    image: s.imagemUrl,
    game: 'CS2',
    price:
      Math.round((200 + ((i * 137) % 5400) + (i % 3 === 2 ? 800 : 0)) * 10) /
      10,
    currency: 'BRL',
    seller: { name: `@seller_${i + 1}`, contactUrl: '#' }, // contactUrl só vale quando logado
    plan: plans[i % plans.length],
    likes: 20 + ((i * 73) % 900),
    listedAt: Date.now() - (i + 1) * 1000 * 60 * 60 * (3 + (i % 6)),
  }));
}

/** Junta mock + minhas evitando duplicidades visuais */
function juntarSemDuplicar(listaA, listaB) {
  const chave = (x) =>
    `${(x.title || '').toLowerCase()}|${Number(x.price || 0)}`;
  const set = new Set();
  const saida = [];
  for (const item of [...listaB, ...listaA]) {
    const k = chave(item);
    if (set.has(k)) continue;
    set.add(k);
    saida.push(item);
  }
  return saida;
}

/* ---------- Ranking ---------- */
function useRankedSkins(list, sortBy, filters) {
  return useMemo(() => {
    const now = Date.now();
    const rec = (t) => Math.max(0.6, 1.4 - (now - t) / (1000 * 60 * 60 * 72));

    let filtrados = list.filter(
      (s) =>
        (filters.plan === 'todos' || s.plan === filters.plan) &&
        (filters.game === 'todos' || s.game === filters.game) &&
        s.price >= filters.min &&
        s.price <= filters.max &&
        (s.title || '').toLowerCase().includes(filters.search.toLowerCase()),
    );

    const pontuados = filtrados.map((s) => {
      const meta = plansMeta[s.plan] || { weight: 1.0 };
      return {
        ...s,
        score:
          meta.weight *
          Math.pow((s.likes ?? 0) + 1, 0.5) *
          rec(s.listedAt ?? now),
      };
    });

    if (sortBy === 'relevancia')
      return pontuados.sort((a, b) => b.score - a.score);
    if (sortBy === 'preco_asc')
      return pontuados.sort((a, b) => a.price - b.price);
    if (sortBy === 'preco_desc')
      return pontuados.sort((a, b) => b.price - a.price);
    if (sortBy === 'recentes')
      return pontuados.sort((a, b) => (b.listedAt ?? 0) - (a.listedAt ?? 0));
    return pontuados;
  }, [list, sortBy, filters]);
}

/* ========= smooth scroll util ========= */
function smoothScrollToY(toY, duration = 500) {
  const startY = window.scrollY || window.pageYOffset || 0;
  const distance = toY - startY;
  const startTime = performance.now();
  const easeInOutCubic = (t) =>
    t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  function step(now) {
    const elapsed = now - startTime;
    const t = Math.min(1, elapsed / duration);
    const eased = easeInOutCubic(t);
    window.scrollTo(0, startY + distance * eased);
    if (t < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

/* ====================================================== */
/*                      COMPONENTE                        */
/* ====================================================== */

export default function DashboardVitrine() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation(); // ✅ usado para guardar rota de retorno pós-login

  // estado inicial vindo do URL (ou defaults)
  const initial = readStateFromURL();

  // Mock e Minhas
  const [skinsMock] = useState(() => enrichFromMock(MockSkins));
  const [minhasSkins, setMinhasSkins] = useState([]);
  const [feedApi, setFeedApi] = useState([]);
  const [carregandoMinhas, setCarregandoMinhas] = useState(false);
  const [erroMinhas, setErroMinhas] = useState('');

  // UI
  const [likes, setLikes] = useState(() => new Set());
  const [sortBy, setSortBy] = useState(initial.sort);
  const [filters, setFilters] = useState(initial.filters);

  // Chat
  const [chatAberto, setChatAberto] = useState(null); // { id, nome }
  const [unreads, setUnreads] = useState(0);

  // --------- ✅ Guardião de login para ações protegidas ----------
  /**
   * exigirLogin
   * - Se não houver usuário autenticado, navega para /login passando:
   *   - returnTo: rota atual (para redirecionar de volta após autenticar)
   *   - acao + payload: ação pretendida (ex.: "contato" ou "comprar_fora")
   * - Retorna true se a ação foi bloqueada (precisa logar), false se pode continuar.
   */
  function exigirLogin(acao, payload) {
    if (!user) {
      navigate('/login', {
        state: {
          returnTo: location.pathname + location.search,
          acao,
          payload,
        },
        replace: true,
      });
      return true; // bloqueado
    }
    return false; // permitido
  }

  // Abre o chat com o vendedor (somente logado)
  function abrirChatPara(anuncio) {
    // 🔒 Se não estiver logado, manda pro login e para aqui
    if (exigirLogin('contato', { anuncioId: anuncio?.id })) return;

    const nome =
      anuncio?.usuarioNome ??
      anuncio?.seller?.name ??
      anuncio?.vendedorNome ??
      'Usuário';
    const id =
      anuncio?.usuarioId ??
      anuncio?.seller?.id ??
      anuncio?.vendedorId ??
      `temp-${anuncio?.id}`;
    setChatAberto({ id, nome });
    setUnreads(0);
  }

  // Abrir o link externo de compra (somente logado)
  function comprarFora(anuncio) {
    // 🔒 Guardião de login
    if (exigirLogin('comprar_fora', { anuncioId: anuncio?.id })) return;

    // Quando estiver logado, tenta abrir o link externo
    const url =
      anuncio?.linkExterno ||
      anuncio?._raw?.linkExterno ||
      anuncio?.seller?.contactUrl ||
      anuncio?._raw?.urlCompra ||
      '#';

    if (url && url !== '#') {
      window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      // Se não houver link no objeto, você pode:
      // - Abrir o chat como fallback
      // - Ou mostrar um aviso/toast
      abrirChatPara(anuncio);
    }
  }

  // estado visual dos inputs de preço (string mostrada no input)
  const [priceUI, setPriceUI] = useState({
    min: brlPlain(initial.filters.min),
    max: brlPlain(initial.filters.max),
  });

  // Busca minhas skins quando loga/troca usuário
  useEffect(() => {
    let ativo = true;
    async function carregarMinhas() {
      if (!user) {
        setMinhasSkins([]);
        return;
      }
      try {
        setCarregandoMinhas(true);
        setErroMinhas('');
        const lista = await anuncioService.listarMinhasNormalizadas();
        if (!ativo) return;
        setMinhasSkins(Array.isArray(lista) ? lista : []);
      } catch (e) {
        console.error('Falha ao buscar minhas skins:', e);
        if (!ativo) return;
        setErroMinhas('Não foi possível carregar suas skins.');
        setMinhasSkins([]);
      } finally {
        if (ativo) setCarregandoMinhas(false);
      }
    }
    carregarMinhas();
    return () => {
      ativo = false;
    };
  }, [user]);

  useEffect(() => {
    // FEED geral (todo mundo)
    let vivo = true;
    (async () => {
      try {
        const data = await anuncioService.listarFeedNormalizado();
        if (vivo) setFeedApi(data);
      } catch (e) {
        if (vivo) setFeedApi([]);
      }
    })();
    return () => {
      vivo = false;
    };
  }, []);

  +(
    // Polling leve do feed a cada 5s (até ligar SSE)
    useEffect(() => {
      let alive = true;
      const tick = async () => {
        try {
          const data = await anuncioService.listarFeedNormalizado();
          if (alive) setFeedApi(data);
        } catch {}
      };
      const id = setInterval(tick, 5000);
      return () => {
        alive = false;
        clearInterval(id);
      };
    }, [])
  );

  // Lista combinada: minhas + mock
  const listaCombinada = useMemo(() => {
    return juntarSemDuplicar(skinsMock, minhasSkins);
  }, [skinsMock, minhasSkins]);

  // sincroniza URL quando filtros/ordenar mudam
  const minRef = useRef(null);
  const maxRef = useRef(null);
  useEffect(() => {
    if (filters.min > filters.max) {
      setFilters((f) => ({ ...f, max: f.min }));
      return;
    }
    writeStateToURL(filters, sortBy, true);
    setPriceUI((p) => ({
      min:
        document.activeElement === minRef?.current
          ? p.min
          : brlPlain(filters.min),
      max:
        document.activeElement === maxRef?.current
          ? p.max
          : brlPlain(filters.max),
    }));
  }, [filters, sortBy]);

  // scroll suave para âncoras
  useEffect(() => {
    const onClick = (e) => {
      const a = e.target.closest('a[href^="#"]');
      if (!a) return;
      const hash = a.getAttribute('href');
      if (!hash || hash === '#') return;

      const el = document.querySelector(hash);
      if (!el) return;

      e.preventDefault();
      const header = document.querySelector('.topbar');
      const offset = (header?.offsetHeight ?? 0) + 8;
      const y = el.getBoundingClientRect().top + window.scrollY - offset;
      history.pushState(null, '', hash);
      smoothScrollToY(y, 600);
    };
    document.addEventListener('click', onClick, { passive: false });
    return () => document.removeEventListener('click', onClick);
  }, []);

  // Ranking com a lista combinada
  const ranked = useRankedSkins(listaCombinada, sortBy, filters);

  const handleLikeToggle = (anuncioId) => {
    const isCurrentlyLiked = likes.has(anuncioId);
    const newLikes = new Set(likes);
    if (isCurrentlyLiked) newLikes.delete(anuncioId);
    else newLikes.add(anuncioId);
    setLikes(newLikes);
  };

  /* ---------- Price inputs: handlers ---------- */
  function allowOnlyDigitsKeyDown(e) {
    const allowed = [
      'Backspace',
      'Delete',
      'ArrowLeft',
      'ArrowRight',
      'Home',
      'End',
      'Tab',
      'Enter',
    ];
    const isCmd = e.ctrlKey || e.metaKey;
    const isShortcut =
      isCmd && ['a', 'c', 'v', 'x'].includes(e.key.toLowerCase());
    const isDigit = e.key >= '0' && e.key <= '9';
    const isNumpadDigit = e.code && /^Numpad[0-9]$/.test(e.code);
    if (allowed.includes(e.key) || isShortcut || isDigit || isNumpadDigit)
      return;
    e.preventDefault();
  }

  function handlePasteDigits(e, which) {
    const text = (e.clipboardData || window.clipboardData).getData('text');
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
    setPriceUI((p) => ({
      ...p,
      min: filters.min ? String(Math.round(filters.min)) : '',
    }));
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
    setPriceUI((p) => ({
      ...p,
      max: filters.max ? String(Math.round(filters.max)) : '',
    }));
  };
  const handleMaxBlur = () => {
    setPriceUI((p) => ({ ...p, max: brlPlain(filters.max) }));
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Falha ao fazer logout:', error);
    }
  };

  const handleClearFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setSortBy(DEFAULT_SORT);
    setPriceUI({
      min: brlPlain(DEFAULT_FILTERS.min),
      max: brlPlain(DEFAULT_FILTERS.max),
    });
    writeStateToURL(DEFAULT_FILTERS, DEFAULT_SORT, false);
  };

  /* ---------- Menu do perfil ---------- */
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPinned, setMenuPinned] = useState(false);
  const menuRef = useRef(null);
  const hideTimerRef = useRef(null);

  const openMenu = () => {
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    setMenuOpen(true);
  };
  const scheduleClose = () => {
    if (menuPinned) return;
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => setMenuOpen(false), 500);
  };
  const togglePinned = () => {
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    setMenuPinned((v) => !v);
    setMenuOpen(true);
  };

  // Fecha ao clicar fora
  useEffect(() => {
    const onDocClick = (e) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target)) {
        setMenuPinned(false);
        setMenuOpen(false);
      }
    };
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, []);

  // Fecha com ESC
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setMenuPinned(false);
        setMenuOpen(false);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  // Limpa o timer ao desmontar
  useEffect(() => {
    return () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, []);

  /* ---------- Avatar (apenas quando logado) ---------- */
  const initials = (user?.nome || user?.email || '?')
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className="dash-root">
      <div className="backdrop" aria-hidden />

      {/* Topbar */}
      <div className="topbar">
        <AuthBrand />
        <nav>
          <a href="#grid">Explorar</a>
          <a href="#planos">Planos</a>
          <a href="#planos">Anunciar</a>
        </nav>

        <div className="actions">
          {user ? (
            <div
              className={`profile-menu ${menuOpen ? 'is-open' : ''}`}
              ref={menuRef}
              onMouseEnter={openMenu}
              onMouseLeave={scheduleClose}
            >
              <button
                className="avatar neon"
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                onClick={togglePinned}
                type="button"
              >
                {initials}
              </button>

              {menuOpen && (
                <div className="menu" role="menu">
                  <button onClick={() => navigate('/perfil')} role="menuitem">
                    Meu perfil
                  </button>
                  <button onClick={handleLogout} role="menuitem">
                    Sair
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/login" className="btn btn--ghost sm">
                Entrar
              </Link>
              <Link to="/cadastro" className="btn btn--primary sm">
                Criar conta
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Hero */}
      <header className="hero">
        <div className="hero__copy">
          <h1>Vitrine das Skins</h1>
          <p>
            Somos apenas a vitrine. Anuncie, favorite e, ao comprar,
            redirecionamos para o site do vendedor.
          </p>
          <div className="hero__cta">
            <a className="btn btn--primary" href="#grid">
              Explorar Skins
            </a>
            <a className="btn btn--ghost" href="#planos">
              Planos de Destaque
            </a>
          </div>
        </div>
      </header>

      {/* Filtros */}
      <section className="filters" id="grid">
        <div className="filters__row">
          <div className="field field--search">
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16a6.471 6.471 0 0 0 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5Zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14Z"
              />
            </svg>
            <input
              placeholder="Buscar skins..."
              value={filters.search}
              onChange={(e) =>
                setFilters({ ...filters, search: e.target.value })
              }
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
              <option value="relevancia">
                Relevância (plano + likes + recência)
              </option>
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
                  onPaste={(e) => handlePasteDigits(e, 'min')}
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
                  onPaste={(e) => handlePasteDigits(e, 'max')}
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
        {user && carregandoMinhas && (
          <p style={{ gridColumn: '1 / -1', color: '#7B8694' }}>
            Carregando suas skins…
          </p>
        )}
        {user && !carregandoMinhas && erroMinhas && (
          <p style={{ gridColumn: '1 / -1', color: '#ff9c9c' }}>{erroMinhas}</p>
        )}

        {ranked.map((anuncio) => (
          <SkinCard
            key={anuncio.id}
            data={anuncio}
            liked={likes.has(anuncio.id)}
            onLike={() => handleLikeToggle(anuncio.id)}
            onContato={() => abrirChatPara(anuncio)} // 🔒 protegido
            onComprarFora={() => comprarFora(anuncio)} // 🔒 protegido
          />
        ))}
      </section>

      {/* Planos */}
      <section id="planos" className="plans">
        <h2>Planos de Destaque</h2>
        <div className="plans__grid">
          {Object.entries(plansMeta).map(([key, p]) => (
            <div
              key={key}
              className={`plan plan--${key}`}
              style={{ '--plan': p.color }}
            >
              <h3>{p.label}</h3>
              <ul>
                <li>
                  Prioridade de exibição: <strong>{p.weight}x</strong>
                </li>
                <li>Badge de destaque</li>
                <li>Suporte via e-mail</li>
                {key !== 'gratuito' && <li>Relatórios de visualização</li>}
                {key === 'plus' && <li>Spotlight na página inicial</li>}
              </ul>
              <button className="btn btn--primary">Assinar</button>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="foot">
        <p>
          © {new Date().getFullYear()} SkinLoot — Nós apenas conectamos vendedor
          e comprador.
        </p>
      </footer>

      {/* 🔒 Chat flutuante só aparece quando LOGADO */}
      {user &&
        (chatAberto ? (
          <ChatFlutuante
            usuarioAlvo={chatAberto}
            onFechar={() => {
              setChatAberto(null);
            }}
          />
        ) : (
          <button
            className="chat-mini-bubble"
            title="Mensagens"
            onClick={() => setChatAberto({ id: 'ultimo', nome: 'Mensagens' })}
          >
            <span className="chat-mini-bubble__icon">💬</span>
            <span className="chat-mini-bubble__label">Mensagens</span>
            {unreads > 0 && (
              <span className="chat-mini-bubble__badge">{unreads}</span>
            )}
          </button>
        ))}
    </div>
  );
}

/* ---------- Card (componente) ---------- */
function SkinCard({ data, liked, onLike, onContato, onComprarFora }) {
  // Suporta formatos do MOCK e do BACKEND normalizado
  const title = data?.skinNome ?? data?.title ?? data?.nome ?? 'Skin';
  const image = data?.image ?? data?.imagemUrl ?? data?.imagem ?? '';
  const vendedor =
    data?.usuarioNome ?? data?.seller?.name ?? data?.vendedorNome ?? '—';

  const precoNumber = Number(data?.preco ?? data?.price ?? NaN);
  const precoFmt = Number.isFinite(precoNumber)
    ? precoNumber.toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    : '—';

  const planKey = data?.plan ?? data?.plano ?? 'gratuito';
  const planMeta = plansMeta[planKey] || { label: '—', color: '#999' };

  return (
    <article className="card">
      <div className="card__media">
        <img src={image} alt={title} loading="lazy" />
        <span className="badge" style={{ background: planMeta.color }}>
          {planMeta.label}
        </span>

        <button
          className={`like ${liked ? 'is-liked' : ''}`}
          onClick={onLike}
          aria-label="Favoritar"
        >
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 6 4 4 6.5 4c1.74 0 3.41 1.01 4.22 2.53C11.09 5.01 12.76 4 14.5 4 17 4 19 6 19 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
            />
          </svg>
        </button>
      </div>

      <div className="card__body">
        <h3>{title}</h3>
        <div className="meta">
          <span className="price">R$ {precoFmt}</span>
        </div>
        <div className="seller">
          <span>Vendedor: {vendedor}</span>
          <div className="cta">
            {/* 🔒 Agora são botões (não links), para passar pelo guardião */}
            <button
              className="btn btn--ghost"
              type="button"
              onClick={onContato}
            >
              Contato
            </button>
            <button
              className="btn btn--primary"
              type="button"
              onClick={onComprarFora}
            >
              Comprar fora
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
