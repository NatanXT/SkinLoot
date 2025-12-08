// src/pages/usuario/PerfilPublicoUsuario.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import './PerfilUsuario.css'; // reaproveita a mesma base de estilos

import { useAuth } from '../../services/AuthContext.jsx';
import anuncioService from '../../services/anuncioService.js';
import SkinCard from '../../components/skin/SkinCard.jsx';
import ChatFlutuante from '../../components/chat/ChatFlutuante';
import AuthBrand from '../../components/logo/AuthBrand';

const MOCK_VENDOR = {
  id: 'demo-seller',
  name: 'Vendedor Demo',
  memberSince: '2023-05-10T00:00:00Z',
  totalSales: 128,
  avgRating: 4.8,
};

/**
 * Avaliações reaproveitando a ideia do DetalheAnuncio
 */
const MOCK_REVIEWS = [
  {
    id: 'rev-1',
    authorName: 'Jogador Anônimo',
    rating: 5,
    comment: 'Entrega rápida e super atencioso. Recomendo muito.',
    createdAt: '2024-01-10',
  },
  {
    id: 'rev-2',
    authorName: 'Cliente recorrente',
    rating: 4,
    comment: 'Negociação tranquila, respondeu todas as dúvidas.',
    createdAt: '2024-02-05',
  },
  {
    id: 'rev-3',
    authorName: 'Comprador verificado',
    rating: 5,
    comment: 'Tudo conforme combinado, voltaria a comprar com ele.',
    createdAt: '2024-03-12',
  },
  {
    id: 'rev-4',
    authorName: 'Usuário frequente',
    rating: 5,
    comment: 'Atendimento excelente em todas as compras.',
    createdAt: '2024-03-20',
  },
];

/**
 * Formata data em dd/mm/aaaa
 */
function formatDate(value) {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('pt-BR');
}

/**
 * Formata “na plataforma desde …”
 */
function formatSince(value) {
  if (!value) return 'Na plataforma';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return 'Na plataforma';
  const month = d.toLocaleDateString('pt-BR', { month: 'long' });
  const year = d.getFullYear();
  return `Na plataforma desde ${month} de ${year}`;
}

/**
 * Desenha estrelas de 0–5
 */
function RatingStars({ value }) {
  const numeric = Number.isFinite(Number(value)) ? Number(value) : 0;
  const full = Math.round(numeric);

  return (
    <span
      className="perfil-publico__stars"
      aria-label={`Nota ${numeric.toFixed(1)} de 5`}
    >
      {Array.from({ length: 5 }).map((_, index) => (
        <svg
          key={index}
          viewBox="0 0 24 24"
          className={
            index < full
              ? 'perfil-publico__star perfil-publico__star--full'
              : 'perfil-publico__star'
          }
        >
          <path
            fill="currentColor"
            d="M12 2.25 9.19 8.26l-6.69.49 5.12 4.37-1.56 6.63L12 16.77l5.94 2.98-1.56-6.63 5.12-4.37-6.69-.49L12 2.25Z"
          />
        </svg>
      ))}
    </span>
  );
}

/**
 * Converte datas para timestamp em ms
 */
const toMs = (v) => {
  const t = typeof v === 'string' ? Date.parse(v) : Number(v);
  return Number.isFinite(t) ? t : Date.now();
};

/**
 * Pega o id do vendedor a partir do anúncio (várias formas possíveis)
 */
function getSellerIdFromAnuncio(anuncio) {
  return (
    anuncio?.usuarioId ??
    anuncio?.seller?.id ??
    anuncio?.vendedorId ??
    anuncio?._raw?.usuarioId ??
    anuncio?._raw?.seller?.id ??
    anuncio?._raw?.vendedorId ??
    null
  );
}

/**
 * Pega o nome do vendedor a partir do anúncio (fallback para textos)
 */
function getSellerNameFromAnuncio(anuncio) {
  return (
    anuncio?.usuarioNome ??
    anuncio?.seller?.name ??
    anuncio?.vendedorNome ??
    anuncio?._raw?.usuarioNome ??
    anuncio?._raw?.seller?.name ??
    anuncio?._raw?.vendedorNome ??
    'Usuário'
  );
}

