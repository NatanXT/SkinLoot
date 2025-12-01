// ============================================================================
// DetalheAnuncio.jsx
// Caminho: frontend/src/pages/DetalheAnuncio.jsx
//
// OBJETIVO
// - Exibir detalhes completos de um anúncio (imagens, vendedor, preço, etc.)
// - Suportar múltiplos formatos de dados (camelCase / snake_case / raw)
// - Exibir detalhes específicos por jogo (CS:GO, LoL, genérico)
// - Permitir favoritar (com animação e sincronização com backend)
// - Abrir chat flutuante para negociação (similar à Dashboard)
// ============================================================================

import { useEffect, useMemo, useState } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import anuncioService from '../../services/anuncioService.js';
import './DetalheAnuncio.css';
import AuthBrand from '../../components/logo/AuthBrand.jsx';
import ChatFlutuante from '../../components/chat/ChatFlutuante';
import { useAuth } from '../../services/AuthContext.jsx';

// ============================================================================
// 1. FUNÇÕES UTILITÁRIAS
// ============================================================================

/**
 * Formata número como moeda BRL (R$)
 */
function fmtBRL(n) {
  const v = Number(n);
  if (!Number.isFinite(v)) return '—';
  return v.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Retorna a imagem principal do anúncio (fallback em caso de ausência)
 */
function pegarImagem(a) {
  return (
    a?.image ||
    a?.skinImageUrl ||
    a?.imagemUrl ||
    a?._raw?.skinImageUrl ||
    '/img/placeholder.png'
  );
}

/**
 * Obtém o campo `_raw` caso exista
 */
function getRaw(a) {
  return a?._raw || {};
}

// ============================================================================
// 2. NORMALIZADORES DE DADOS (compatibilidade entre APIs)
// ============================================================================

/**
 * Normaliza e extrai informações do jogo (nome e id)
 */
function resolverInfoJogo(anuncio) {
  const raw = getRaw(anuncio);

  const candidatosNome = [
    raw?.jogo?.nome,
    raw?.jogoNome,
    raw?.game?.name,
    raw?.gameName,
    anuncio?.jogo?.nome,
    anuncio?.game?.name,
    anuncio?.jogoNome,
    anuncio?.gameName,
  ].filter(Boolean);

  const candidatosId = [
    raw?.jogo?.id,
    raw?.jogoId,
    raw?.game?.id,
    raw?.gameId,
    anuncio?.jogo?.id,
    anuncio?.game?.id,
    anuncio?.jogoId,
    anuncio?.gameId,
  ].filter((v) => v !== undefined && v !== null && v !== '');

  return { nome: candidatosNome[0] || null, id: candidatosId[0] || null };
}

/**
 * Normaliza e extrai os detalhes específicos de cada jogo
 */
function resolverDetalhes(anuncio) {
  const raw = getRaw(anuncio);
  const detalhesCsgo =
    raw?.detalhesCsgo ||
    raw?.detalhes?.csgo ||
    anuncio?.detalhesCsgo ||
    anuncio?.detalhes?.csgo ||
    null;

  const detalhesLol =
    raw?.detalhesLol ||
    raw?.detalhes?.lol ||
    anuncio?.detalhesLol ||
    anuncio?.detalhes?.lol ||
    null;

  const detalhesGenericos =
    raw?.detalhes ||
    anuncio?.detalhes ||
    raw?.details ||
    anuncio?.details ||
    null;

  return { detalhesCsgo, detalhesLol, detalhesGenericos };
}

// ============================================================================
// 3. COMPONENTE — DetalhesPorJogo
// ============================================================================

/**
 * Renderiza o bloco de detalhes conforme o jogo (CS:GO, LoL ou genérico)
 */
function DetalhesPorJogo({
  jogoNome,
  detalhesCsgo,
  detalhesLol,
  detalhesGenericos,
}) {
  if (!jogoNome && !detalhesCsgo && !detalhesLol && !detalhesGenericos)
    return null;

  // ----- Caso: CS:GO -----
  if (
    jogoNome === 'CS:GO' ||
    jogoNome === 'Counter-Strike' ||
    jogoNome === 'Counter-Strike 2'
  ) {
    const d = detalhesCsgo || {};
    const tem =
      d.desgasteFloat ||
      d.patternIndex ||
      d.exterior ||
      typeof d.statTrak === 'boolean';
    if (!tem) return null;

    return (
      <fieldset className="box box--detalhes" tabIndex={0}>
        <legend>Detalhes (CS:GO)</legend>
        <div className="kv-grid">
          <div className="kv">
            <span className="k">Desgaste (Float)</span>
            <span className="v">{d.desgasteFloat ?? '—'}</span>
          </div>
          <div className="kv">
            <span className="k">Pattern Index</span>
            <span className="v">{d.patternIndex ?? '—'}</span>
          </div>
        </div>
        <div className="kv">
          <span className="k">Exterior</span>
          <span className="v">{d.exterior ?? '—'}</span>
        </div>
        <div className="kv">
          <span className="k">StatTrak™</span>
          <span className="v">{d.statTrak ? 'Sim' : 'Não'}</span>
        </div>
      </fieldset>
    );
  }

  // ----- Caso: League of Legends -----
  if (jogoNome === 'League of Legends' || jogoNome === 'LoL') {
    const d = detalhesLol || {};
    const tem = d.championName || d.tipoSkin || d.chroma;
    if (!tem) return null;

    return (
      <fieldset className="box box--detalhes" tabIndex={0}>
        <legend>Detalhes (LoL)</legend>
        <div className="kv">
          <span className="k">Campeão</span>
          <span className="v">{d.championName ?? '—'}</span>
        </div>
        <div className="kv">
          <span className="k">Tipo/Raridade</span>
          <span className="v">{d.tipoSkin ?? '—'}</span>
        </div>
        <div className="kv">
          <span className="k">Chroma</span>
          <span className="v">{d.chroma ?? '—'}</span>
        </div>
      </fieldset>
    );
  }

  // ----- Caso genérico -----
  if (detalhesGenericos && typeof detalhesGenericos === 'object') {
    const entradas = Object.entries(detalhesGenericos);
    if (entradas.length === 0) return null;

    return (
      <fieldset className="box box--detalhes" tabIndex={0}>
        <legend>Detalhes do jogo</legend>
        {entradas.map(([k, v]) => (
          <div className="kv" key={k}>
            <span className="k">{k}</span>
            <span className="v">
              {typeof v === 'object' ? JSON.stringify(v, null, 2) : String(v)}
            </span>
          </div>
        ))}
      </fieldset>
    );
  }

  return null;
}

// ============================================================================
// 4. COMPONENTE PRINCIPAL — DetalheAnuncio
// ============================================================================

export default function DetalheAnuncio() {
  // ----- Hooks de contexto e navegação -----
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  // ----- Estados principais -----
  const [anuncio, setAnuncio] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  // ----- Estado de "favoritar" -----
  const [liked, setLiked] = useState(false);
  const [loadingLike, setLoadingLike] = useState(false);
  const [justToggled, setJustToggled] = useState(false);

  // ----- Estado do chat -----
  const [chatAberto, setChatAberto] = useState(null);
  const [unreads, setUnreads] = useState(0);

  // ==========================================================================
  // 4.1. Funções auxiliares
  // ==========================================================================

  /**
   * Exige login antes de uma ação (redireciona se não autenticado)
   */
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

  /**
   * Abre o chat com o vendedor do anúncio
   */
  function abrirChatPara(anuncioData) {
    if (exigirLogin('contato', { anuncioId: anuncioData?.id || id })) return;

    const nome =
      anuncioData?.usuarioNome ??
      anuncioData?.seller?.name ??
      anuncioData?.vendedorNome ??
      'Usuário';

    const sellerId =
      anuncioData?.usuarioId ??
      anuncioData?.seller?.id ??
      anuncioData?.vendedorId ??
      `temp-${anuncioData?.id || anuncioData?._id || id}`;

    const nomeSkin = anuncioData?.title ?? anuncioData?.titulo ?? 'Skin';
    const precoSkin = anuncioData?.price ?? anuncioData?.preco ?? 0;

    setChatAberto({
      seller: { id: String(sellerId), nome },
      skin: { titulo: nomeSkin, preco: precoSkin },
    });
    setUnreads(0);
  }

  /**
   * Handler de clique no botão "Comprar"
   */
  function handleComprar() {
    if (anuncio) abrirChatPara(anuncio);
  }

  // ==========================================================================
  // 4.2. Carregamento inicial do anúncio
  // ==========================================================================
  useEffect(() => {
    let cancel = false;

    (async () => {
      try {
        setCarregando(true);
        setErro('');
        const dados = await anuncioService.buscarPorId(id);
        if (cancel) return;
        setAnuncio(dados);
        setLiked(Boolean(dados?._raw?.liked || false));
      } catch (e) {
        if (!cancel) setErro('Não foi possível carregar o anúncio.');
      } finally {
        if (!cancel) setCarregando(false);
      }
    })();

    return () => {
      cancel = true;
    };
  }, [id]);

  // ==========================================================================
  // 4.3. Alternar favorito
  // ==========================================================================
  async function alternarFavorito() {
    if (loadingLike) return;
    setLoadingLike(true);
    try {
      if (liked) await anuncioService.unlikeAnuncio(id);
      else await anuncioService.likeAnuncio(id);

      setLiked((v) => !v);
      setJustToggled(true);
      setTimeout(() => setJustToggled(false), 450);
    } catch (err) {
      console.error('Erro ao alternar favorito:', err);
    } finally {
      setLoadingLike(false);
    }
  }

  // ==========================================================================
  // 4.4. Derivações e memoizações
  // ==========================================================================
  const raw = useMemo(() => getRaw(anuncio), [anuncio]);
  const linkExterno = raw?.linkExterno || null;
  const jogoInfo = useMemo(() => resolverInfoJogo(anuncio), [anuncio]);
  const { detalhesCsgo, detalhesLol, detalhesGenericos } = useMemo(
    () => resolverDetalhes(anuncio),
    [anuncio],
  );

  // ==========================================================================
  // 4.5. Estados de carregamento e erro
  // ==========================================================================
  if (carregando) {
    return (
      <div className="detalhe-root">
        <div className="detalhe-topbar">
          <AuthBrand />
        </div>
        <div className="detalhe-loading">Carregando anúncio…</div>
      </div>
    );
  }

  if (erro) {
    return (
      <div className="detalhe-root">
        <div className="detalhe-topbar">
          <AuthBrand />
        </div>
        <p className="erro">{erro}</p>
        <button className="btn btn--ghost" onClick={() => navigate(-1)}>
          Voltar
        </button>
      </div>
    );
  }

  if (!anuncio) return null;

  // ==========================================================================
  // 4.6. Renderização principal
  // ==========================================================================
  return (
    <div className="detalhe-root">
      {/* Topbar com logo e voltar */}
      <div className="detalhe-topbar">
        <AuthBrand />
        <Link to="/" className="btn btn--ghost sm">
          Voltar à Vitrine
        </Link>
      </div>

      {/* Card principal */}
      <div className="detalhe-card">
        {/* Imagem do anúncio */}
        <div className="detalhe-imagem">
          <img
            src={pegarImagem(anuncio)}
            alt={anuncio.title || anuncio.titulo || 'Skin'}
            onError={(e) => (e.currentTarget.src = '/img/placeholder.png')}
            loading="lazy"
          />
          {(jogoInfo?.nome || jogoInfo?.id) && (
            <span className="badge-jogo">{jogoInfo?.nome || 'Jogo'}</span>
          )}
        </div>

        {/* Informações principais */}
        <div className="detalhe-info">
          <h1>{anuncio.title || anuncio.titulo || 'Skin'}</h1>
          <p className="preco">R$ {fmtBRL(anuncio.price ?? anuncio.preco)}</p>

          {/* Vendedor e descrição */}
          <div className="kv">
            <span className="k">Vendedor</span>
            <span className="v">
              {anuncio.seller?.name || anuncio.usuarioNome || '—'}
            </span>
          </div>
          <div className="kv">
            <span className="k">Descrição</span>
            <span className="v">{raw?.descricao || 'Sem descrição.'}</span>
          </div>

          {/* Informações do jogo */}
          {(jogoInfo?.nome ||
            jogoInfo?.id ||
            detalhesCsgo ||
            detalhesLol ||
            detalhesGenericos) && (
            <fieldset className="box box--info" tabIndex={0}>
              <legend>Informações do jogo</legend>
              {jogoInfo?.nome && (
                <div className="kv">
                  <span className="k">Jogo</span>
                  <span className="v">{jogoInfo.nome}</span>
                </div>
              )}
              {jogoInfo?.id && (
                <div className="kv">
                  <span className="k">ID do jogo</span>
                  <span className="v">{jogoInfo.id}</span>
                </div>
              )}
              {!jogoInfo?.nome &&
                (detalhesCsgo || detalhesLol || detalhesGenericos) && (
                  <div className="kv">
                    <span className="k">Observação</span>
                    <span className="v">
                      Sem nome do jogo; exibindo detalhes disponíveis abaixo.
                    </span>
                  </div>
                )}
            </fieldset>
          )}

          {/* Detalhes específicos por jogo */}
          <DetalhesPorJogo
            jogoNome={jogoInfo?.nome}
            detalhesCsgo={detalhesCsgo}
            detalhesLol={detalhesLol}
            detalhesGenericos={detalhesGenericos}
          />

          {/* Botão de favoritar */}
          <button
            type="button"
            className={`btn-like ${liked ? 'ativo' : ''} ${
              justToggled ? 'just-toggled' : ''
            }`}
            aria-pressed={liked ? 'true' : 'false'}
            onClick={alternarFavorito}
            disabled={loadingLike}
          >
            {/* Ícone OFF (contorno) */}
            <span className="ico ico--off" aria-hidden>
              <svg width="16" height="16" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M12.1 21.35 10 19.45c-4.55-4.09-7.5-6.76-7.5-9.75A5.25 5.25 0 0 1 7.75 4 5.8 5.8 0 0 1 12 6.09 5.8 5.8 0 0 1 16.25 4 5.25 5.25 0 0 1 21.5 9.7c0 2.99-2.95 5.66-7.5 9.75l-1.9 1.9Z"
                />
              </svg>
            </span>

            {/* Ícone ON (cheio) */}
            <span className="ico ico--on" aria-hidden>
              <svg width="16" height="16" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M12.1 21.35 10 19.45C5.45 15.36 2.5 12.69 2.5 9.7A5.25 5.25 0 0 1 7.75 4c1.7 0 3.23.83 4.25 2.09A5.8 5.8 0 0 1 16.25 4 5.25 5.25 0 0 1 21.5 9.7c0 2.99-2.95 5.66-7.5 9.75l-1.9 1.9Z"
                />
              </svg>
            </span>
            {liked ? 'Favorito' : 'Favoritar'}
          </button>

          {/* Botões de ação */}
          <div className="detalhe-acoes">
            <button className="btn btn--ghost" onClick={() => navigate(-1)}>
              Voltar
            </button>
            <button
              className="btn btn--primary"
              onClick={handleComprar}
              title="Abrir chat com o vendedor"
            >
              Comprar
            </button>
            {linkExterno && (
              <a
                className="btn btn--ghost"
                href={linkExterno}
                target="_blank"
                rel="noopener noreferrer"
              >
                Comprar no site
              </a>
            )}
          </div>
        </div>
      </div>

      {/* ==========================================================================
         4.7. CHAT FLUTUANTE
         ========================================================================== */}
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
