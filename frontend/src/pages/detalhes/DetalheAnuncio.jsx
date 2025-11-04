// frontend/src/pages/DetalheAnuncio.jsx
// ============================================================================
// Página de detalhes de um anúncio de skin.
// - Busca o anúncio por ID e exibe imagem, preço, vendedor, descrição
// - Integra botão de Favoritar/Desfavoritar
// - NOVO: Exibe "Informações do jogo" + "Detalhes do jogo" (CS:GO/LoL)
// - Visual consistente com o tema (neon/escuro) e classes CSS dedicadas
// ============================================================================

import { useEffect, useMemo, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import anuncioService from '../../services/anuncioService.js';
import './DetalheAnuncio.css';
import AuthBrand from '../../components/logo/AuthBrand.jsx';

/** Formata número em BRL (com fallback). */
function fmtBRL(n) {
  const v = Number(n);
  if (!Number.isFinite(v)) return '—';
  return v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/** Normaliza a melhor URL de imagem disponível no anúncio. */
function pegarImagem(anuncio) {
  return (
    anuncio?.image ||
    anuncio?.skinImageUrl ||
    anuncio?.imagemUrl ||
    anuncio?._raw?.skinImageUrl ||
    '/img/placeholder.png'
  );
}

/** Lê com segurança propriedades aninhadas do backend. */
function getRaw(anuncio) {
  return anuncio?._raw || {};
}

/** Componente auxiliar: renderiza os detalhes específicos por jogo. */
function DetalhesPorJogo({ jogoNome, detalhesCsgo, detalhesLol }) {
  // Caso não haja jogo, não renderiza
  if (!jogoNome) return null;

  // CS:GO
  if (jogoNome === 'CS:GO') {
    const temAlgo =
      detalhesCsgo &&
      (detalhesCsgo.desgasteFloat || detalhesCsgo.patternIndex || detalhesCsgo.exterior || detalhesCsgo.statTrak);

    if (!temAlgo) return null;

    return (
      <fieldset className="box box--detalhes" tabIndex={0}>
        <legend>Detalhes (CS:GO)</legend>

        <div className="kv-grid">
          <div className="kv">
            <span className="k">Desgaste (Float)</span>
            <span className="v">{detalhesCsgo.desgasteFloat || '—'}</span>
          </div>
          <div className="kv">
            <span className="k">Pattern Index</span>
            <span className="v">{detalhesCsgo.patternIndex || '—'}</span>
          </div>
        </div>

        <div className="kv">
          <span className="k">Exterior</span>
          <span className="v">{detalhesCsgo.exterior || '—'}</span>
        </div>

        <div className="kv">
          <span className="k">StatTrak™</span>
          <span className="v">{detalhesCsgo.statTrak ? 'Sim' : 'Não'}</span>
        </div>
      </fieldset>
    );
  }

  // League of Legends
  if (jogoNome === 'League of Legends') {
    const temAlgo =
      detalhesLol && (detalhesLol.championName || detalhesLol.tipoSkin || detalhesLol.chroma);

    if (!temAlgo) return null;

    return (
      <fieldset className="box box--detalhes" tabIndex={0}>
        <legend>Detalhes (LoL)</legend>

        <div className="kv">
          <span className="k">Campeão</span>
          <span className="v">{detalhesLol.championName || '—'}</span>
        </div>
        <div className="kv">
          <span className="k">Tipo/Raridade</span>
          <span className="v">{detalhesLol.tipoSkin || '—'}</span>
        </div>
        <div className="kv">
          <span className="k">Chroma</span>
          <span className="v">{detalhesLol.chroma || '—'}</span>
        </div>
      </fieldset>
    );
  }

  // Outros jogos (não definidos): mostra apenas um aviso
  return (
    <fieldset className="box box--detalhes" tabIndex={0}>
      <legend>Detalhes do jogo</legend>
      <div className="kv">
        <span className="k">Jogo</span>
        <span className="v">{jogoNome}</span>
      </div>
      <div className="kv">
        <span className="k">Detalhes</span>
        <span className="v">Sem campos específicos para este jogo.</span>
      </div>
    </fieldset>
  );
}

export default function DetalheAnuncio() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [anuncio, setAnuncio] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  // Estado de like/favorito
  const [liked, setLiked] = useState(false);
  const [loadingLike, setLoadingLike] = useState(false);

  // Carrega anúncio por ID
  useEffect(() => {
    let cancel = false;

    async function carregar() {
      try {
        setCarregando(true);
        setErro('');
        const dados = await anuncioService.buscarPorId(id);
        if (cancel) return;

        setAnuncio(dados);
        setLiked(Boolean(dados?._raw?.liked || false));
      } catch (e) {
        if (cancel) return;
        setErro('Não foi possível carregar o anúncio.');
      } finally {
        if (!cancel) setCarregando(false);
      }
    }

    carregar();
    return () => {
      cancel = true;
    };
  }, [id]);

  // Alterna favorito (like/unlike)
  async function alternarFavorito() {
    if (loadingLike) return;
    setLoadingLike(true);
    try {
      if (liked) {
        await anuncioService.unlikeAnuncio(id);
      } else {
        await anuncioService.likeAnuncio(id);
      }
      setLiked((v) => !v);
    } catch (err) {
      console.error('Erro ao alternar favorito:', err);
    } finally {
      setLoadingLike(false);
    }
  }

  // Normalizações / memos para exibição
  const raw = useMemo(() => getRaw(anuncio), [anuncio]);

  const jogoInfo = useMemo(() => {
    // Preferimos o que vem estruturado em _raw.jogo
    const j = raw?.jogo;
    if (j && (j.nome || j.id)) {
      return { id: j.id ?? null, nome: j.nome ?? null };
    }
    // Fallbacks de nome/id se vierem espalhados
    return {
      id: anuncio?.jogoId ?? raw?.jogoId ?? null,
      nome: anuncio?.jogoNome ?? raw?.jogoNome ?? null,
    };
  }, [raw, anuncio]);

  const linkExterno = useMemo(() => raw?.linkExterno || '#', [raw]);

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
      {/* Topbar */}
      <div className="detalhe-topbar">
        <AuthBrand />
        <Link to="/" className="btn btn--ghost sm">
          Voltar à Vitrine
        </Link>
      </div>

      {/* Card principal */}
      <div className="detalhe-card">
        {/* Imagem */}
        <div className="detalhe-imagem">
          <img
            src={pegarImagem(anuncio)}
            alt={anuncio.title || anuncio.titulo || 'Skin'}
            onError={(e) => (e.currentTarget.src = '/img/placeholder.png')}
            loading="lazy"
          />
          {jogoInfo?.nome && (
            <span className="badge-jogo" title="Jogo">
              {jogoInfo.nome}
            </span>
          )}
        </div>

        {/* Informações */}
        <div className="detalhe-info">
          <h1>{anuncio.title || anuncio.titulo || 'Skin'}</h1>

          <p className="preco">R$ {fmtBRL(anuncio.price ?? anuncio.preco)}</p>

          <div className="kv">
            <span className="k">Vendedor</span>
            <span className="v">{anuncio.seller?.name || anuncio.usuarioNome || '—'}</span>
          </div>

          <div className="kv">
            <span className="k">Descrição</span>
            <span className="v">{raw?.descricao || 'Sem descrição.'}</span>
          </div>

          {/* Informações do Jogo */}
          {jogoInfo?.nome && (
            <fieldset className="box box--info" tabIndex={0}>
              <legend>Informações do jogo</legend>
              <div className="kv">
                <span className="k">Jogo</span>
                <span className="v">{jogoInfo.nome}</span>
              </div>
              {jogoInfo.id && (
                <div className="kv">
                  <span className="k">ID do jogo</span>
                  <span className="v">{jogoInfo.id}</span>
                </div>
              )}
            </fieldset>
          )}

          {/* Detalhes específicos por jogo (dinâmicos) */}
          <DetalhesPorJogo
            jogoNome={jogoInfo?.nome}
            detalhesCsgo={raw?.detalhesCsgo}
            detalhesLol={raw?.detalhesLol}
          />

          {/* Botão de Favoritar */}
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
              title={raw?.linkExterno ? 'Ir para a compra' : 'Link indisponível'}
            >
              Comprar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
