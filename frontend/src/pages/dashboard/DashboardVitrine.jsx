// frontend/src/pages/DashboardVitrine.jsx

import { useEffect, useMemo, useState, useRef } from 'react';
import { useAuth } from '../../services/AuthContext.jsx';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './DashboardVitrine.css';
import AuthBrand from '../../components/logo/AuthBrand.jsx';
import ChatFlutuante from '../../components/chat/ChatFlutuante';
import anuncioService from '../../services/anuncioService.js';
import SkinCard from '../../components/skin/SkinCard.jsx';
import { listarJogos } from '../../services/jogoService.js';
import PerfilPreviewModal from '../../components/shared/PerfilPreviewModal.jsx';

/* ======================================================
   Metadados dos planos
====================================================== */
const plansMeta = {
  gratuito: { label: 'Gratuito', weight: 1.0, color: '#454B54' },
  intermediario: { label: 'Intermediário', weight: 1.6, color: '#00C896' },
  plus: { label: '+ Plus', weight: 2.2, color: '#39FF14' },
};

/* ======================================================
   Constantes de filtros e ordenação
====================================================== */
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

// Opções estáticas de plano e ordenação (usadas no dropdown custom)
const PLAN_OPTIONS = [
  { value: 'todos', label: 'Todos' },
  { value: 'gratuito', label: 'Gratuito' },
  { value: 'intermediario', label: 'Intermediário' },
  { value: 'plus', label: '+ Plus' },
];

const SORT_OPTIONS = [
  {
    value: 'relevancia',
    label: 'Relevância (plano + likes + recência)',
  },
  { value: 'recentes', label: 'Mais recentes' },
  { value: 'preco_asc', label: 'Preço: menor → maior' },
  { value: 'preco_desc', label: 'Preço: maior → menor' },
];

/* ======================================================
   Utilitários de formatação e URL
====================================================== */
const onlyDigits = (s) => (s || '').replace(/\D/g, '');
const brlPlain = (n) =>
  Number.isFinite(n)
    ? n.toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    : '0,00';

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

/* ======================================================
   Conversões e normalizações
====================================================== */
const toMs = (v) => {
  const t = typeof v === 'string' ? Date.parse(v) : Number(v);
  return Number.isFinite(t) ? t : Date.now();
};

/**
 * Extrai um "conjunto" de chaves de jogo possíveis do anúncio (IDs e nomes),
 * para permitir filtrar mesmo quando algum item ainda não estiver normalizado.
 */
function getGameKeysFromAnuncio(anuncio) {
  const id =
    anuncio?.jogo?.id ??
    anuncio?._raw?.jogo?.id ??
    anuncio?.jogoId ??
    anuncio?.gameId ??
    null;

  const nome =
    anuncio?.jogo?.nome ??
    anuncio?._raw?.jogo?.nome ??
    anuncio?.game ??
    anuncio?.gameName ??
    null;

  const keys = new Set();

  if (id !== null && id !== undefined && id !== '') {
    keys.add(String(id));
  }
  if (nome) {
    keys.add(String(nome).toLowerCase().trim());
  }

  if (nome) {
    const compact = String(nome).toLowerCase().replace(/[:\s]/g, '');
    if (compact) keys.add(compact);
  }

  if (anuncio?.game) {
    const g = String(anuncio.game).toLowerCase().trim();
    if (g) keys.add(g);
    const gCompact = g.replace(/[:\s]/g, '');
    if (gCompact) keys.add(gCompact);
  }

  return keys;
}

