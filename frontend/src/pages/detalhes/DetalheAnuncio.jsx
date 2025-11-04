// frontend/src/pages/DetalheAnuncio.jsx
// ============================================================================
// Detalhe do anúncio com suporte robusto a:
// - Informações do jogo (nome/ID)
// - Detalhes por jogo (CS:GO / LoL) e genéricos
// - Múltiplos formatos de payload vindos do backend (_raw / camelCase / snake)
// ============================================================================

import { useEffect, useMemo, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import anuncioService from '../../services/anuncioService.js';
import './DetalheAnuncio.css';
import AuthBrand from '../../components/logo/AuthBrand.jsx';

// --------- Utilitários de formatação ----------
function fmtBRL(n) {
  const v = Number(n);
  if (!Number.isFinite(v)) return '—';
  return v.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

// Retorna a melhor imagem disponível
function pegarImagem(a) {
  return (
    a?.image ||
    a?.skinImageUrl ||
    a?.imagemUrl ||
    a?._raw?.skinImageUrl ||
    '/img/placeholder.png'
  );
}

// Protege acesso ao _raw
function getRaw(a) {
  return a?._raw || {};
}

// ------------ Normalizadores de jogo/detalhes ------------
/**
 * Resolve nome e id do jogo a partir de várias possíveis chaves.
 * Aceita estruturas como:
 *  - _raw.jogo = { id, nome }
 *  - _raw.jogoNome / jogoNome / gameName
 *  - anuncio.jogo?.nome / game?.name
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

  return {
    nome: candidatosNome[0] || null,
    id: candidatosId[0] || null,
  };
}

/**
 * Resolve detalhes por jogo em várias chaves comuns:
 *  - _raw.detalhesCsgo / _raw.detalhesLol
 *  - _raw.detalhes = { csgo: {...}, lol: {...}, ... }
 *  - anuncio.detalhes / anuncio.details (genérico)
 */
function resolverDetalhes(anuncio) {
  const raw = getRaw(anuncio);

  // Específicos CS:GO / LoL
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

  // Genérico (qualquer outro jogo)
  const detalhesGenericos =
    raw?.detalhes ||
    anuncio?.detalhes ||
    raw?.details ||
    anuncio?.details ||
    null;

  return { detalhesCsgo, detalhesLol, detalhesGenericos };
}

// ------------ Bloco de renderização dos detalhes por jogo ------------
function DetalhesPorJogo({
  jogoNome,
  detalhesCsgo,
  detalhesLol,
  detalhesGenericos,
}) {
  // Nada a renderizar
  if (!jogoNome && !detalhesCsgo && !detalhesLol && !detalhesGenericos)
    return null;

  // CS:GO
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

  // League of Legends
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

  // Qualquer outro jogo: tenta imprimir objeto genérico (chave:valor)
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

export default function DetalheAnuncio() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [anuncio, setAnuncio] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [liked, setLiked] = useState(false);
  const [loadingLike, setLoadingLike] = useState(false);

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

  async function alternarFavorito() {
    if (loadingLike) return;
    setLoadingLike(true);
    try {
      if (liked) await anuncioService.unlikeAnuncio(id);
      else await anuncioService.likeAnuncio(id);
      setLiked((v) => !v);
    } catch (err) {
      console.error('Erro ao alternar favorito:', err);
    } finally {
      setLoadingLike(false);
    }
  }

  const raw = useMemo(() => getRaw(anuncio), [anuncio]);
  const jogoInfo = useMemo(() => resolverInfoJogo(anuncio), [anuncio]);
  const { detalhesCsgo, detalhesLol, detalhesGenericos } = useMemo(
    () => resolverDetalhes(anuncio),
    [anuncio],
  );

  const linkExterno = raw?.linkExterno || '#';

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

  return (
    <div className="detalhe-root">
      <div className="detalhe-topbar">
        <AuthBrand />
        <Link to="/" className="btn btn--ghost sm">
          Voltar à Vitrine
        </Link>
      </div>

      <div className="detalhe-card">
        {/* Imagem e badge do jogo */}
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

        <div className="detalhe-info">
          <h1>{anuncio.title || anuncio.titulo || 'Skin'}</h1>
          <p className="preco">R$ {fmtBRL(anuncio.price ?? anuncio.preco)}</p>

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

          {/* Informações do jogo (aparece se houver nome, id ou quaisquer detalhes) */}
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

              {/* Fallback simples caso só existam detalhes genéricos e nenhum nome */}
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

          {/* Detalhes por jogo (dinâmico + genérico) */}
          <DetalhesPorJogo
            jogoNome={jogoInfo?.nome}
            detalhesCsgo={detalhesCsgo}
            detalhesLol={detalhesLol}
            detalhesGenericos={detalhesGenericos}
          />

          {/* Favoritar */}
          <button
            className={`btn-like ${liked ? 'ativo' : ''}`}
            disabled={loadingLike}
            onClick={alternarFavorito}
          >
            {liked ? '★ Favoritado' : '☆ Favoritar'}
          </button>

          {/* Ações */}
          <div className="detalhe-acoes">
            <button className="btn btn--ghost" onClick={() => navigate(-1)}>
              Voltar
            </button>
            <button
              className="btn btn--primary"
              onClick={() => window.open(linkExterno, '_blank')}
              disabled={!raw?.linkExterno}
              title={
                raw?.linkExterno ? 'Ir para a compra' : 'Link indisponível'
              }
            >
              Comprar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