/**
 * Calcula nível de confiança (mesma ideia do DetalheAnuncio)
 */
function computeTrustLevel(avgRating, totalSales) {
  const avg = Number.isFinite(Number(avgRating)) ? Number(avgRating) : 0;
  const sales = Number.isFinite(Number(totalSales)) ? Number(totalSales) : 0;

  const ratingScore = (avg / 5) * 70;
  const salesScore = (Math.min(sales, 50) / 50) * 30;
  const score = Math.min(100, Math.round(ratingScore + salesScore));

  let level = 'Novo vendedor';
  let description = 'Ainda está construindo reputação na plataforma.';
  let badgeModifier = 'perfil-publico__ranking-badge--new';

  if (score >= 85) {
    level = 'Vendedor Nível Platinum';
    description = 'É um dos melhores vendedores da plataforma.';
    badgeModifier = 'perfil-publico__ranking-badge--high';
  } else if (score >= 65) {
    level = 'Vendedor Nível Ouro';
    description = 'Mantém bom histórico de vendas e atendimento.';
    badgeModifier = 'perfil-publico__ranking-badge--medium';
  } else if (score >= 40) {
    level = 'Vendedor Nível Prata';
    description = 'Vendedor em crescimento, com desempenho estável.';
    badgeModifier = 'perfil-publico__ranking-badge--low';
  }

  return { level, description, badgeModifier, score };
}

/**
 * Componente principal de perfil público do usuário (vendedor)
 */