/* ======================================================
   Hook de ranking e filtragem das skins
====================================================== */
function useRankedSkins(list, sortBy, filters, jogosList) {
  const selectedGameName = useMemo(() => {
    if (filters.game === 'todos') return null;
    const found = (jogosList || []).find(
      (j) => String(j.id) === String(filters.game),
    );
    return found?.nome || null;
  }, [filters.game, jogosList]);

  const selectedGameNameLower = useMemo(() => {
    if (!selectedGameName) return null;
    return String(selectedGameName).toLowerCase().trim();
  }, [selectedGameName]);

  const selectedGameCompact = useMemo(() => {
    if (!selectedGameNameLower) return null;
    return selectedGameNameLower.replace(/[:\s]/g, '');
  }, [selectedGameNameLower]);

  const rawGameKey = useMemo(() => {
    if (filters.game === 'todos') return null;
    const asText = String(filters.game).toLowerCase().trim();
    return {
      lower: asText,
      compact: asText.replace(/[:\s]/g, ''),
    };
  }, [filters.game]);

  return useMemo(() => {
    const now = Date.now();
    const rec = (t) => Math.max(0.6, 1.4 - (now - t) / (1000 * 60 * 60 * 72));

    const filtrados = list.filter((s) => {
      if (s.ativo === false) return false;

      const planOk = filters.plan === 'todos' || s.plan === filters.plan;

      let gameOk = true;
      if (filters.game !== 'todos') {
        const keys = getGameKeysFromAnuncio(s);

        if (keys.has(String(filters.game))) {
          gameOk = true;
        } else {
          const byName =
            (selectedGameNameLower && keys.has(selectedGameNameLower)) ||
            (selectedGameCompact && keys.has(selectedGameCompact)) ||
            (rawGameKey &&
              (keys.has(rawGameKey.lower) || keys.has(rawGameKey.compact)));

          gameOk = !!byName;
        }
      }

      const nome = (s.title ?? s.skinNome ?? s.nome ?? '').toLowerCase();
      const textoOk = nome.includes(String(filters.search || '').toLowerCase());

      const priceVal = Number(s.price ?? s.preco ?? NaN);
      const priceOk =
        Number.isFinite(priceVal) &&
        priceVal >= filters.min &&
        priceVal <= filters.max;

      return planOk && gameOk && textoOk && priceOk;
    });

    const pontuados = filtrados.map((s) => {
      const meta = plansMeta[s.plan] || { weight: 1.0 };
      const likes = Number(s.likes ?? 0);
      const listedAt = toMs(s.listedAt ?? s.createdAt ?? now);
      return {
        ...s,
        listedAt,
        score: meta.weight * Math.pow(likes + 1, 0.5) * rec(listedAt),
      };
    });

    if (sortBy === 'relevancia')
      return pontuados.sort((a, b) => b.score - a.score);
    if (sortBy === 'preco_asc')
      return pontuados.sort((a, b) => a.price - b.price);
    if (sortBy === 'preco_desc')
      return pontuados.sort((a, b) => b.price - a.price);
    if (sortBy === 'recentes')
      return pontuados.sort((a, b) => b.listedAt - a.listedAt);

    return pontuados;
  }, [
    list,
    sortBy,
    filters.plan,
    filters.game,
    filters.search,
    filters.min,
    filters.max,
    selectedGameNameLower,
    selectedGameCompact,
    rawGameKey,
  ]);
}

/* ======================================================
   Componente Principal
====================================================== */
export default function DashboardVitrine() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const initial = readStateFromURL();

  const [menuAberto, setMenuAberto] = useState(false);
  const toggleMenu = () => setMenuAberto((prev) => !prev);

  const [minhasSkins, setMinhasSkins] = useState([]);
  const [feedApi, setFeedApi] = useState([]);
  const [carregandoMinhas, setCarregandoMinhas] = useState(false);
  const [erroMinhas, setErroMinhas] = useState('');

  const [likes, setLikes] = useState(() => new Set());
  const [sortBy, setSortBy] = useState(initial.sort);
  const [filters, setFilters] = useState(initial.filters);
  const [priceUI, setPriceUI] = useState({
    min: brlPlain(initial.filters.min),
    max: brlPlain(initial.filters.max),
  });

  const [chatAberto, setChatAberto] = useState(null);
  const [unreads, setUnreads] = useState(0);

  const [jogosList, setJogosList] = useState([]);
  const [jogosErr, setJogosErr] = useState('');

  const [perfilPreview, setPerfilPreview] = useState(null);

  // Dropdowns customizados dos filtros (Jogo / Plano / Ordenar)
  const [gameDropdownOpen, setGameDropdownOpen] = useState(false);
  const [planDropdownOpen, setPlanDropdownOpen] = useState(false);
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);

  /* Helpers para labels dos dropdowns */
  function getGameLabel() {
    if (filters.game === 'todos') return 'Todos';
    const found = jogosList.find((j) => String(j.id) === String(filters.game));
    return found?.nome || 'Todos';
  }

  function getPlanLabel() {
    return (
      PLAN_OPTIONS.find((opt) => opt.value === filters.plan)?.label || 'Todos'
    );
  }

  function getSortLabel() {
    return (
      SORT_OPTIONS.find((opt) => opt.value === sortBy)?.label ||
      'Relevância (plano + likes + recência)'
    );
  }

  /* ======================================================
     Autenticação e navegação
  ====================================================== */
  function exigirLogin(acao, payload) {
    if (!user) {
      navigate('/login', {
        state: { returnTo: location.pathname + location.search, acao, payload },
        replace: true,
      });
      return true;
    }
    return false;
  }

  function abrirChatPara(anuncio) {
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
      `temp-${anuncio?.id || anuncio?._id}`;

    const nomeSkin = anuncio.title ?? anuncio.skinNome ?? 'Skin';
    const precoSkin = anuncio.price ?? anuncio.preco ?? 0;

    setChatAberto({
      seller: { id: id, nome: nome },
      skin: { titulo: nomeSkin, preco: precoSkin },
    });
    setUnreads(0);
  }

  function comprarFora(anuncio) {
    if (exigirLogin('comprar_fora', { anuncioId: anuncio?.id })) return;
    const url =
      anuncio?.linkExterno ||
      anuncio?._raw?.linkExterno ||
      anuncio?.seller?.contactUrl ||
      anuncio?._raw?.urlCompra ||
      '#';
    if (url && url !== '#') window.open(url, '_blank', 'noopener,noreferrer');
    else abrirChatPara(anuncio);
  }

  function abrirPerfilPreview(anuncio) {
    const id =
      anuncio?.usuarioId ?? anuncio?.seller?.id ?? anuncio?.vendedorId ?? null;

    const nome =
      anuncio?.usuarioNome ??
      anuncio?.seller?.name ??
      anuncio?.vendedorNome ??
      'Usuário';

    if (!id) return;

    const avatar =
      anuncio?.seller?.avatarUrl ??
      anuncio?.usuarioAvatar ??
      anuncio?.vendedorAvatar ??
      null;

    setPerfilPreview({
      id,
      nome,
      avatarUrl: avatar,
    });
  }

  /* ======================================================
     Efeitos e sincronização
  ====================================================== */

  useEffect(() => {
    let ativo = true;
    (async () => {
      try {
        setJogosErr('');
        const jogos = await listarJogos();
        if (ativo) setJogosList(Array.isArray(jogos) ? jogos : []);
      } catch (e) {
        console.error('Falha ao carregar a lista de jogos.', e);
        if (ativo) {
          setJogosErr('Não foi possível carregar os jogos.');
          setJogosList([]);
        }
      }
    })();
    return () => {
      ativo = false;
    };
  }, []);

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
        const planKey = String(
          user?.plano || user?.plan || 'gratuito',
        ).toLowerCase();

        const normalizada = (Array.isArray(lista) ? lista : []).map((a) => ({
          ...a,
          plan: planKey,
          listedAt: toMs(a?.listedAt ?? a?.createdAt),
          isMine: true,
        }));

        if (ativo) setMinhasSkins(normalizada);
      } catch (e) {
        console.error('Falha ao buscar minhas skins:', e);
        if (ativo) {
          setErroMinhas('Não foi possível carregar suas skins.');
          setMinhasSkins([]);
        }
      } finally {
        if (ativo) setCarregandoMinhas(false);
      }
    }

    carregarMinhas();
    const onChanged = () => carregarMinhas();
    window.addEventListener('skins:changed', onChanged);
    return () => {
      ativo = false;
      window.removeEventListener('skins:changed', onChanged);
    };
  }, [user]);

  useEffect(() => {
    const planKey = String(
      user?.plano || user?.plan || 'gratuito',
    ).toLowerCase();
    setMinhasSkins((prev) =>
      Array.isArray(prev)
        ? prev.map((a) => (a?.isMine ? { ...a, plan: planKey } : a))
        : prev,
    );
  }, [user?.plano, user?.plan]);

  useEffect(() => {
    let ativo = true;
    (async () => {
      try {
        const data = await anuncioService.listarFeedNormalizado();
        if (ativo) {
          const normalized = (Array.isArray(data) ? data : []).map((a) => ({
            ...a,
            listedAt: toMs(a?.listedAt ?? a?.createdAt),
          }));
          setFeedApi(normalized);
        }
      } catch {
        if (ativo) setFeedApi([]);
      }
    })();
    return () => {
      ativo = false;
    };
  }, []);

  useEffect(() => {
    const id = setInterval(async () => {
      try {
        const data = await anuncioService.listarFeedNormalizado();
        const normalized = (Array.isArray(data) ? data : []).map((a) => ({
          ...a,
          listedAt: toMs(a?.listedAt ?? a?.createdAt),
        }));
        setFeedApi(normalized);
      } catch {}
    }, 5000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    writeStateToURL(filters, sortBy, true);
  }, [filters, sortBy]);

  /* ======================================================
     Lógica de ranking
  ====================================================== */
  const listaCombinada = useMemo(() => {
    const minhasIds = new Set(
      (minhasSkins || []).map((m) => String(m.id ?? m._id)),
    );
    const others = (feedApi || []).filter(
      (a) => !minhasIds.has(String(a.id ?? a._id)),
    );
    const planKey = String(
      user?.plano || user?.plan || 'gratuito',
    ).toLowerCase();
    const ratio = plansMeta[planKey]?.weight ?? 1.0;

    const mixByPlanRatio = (mine, othersList, ratioVal) => {
      const res = [];
      let i = 0;
      let j = 0;
      let acc = 0;
      while (i < mine.length || j < othersList.length) {
        acc += ratioVal;
        while (acc >= 1 && i < mine.length) {
          res.push(mine[i++]);
          acc -= 1;
        }
        if (j < othersList.length) res.push(othersList[j++]);
      }
      return res;
    };
    return mixByPlanRatio(minhasSkins || [], others, ratio);
  }, [feedApi, minhasSkins, user]);

  const ranked = useRankedSkins(listaCombinada, sortBy, filters, jogosList);

  /* ======================================================
     Handlers
  ====================================================== */
  const handleLikeToggle = (keyId) => {
    setLikes((prev) => {
      const newLikes = new Set(prev);
      newLikes.has(keyId) ? newLikes.delete(keyId) : newLikes.add(keyId);
      return newLikes;
    });
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Falha ao fazer logout:', error);
    }
  };

  /* ======================================================
     Preço
  ====================================================== */
  const minRef = useRef(null);
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

  const maxRef = useRef(null);
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

  const allowOnlyDigitsKeyDown = (e) => {
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
  };

  const handlePasteDigits = (e, which) => {
    const text = (e.clipboardData || window.clipboardData).getData('text');
    const cleaned = onlyDigits(text);
    e.preventDefault();
    setPriceUI((p) => ({ ...p, [which]: cleaned }));
    setFilters((f) => ({
      ...f,
      [which]: cleaned ? parseInt(cleaned, 10) : 0,
    }));
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

  const irParaUpgrade = (planoDesejado) => {
    if (!user) {
      navigate('/login', {
        state: {
          returnTo: '/perfil',
          openPlanoPanel: 'upgrade',
          preselectPlan: planoDesejado,
        },
      });
      return;
    }
    navigate('/perfil', {
      state: { openPlanoPanel: 'upgrade', preselectPlan: planoDesejado },
    });
  };

  const initials = (user?.nome || user?.email || '?')
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  /* ======================================================
     Render
  ====================================================== */
  return (
    <div className="dash-root">
      <div className="backdrop" aria-hidden />

      {user ? (
        <div className="topbar logged">
          <AuthBrand />

          <nav className="nav-links">
            <a href="#grid">Explorar</a>
            <a href="#planos">Planos</a>
            <a href="#planos">Anunciar</a>
          </nav>

          <div className="profile-menu">
            <button className="avatar neon" onClick={toggleMenu}>
              {initials}
            </button>

            {menuAberto && (
              <div className="menu">
                {user?.role === 'ADMIN' && (
                  <button
                    onClick={() => navigate('/admin')}
                    style={{ color: '#39FF14' }}
                  >
                    Painel Admin
                  </button>
                )}

                <button onClick={() => navigate('/perfil')}>Meu Perfil</button>
                <button onClick={handleLogout}>Sair</button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="topbar guest">
          <AuthBrand />
          <nav>
            <a href="#grid">Explorar</a>
            <a href="#planos">Planos</a>
            <a href="#planos">Anunciar</a>
          </nav>

          <div className="actions">
            <Link to="/login" className="btn btn--ghost sm">
              Entrar
            </Link>
            <Link to="/cadastro" className="btn btn--primary sm">
              Criar conta
            </Link>
          </div>
        </div>
      )}

      <header className="hero">
        <div className="hero__copy">
          <h1>SkinLoot</h1>
          <p>
            Anuncie, favorite, converse com outros usuários e ao comprar,
            redirecionamos para o vendedor.
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

      {/* ---------- Filtros ---------- */}
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

          {/* Jogo - dropdown custom (lista de jogos da API) */}
          <div className="field">
            <label>Jogo</label>
            <div className="filters-select-wrapper">
              <button
                type="button"
                className="filters-select-display"
                onClick={() => setGameDropdownOpen((prevAberto) => !prevAberto)}
                title="Filtre por jogo (lista sincronizada.)"
              >
                <span>{getGameLabel()}</span>
                <span className="filters-select-arrow">▼</span>
              </button>

              {gameDropdownOpen && (
                <div className="filters-dropdown">
                  <button
                    type="button"
                    className={`filters-dropdown-option ${
                      filters.game === 'todos' ? 'active' : ''
                    }`}
                    onClick={() => {
                      setFilters({ ...filters, game: 'todos' });
                      setGameDropdownOpen(false);
                    }}
                  >
                    Todos
                  </button>
                  {jogosList.map((jogo) => (
                    <button
                      type="button"
                      key={jogo.id}
                      className={`filters-dropdown-option ${
                        String(filters.game) === String(jogo.id) ? 'active' : ''
                      }`}
                      onClick={() => {
                        setFilters({ ...filters, game: String(jogo.id) });
                        setGameDropdownOpen(false);
                      }}
                    >
                      {jogo.nome}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {jogosErr && <small style={{ color: '#f66' }}>{jogosErr}</small>}
          </div>

          {/* Plano - dropdown custom */}
          <div className="field">
            <label>Plano</label>
            <div className="filters-select-wrapper">
              <button
                type="button"
                className="filters-select-display"
                onClick={() => setPlanDropdownOpen((prevAberto) => !prevAberto)}
              >
                <span>{getPlanLabel()}</span>
                <span className="filters-select-arrow">▼</span>
              </button>

              {planDropdownOpen && (
                <div className="filters-dropdown">
                  {PLAN_OPTIONS.map((opt) => (
                    <button
                      type="button"
                      key={opt.value}
                      className={`filters-dropdown-option ${
                        filters.plan === opt.value ? 'active' : ''
                      }`}
                      onClick={() => {
                        setFilters({ ...filters, plan: opt.value });
                        setPlanDropdownOpen(false);
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Ordenar - dropdown custom */}
          <div className="field">
            <label>Ordenar</label>
            <div className="filters-select-wrapper">
              <button
                type="button"
                className="filters-select-display"
                onClick={() => setSortDropdownOpen((prevAberto) => !prevAberto)}
              >
                <span>{getSortLabel()}</span>
                <span className="filters-select-arrow">▼</span>
              </button>

              {sortDropdownOpen && (
                <div className="filters-dropdown">
                  {SORT_OPTIONS.map((opt) => (
                    <button
                      type="button"
                      key={opt.value}
                      className={`filters-dropdown-option ${
                        sortBy === opt.value ? 'active' : ''
                      }`}
                      onClick={() => {
                        setSortBy(opt.value);
                        setSortDropdownOpen(false);
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

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

          <div className="filters__actions">
            <button className="btn btn--ghost" onClick={handleClearFilters}>
              Limpar filtros
            </button>
          </div>
        </div>
      </section>

      {/* ---------- Grid ---------- */}
      <section className="grid">
        {ranked.map((anuncio) => (
          <SkinCard
            key={anuncio.id || anuncio._id}
            data={anuncio}
            liked={likes.has(anuncio.id || anuncio._id)}
            onLike={() => handleLikeToggle(anuncio.id || anuncio._id)}
            onContato={() => abrirChatPara(anuncio)}
            onComprarFora={() => comprarFora(anuncio)}
            onVerPerfil={() => abrirPerfilPreview(anuncio)}
          />
        ))}
      </section>

      {/* ---------- Planos ---------- */}
      <section id="planos" className="plans">
        <h2>Planos de Destaque</h2>
        <div className="plans__grid">
          {Object.entries(plansMeta).map(([key, p]) => {
            const anunciosLimit =
              key === 'gratuito' ? '5' : key === 'intermediario' ? '20' : '∞';

            const hasBadge = key !== 'gratuito';
            const hasSpotlight = key === 'plus';

            return (
              <div
                key={key}
                className={`plan plan--${key}`}
                style={{ '--plan': p.color }}
              >
                <h3>{p.label}</h3>

                <ul>
                  <li>
                    Prioridade de exibição:{' '}
                    <strong>{p.weight.toFixed(1)}x</strong>
                  </li>
                  <li>
                    Limite de anúncios: <strong>{anunciosLimit}</strong>
                  </li>
                  {hasBadge && <li>Badge de destaque</li>}
                  <li>Suporte via e-mail</li>
                  {hasSpotlight && <li>Spotlight na página inicial</li>}
                </ul>

                <button
                  className="btn btn--primary"
                  onClick={() => irParaUpgrade(key)}
                >
                  Assinar
                </button>
              </div>
            );
          })}
        </div>
      </section>

      <footer className="foot">
        <p>
          © {new Date().getFullYear()} SkinLoot — Nós apenas conectamos vendedor
          e comprador.
        </p>
      </footer>

      {user &&
        (chatAberto ? (
          <div className="chat-float">
            <ChatFlutuante
              usuarioAlvo={chatAberto}
              onFechar={() => setChatAberto(null)}
            />
          </div>
        ) : (
          <button
            className="chat-mini-bubble"
            title="Mensagens"
            onClick={() => setChatAberto({ id: 'ultimo', nome: 'Mensagens' })}
          >
            <span className="chat-mini-bubble__icon">Chat</span>
            <span className="chat-mini-bubble__label">Mensagens</span>
            {unreads > 0 && (
              <span className="chat-mini-bubble__badge">{unreads}</span>
            )}
          </button>
        ))}

      {perfilPreview && (
        <PerfilPreviewModal
          open={!!perfilPreview}
          onClose={() => setPerfilPreview(null)}
          usuarioId={perfilPreview.id}
          nomeFallback={perfilPreview.nome}
          avatarFallback={perfilPreview.avatarUrl}
        />
      )}
    </div>
  );
}