export default function PerfilPublicoUsuario() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();

  const vendor = useMemo(
    () => ({
      ...MOCK_VENDOR,
      id: id || MOCK_VENDOR.id,
    }),
    [id],
  );

  const initials = useMemo(() => {
    const base = vendor.name || 'Usuário';
    return base
      .split(' ')
      .filter(Boolean)
      .map((part) => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }, [vendor.name]);

  const totalReviews = MOCK_REVIEWS.length;
  const avgRating = vendor.avgRating;
  const totalSales = vendor.totalSales;

  const { level, description, badgeModifier, score } = computeTrustLevel(
    avgRating,
    totalSales,
  );

  // Carrossel de avaliações
  const [reviewPage, setReviewPage] = useState(0);
  const reviewsPerPage = 3;
  const totalPages = Math.max(
    1,
    Math.ceil((totalReviews || 1) / reviewsPerPage),
  );
  const safePage = Math.min(reviewPage, totalPages - 1);
  const pageStart = safePage * reviewsPerPage;
  const pageEnd = pageStart + reviewsPerPage;
  const reviewsPageItems =
    totalReviews > 0 ? MOCK_REVIEWS.slice(pageStart, pageEnd) : [];

  function handlePrevPage() {
    setReviewPage((current) => Math.max(0, current - 1));
  }

  function handleNextPage() {
    setReviewPage((current) => Math.min(totalPages - 1, current + 1));
  }

  // Modal de avaliação do vendedor (visual apenas)
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');

  function openReviewModal() {
    setIsReviewModalOpen(true);
  }

  function closeReviewModal() {
    setIsReviewModalOpen(false);
    setReviewRating(0);
    setReviewComment('');
  }

  function handleSubmitReview(event) {
    event.preventDefault();
    if (reviewRating <= 0) {
      alert('Selecione uma nota para o vendedor.');
      return;
    }

    console.log('Simulando envio de avaliação do vendedor público:', {
      sellerId: vendor.id,
      rating: reviewRating,
      comment: reviewComment,
    });

    closeReviewModal();
  }

  /*  Estado e lógica dos anúncios (skins) deste vendedor */
  const [sellerSkins, setSellerSkins] = useState([]);
  const [skinsLoading, setSkinsLoading] = useState(false);
  const [skinsError, setSkinsError] = useState('');
  const [likes, setLikes] = useState(() => new Set());

  const [chatOpen, setChatOpen] = useState(null);
  const [unreads, setUnreads] = useState(0);

  // Exige login para certas ações
  function exigirLogin(acao, payload) {
    if (!user) {
      navigate('/login', {
        state: {
          returnTo: window.location.pathname + window.location.search,
          acao,
          payload,
        },
        replace: true,
      });
      return true;
    }
    return false;
  }

  function abrirChatPara(anuncio) {
    if (exigirLogin('contato', { anuncioId: anuncio?.id })) return;

    const sellerId = getSellerIdFromAnuncio(anuncio);
    const sellerName = getSellerNameFromAnuncio(anuncio);

    const nomeSkin = anuncio.title ?? anuncio.skinNome ?? 'Skin';
    const precoSkin = anuncio.price ?? anuncio.preco ?? 0;

    const safeSellerId = sellerId
      ? String(sellerId)
      : `temp-${anuncio?.id || anuncio?._id}`;

    setChatOpen({
      seller: { id: safeSellerId, nome: sellerName },
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

    if (url && url !== '#') {
      window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      abrirChatPara(anuncio);
    }
  }

  const handleLikeToggle = (keyId) => {
    setLikes((prev) => {
      const next = new Set(prev);
      if (next.has(keyId)) next.delete(keyId);
      else next.add(keyId);
      return next;
    });
  };

  // Carrega as skins deste vendedor a partir do feed normalizado
  useEffect(() => {
    let active = true;

    async function loadSellerSkins() {
      if (!id) {
        setSellerSkins([]);
        setSkinsError('Vendedor não encontrado.');
        return;
      }

      try {
        setSkinsLoading(true);
        setSkinsError('');

        const feed = await anuncioService.listarFeedNormalizado();
        const lista = Array.isArray(feed) ? feed : [];

        const filtrados = lista.filter((anuncio) => {
          const sellerId = getSellerIdFromAnuncio(anuncio);
          return (
            sellerId !== null &&
            sellerId !== undefined &&
            String(sellerId) === String(id)
          );
        });

        const normalizados = filtrados
          .map((a) => ({
            ...a,
            listedAt: toMs(a?.listedAt ?? a?.createdAt),
          }))
          .sort((a, b) => b.listedAt - a.listedAt);

        if (!active) return;
        setSellerSkins(normalizados);
      } catch (error) {
        console.error(
          'Falha ao carregar os anúncios deste vendedor (perfil público).',
          error,
        );
        if (!active) return;
        setSkinsError(
          'Não foi possível carregar os anúncios deste vendedor no momento.',
        );
        setSellerSkins([]);
      } finally {
        if (active) setSkinsLoading(false);
      }
    }

    loadSellerSkins();

    return () => {
      active = false;
    };
  }, [id]);

  const totalSkins = sellerSkins.length;

  return (
    <div className="perfil-root">
      {/* Topbar igual ao perfil, com Voltar à direita */}
      <div className="perfil-topbar">
        <AuthBrand />

        <div className="perfil-actions">
          <button
            type="button"
            className="btn btn--ghost sm"
            onClick={() => navigate(-1)}
          >
            Voltar
          </button>
        </div>
      </div>

      {/* Hero com o mesmo gradiente, mas texto de perfil público */}
      <header className="perfil-hero">
        <div className="perfil-hero__copy">
          <h1>Perfil público do vendedor</h1>
          <p>Veja informações do vendedor e os anúncios ativos.</p>
        </div>
      </header>

      {/* Conteúdo principal reaproveitando a mesma largura/container */}
      <div className="perfil-container">
        {/* Card principal: dados básicos + ranking */}
        <section className="perfil-publico__card">
          <div className="perfil-publico__left">
            <div className="perfil-publico__avatar">{initials}</div>

            <div className="perfil-publico__info">
              <p className="perfil-publico__demo">
                Dados de perfil e ranking são mockados enquanto o backend não
                está pronto.
              </p>
              <h2>{vendor.name}</h2>
              <p className="perfil-publico__since">
                {formatSince(vendor.memberSince)}
              </p>
            </div>
          </div>

          <div className="perfil-publico__right">
            <div className="perfil-publico__ranking-card">
              <span
                className={`perfil-publico__ranking-badge ${badgeModifier}`}
              >
                {level}
              </span>

              <p className="perfil-publico__ranking-text">
                {description} Este painel será alimentado automaticamente assim
                que integrarmos com o backend.
              </p>

              <div className="perfil-publico__ranking-bar">
                <div className="perfil-publico__ranking-bar-track">
                  <div
                    className="perfil-publico__ranking-bar-fill"
                    style={{ '--nivel-pct': `${score}%` }}
                  />
                </div>
                <div className="perfil-publico__ranking-bar-legend">
                  <span>Baixa</span>
                  <span>Média</span>
                  <span>Alta</span>
                  <span>Excelente</span>
                </div>
              </div>

              <div className="perfil-publico__ranking-metrics">
                <span className="perfil-publico__ranking-pill">
                  Nota média {avgRating.toFixed(1)} / 5
                </span>
                <span className="perfil-publico__ranking-pill">
                  {totalReviews}{' '}
                  {totalReviews === 1
                    ? 'avaliação de compradores'
                    : 'avaliações de compradores'}
                </span>
                <span className="perfil-publico__ranking-pill">
                  {totalSales >= 100
                    ? '+100 vendas concluídas'
                    : `${totalSales} vendas concluídas`}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Bloco de avaliações */}
        <section className="perfil-publico__reviews">
          <header className="perfil-publico__reviews-header">
            <div>
              <h3 className="perfil-publico__reviews-title">
                Avaliações sobre este vendedor
              </h3>
              <span className="perfil-publico__reviews-count">
                {totalReviews}{' '}
                {totalReviews === 1
                  ? 'avaliação registrada'
                  : 'avaliações registradas'}
              </span>
            </div>

            <div className="perfil-publico__reviews-summary">
              <div className="perfil-publico__reviews-score">
                <span className="perfil-publico__reviews-score-value">
                  {avgRating.toFixed(1)}
                </span>
                <span className="perfil-publico__reviews-score-label">
                  média geral
                </span>
              </div>
              <RatingStars value={avgRating} />

              {totalReviews > 0 && (
                <div className="perfil-publico__reviews-actions">
                  <div className="perfil-publico__reviews-controls">
                    <button
                      type="button"
                      className="perfil-publico__reviews-arrow"
                      onClick={handlePrevPage}
                      disabled={safePage === 0}
                      aria-label="Ver avaliações anteriores"
                    >
                      ‹
                    </button>
                    <button
                      type="button"
                      className="perfil-publico__reviews-arrow"
                      onClick={handleNextPage}
                      disabled={safePage >= totalPages - 1}
                      aria-label="Ver próximas avaliações"
                    >
                      ›
                    </button>
                  </div>
                </div>
              )}
            </div>
          </header>

          {totalReviews === 0 ? (
            <p className="perfil-publico__reviews-empty">
              Ainda não há avaliações para este vendedor. Assim que as primeiras
              compras forem concluídas, os feedbacks aparecerão aqui.
            </p>
          ) : (
            <>
              <div className="perfil-publico__reviews-list">
                {reviewsPageItems.map((review) => (
                  <article
                    key={review.id}
                    className="perfil-publico__review-item"
                  >
                    <div className="perfil-publico__review-top">
                      <div>
                        <div className="perfil-publico__review-author">
                          {review.authorName || 'Comprador da plataforma'}
                        </div>
                        <div className="perfil-publico__review-date">
                          {formatDate(review.createdAt)}
                        </div>
                      </div>
                      <RatingStars value={review.rating} />
                    </div>

                    <p className="perfil-publico__review-comment">
                      {review.comment || 'Sem comentário adicional.'}
                    </p>
                  </article>
                ))}
              </div>

              <div className="perfil-publico__reviews-footer">
                <button
                  type="button"
                  className="perfil-publico__reviews-button"
                  onClick={openReviewModal}
                >
                  Avaliar este vendedor
                </button>

                {totalPages > 1 && (
                  <span className="perfil-publico__reviews-pagination">
                    Página {safePage + 1} de {totalPages}
                  </span>
                )}
              </div>
            </>
          )}
        </section>

        {/* Modal de avaliação (visual, ainda sem backend) */}
        {isReviewModalOpen && (
          <div
            className="perfil-publico__modal-backdrop"
            role="dialog"
            aria-modal="true"
          >
            <div className="perfil-publico__modal">
              <header className="perfil-publico__modal-header">
                <h2 className="perfil-publico__modal-title">Avaliar vendedor</h2>
                <button
                  type="button"
                  className="perfil-publico__modal-close"
                  onClick={closeReviewModal}
                  aria-label="Fechar"
                >
                  ×
                </button>
              </header>

              <p className="perfil-publico__modal-subtitle">
                Conte para outros compradores como foi a sua experiência com{' '}
                <strong>{vendor.name || 'este vendedor'}</strong>.
              </p>

              <form onSubmit={handleSubmitReview}>
                <div className="perfil-publico__modal-field">
                  <label className="perfil-publico__modal-label">
                    Nota do vendedor
                  </label>
                  <div className="perfil-publico__modal-stars">
                    {Array.from({ length: 5 }).map((_, idx) => {
                      const value = idx + 1;
                      const active = value <= reviewRating;
                      return (
                        <button
                          key={value}
                          type="button"
                          className={
                            active
                              ? 'perfil-publico__modal-star perfil-publico__modal-star--active'
                              : 'perfil-publico__modal-star'
                          }
                          onClick={() => setReviewRating(value)}
                          aria-label={`Dar nota ${value} de 5`}
                        >
                          ★
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="perfil-publico__modal-field">
                  <label className="perfil-publico__modal-label">
                    Comentário (opcional)
                  </label>
                  <textarea
                    className="perfil-publico__modal-textarea"
                    rows={4}
                    placeholder="Fale sobre atendimento, cumprimento do combinado, tempo de resposta..."
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                  />
                </div>

                <div className="perfil-publico__modal-actions">
                  <button
                    type="button"
                    className="perfil-publico__modal-button perfil-publico__modal-button--ghost"
                    onClick={closeReviewModal}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="perfil-publico__modal-button perfil-publico__modal-button--primary"
                  >
                    Enviar avaliação
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Anúncios deste vendedor */}
        <section className="perfil-publico__section">
          <h3>Anúncios deste vendedor</h3>

          {skinsLoading && (
            <p className="perfil-publico__placeholder">
              Carregando anúncios deste vendedor...
            </p>
          )}

          {!skinsLoading && skinsError && (
            <p className="perfil-publico__placeholder perfil-publico__placeholder--error">
              {skinsError}
            </p>
          )}

          {!skinsLoading && !skinsError && totalSkins === 0 && (
            <p className="perfil-publico__placeholder">
              Este vendedor ainda não possui skins ativas na plataforma.
            </p>
          )}

          {!skinsLoading && !skinsError && totalSkins > 0 && (
            <div className="perfil-publico__skins-grid">
              {sellerSkins.map((anuncio) => {
                const key = anuncio.id || anuncio._id;
                return (
                  <SkinCard
                    key={key}
                    data={anuncio}
                    liked={likes.has(key)}
                    onLike={() => handleLikeToggle(key)}
                    onContato={() => abrirChatPara(anuncio)}
                    onComprarFora={() => comprarFora(anuncio)}
                  />
                );
              })}
            </div>
          )}
        </section>
      </div>

      {/* Chat flutuante para o botão "Contato" dos cards */}
      {user &&
        (chatOpen ? (
          <div className="chat-float">
            <ChatFlutuante
              usuarioAlvo={chatOpen}
              onFechar={() => setChatOpen(null)}
            />
          </div>
        ) : (
          <button
            className="chat-mini-bubble"
            title="Mensagens"
            onClick={() => setChatOpen({ id: 'ultimo', nome: 'Mensagens' })}
          >
            <span className="chat-mini-bubble__icon">Chat</span>
            <span className="chat-mini-bubble__label">Mensagens</span>
            {unreads > 0 && (
              <span className="chat-mini-bubble__badge">{unreads}</span>
            )}
          </button>
        ))}
    </div>
  );
}
