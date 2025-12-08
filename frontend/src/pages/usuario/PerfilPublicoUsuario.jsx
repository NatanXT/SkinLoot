// src/pages/usuario/PerfilPublicoUsuario.jsx
// ============================================================================
// Perfil público do vendedor
// - Usa a mesma shell visual do PerfilUsuario (navbar + hero + gradiente)
// - Mostra informações mockadas de reputação/ranking do vendedor
// - Lista anúncios deste vendedor usando o mesmo SkinCard da vitrine
// - Integra com o chat flutuante para contato
// ============================================================================

import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import './PerfilPublicoUsuario.css'; // reaproveita a mesma base de estilos

import { useAuth } from '../../services/AuthContext.jsx';
import anuncioService from '../../services/anuncioService.js';
import api from '../../services/api'; // Importante para buscar os anúncios
import SkinCard from '../../components/skin/SkinCard.jsx';
import ChatFlutuante from '../../components/chat/ChatFlutuante';
import AuthBrand from '../../components/logo/AuthBrand';

/**
 * Dados mock do vendedor enquanto o backend não existe
 */
const MOCK_VENDOR = {
  id: 'demo-seller',
  name: 'Vendedor Demo',
  memberSince: '2023-05-10T00:00:00Z',
  totalSales: 128,
  avgRating: 4.8,
};

/**
 * Avaliações mock, reaproveitando a ideia do DetalheAnuncio
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

  // --- Estados de Dados ---
  const [vendor, setVendor] = useState(null);
  const [sellerSkins, setSellerSkins] = useState([]);
  const [reviews, setReviews] = useState([]);

  // Estados de Controle UI
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Paginação de Reviews
  const [reviewPage, setReviewPage] = useState(0);

  // Chat e Likes
  const [chatOpen, setChatOpen] = useState(null);
  const [likes, setLikes] = useState(() => new Set());

  // Modal de Avaliação
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');

  // --- BUSCA DE DADOS (Efeito Principal) ---
  useEffect(() => {
    let isMounted = true; // Para evitar updates se o componente desmontar

    // console.log("PerfilPublico - Params Recebidos:", params);
    // console.log("PerfilPublico - ID extraído:", id);

    async function fetchData() {
      if (!id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError('');

        // 1. Buscar Anúncios (Skins)
        let listaSkins = [];
        try {
          const resAnuncios = await api.get(`/anuncios/usuario/${id}/ativos`);
          const rawAnuncios = resAnuncios.data || [];
          listaSkins = rawAnuncios.map(a =>
              anuncioService.normalizarDoBackend ? anuncioService.normalizarDoBackend(a) : a
          ).sort((a, b) => toMs(b.listedAt) - toMs(a.listedAt));
        } catch (e) {
          console.warn("Sem anúncios ou erro ao buscar skins:", e);
          // Não tratamos como erro fatal, pois o usuário pode apenas não ter anúncios
        }

        // 2. Buscar Avaliações
        let listaReviews = [];
        try {
          const resReviews = await anuncioService.buscarAvaliacoesDoVendedor(id);
          const arrayReviews = Array.isArray(resReviews) ? resReviews : [];

          listaReviews = arrayReviews.map(r => ({
            id: r.id,
            authorName: r.avaliadorNome || 'Usuário',
            rating: Number(r.nota) || 0,
            comment: r.comentario,
            createdAt: r.dataCriacao
          }));
        } catch (e) {
          console.warn("Erro ao buscar reviews:", e);
        }

        // 3. Montar Objeto do Vendedor
        // Tenta pegar dados dos anúncios, senão usa fallback
        let nomeVendedor = 'Usuário da SkinLoot';
        let dataEntrada = new Date().toISOString(); // Fallback para hoje se não tiver info

        // Tenta extrair info real do primeiro anúncio
        if (listaSkins.length > 0) {
          const ref = listaSkins[0];
          const possivelNome = ref.usuarioNome || ref.seller?.name || ref.vendedorNome;
          if (possivelNome) nomeVendedor = possivelNome;

          const possivelData = ref.seller?.createdAt;
          if (possivelData) dataEntrada = possivelData;
        }
        // Se não tiver anúncios, poderíamos ter um endpoint /users/public/{id},
        // mas por enquanto usamos o ID ou placeholder.

        // Calcular média
        let mediaReal = 0;
        if (listaReviews.length > 0) {
          const soma = listaReviews.reduce((acc, r) => acc + r.rating, 0);
          mediaReal = soma / listaReviews.length;
        }

        if (isMounted) {
          setSellerSkins(listaSkins);
          setReviews(listaReviews);
          setVendor({
            id: id,
            name: nomeVendedor,
            memberSince: dataEntrada,
            totalSales: listaReviews.length, // Proxy temporário
            avgRating: mediaReal
          });
        }

      } catch (err) {
        console.error("Erro fatal ao carregar perfil:", err);
        if (isMounted) setError("Não foi possível carregar as informações deste vendedor.");
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchData();

    return () => { isMounted = false; };
  }, [id]);


  // --- Lógica de Interação ---

  const initials = useMemo(() => {
    const base = vendor?.name || 'U';
    return base.slice(0, 2).toUpperCase();
  }, [vendor]);

  // Paginação Reviews
  const reviewsPerPage = 3;
  const totalReviews = reviews.length;
  const totalPages = Math.max(1, Math.ceil(totalReviews / reviewsPerPage));
  const safePage = Math.min(reviewPage, totalPages - 1);
  const pageStart = safePage * reviewsPerPage;
  const reviewsPageItems = reviews.slice(pageStart, pageStart + reviewsPerPage);

  function handlePrevPage() { setReviewPage(p => Math.max(0, p - 1)); }
  function handleNextPage() { setReviewPage(p => Math.min(totalPages - 1, p + 1)); }

  // Likes
  const handleLikeToggle = (keyId) => {
    setLikes((prev) => {
      const next = new Set(prev);
      if (next.has(keyId)) next.delete(keyId); else next.add(keyId);
      return next;
    });
  };

  // Chat / Auth Check
  function exigirLogin(acao, payload) {
    if (!user) {
      navigate('/login', { state: { returnTo: window.location.pathname, acao, payload } });
      return true;
    }
    return false;
  }

  function abrirChatPara(anuncio) {
    if (exigirLogin('contato', { anuncioId: anuncio?.id })) return;
    setChatOpen({
      seller: { id: vendor.id, nome: vendor.name },
      skin: { id: anuncio.id, titulo: anuncio.title || anuncio.skinNome, preco: anuncio.price || anuncio.preco },
    });
  }

  function comprarFora(anuncio) {
    const url = anuncio.linkExterno || '#';
    if (url !== '#') window.open(url, '_blank');
    else abrirChatPara(anuncio);
  }

  // Avaliação (Submit Mock)
  function handleSubmitReview(e) {
    e.preventDefault();
    if (exigirLogin('avaliar', { vendedorId: id })) return;
    alert("Funcionalidade de avaliação será implementada no backend em breve!");
    setIsReviewModalOpen(false);
    setReviewComment('');
    setReviewRating(0);
  }

  // --- Renderização ---

  // Tela de Loading
  if (loading) {
    return (
        <div className="perfil-root" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="perfil-loading">
            <span className="spinner"></span> Carregando perfil...
          </div>
        </div>
    );
  }

  // Tela de Erro ou Não Encontrado
  if (error || !vendor) {
    return (
        <div className="perfil-root" style={{ paddingTop: '100px', textAlign: 'center' }}>
          <p className="perfil-error" style={{ color: '#ff6b6b', fontSize: '1.2rem' }}>
            {error || "Vendedor não encontrado."}
          </p>
          <button className="btn btn--ghost" onClick={() => navigate(-1)} style={{ marginTop: '20px' }}>
            Voltar
          </button>
        </div>
    );
  }

  // Dados calculados para render
  const { level, description, badgeModifier, score } = computeTrustLevel(vendor.avgRating, vendor.totalSales);

  return (
      <div className="perfil-root">
        {/* Navbar Simplificada */}
        <div className="perfil-topbar">
          <AuthBrand />
          <div className="perfil-actions">
            <button type="button" className="btn btn--ghost sm" onClick={() => navigate(-1)}>
              Voltar
            </button>
          </div>
        </div>

        <header className="perfil-hero">
          <div className="perfil-hero__copy">
            <h1>Perfil público do vendedor</h1>
            <p>Veja informações, reputação e os anúncios ativos.</p>
          </div>
        </header>

        <div className="perfil-container">
          {/* === CARD PRINCIPAL DO VENDEDOR === */}
          <section className="perfil-publico__card">
            <div className="perfil-publico__left">
              <div className="perfil-publico__avatar">{initials}</div>
              <div className="perfil-publico__info">
                <h2>{vendor.name}</h2>
                <p className="perfil-publico__since">
                  {formatSince(vendor.memberSince)}
                </p>
              </div>
            </div>

            <div className="perfil-publico__right">
              <div className="perfil-publico__ranking-card">
              <span className={`perfil-publico__ranking-badge ${badgeModifier}`}>
                {level}
              </span>
                <p className="perfil-publico__ranking-text">
                  {description}
                </p>

                <div className="perfil-publico__ranking-bar">
                  <div className="perfil-publico__ranking-bar-track">
                    <div
                        className="perfil-publico__ranking-bar-fill"
                        style={{ '--nivel-pct': `${score}%` }}
                    />
                  </div>
                  <div className="perfil-publico__ranking-bar-legend">
                    <span>Iniciante</span><span>Médio</span><span>Alto</span><span>Top</span>
                  </div>
                </div>

                <div className="perfil-publico__ranking-metrics">
                <span className="perfil-publico__ranking-pill">
                  Nota {Number(vendor.avgRating).toFixed(1)}
                </span>
                  <span className="perfil-publico__ranking-pill">
                  {totalReviews} avaliações
                </span>
                  <span className="perfil-publico__ranking-pill">
                  {vendor.totalSales} vendas est.
                </span>
                </div>
              </div>
            </div>
          </section>

          {/* === SEÇÃO DE AVALIAÇÕES === */}
          <section className="perfil-publico__reviews">
            <header className="perfil-publico__reviews-header">
              <div>
                <h3 className="perfil-publico__reviews-title">Avaliações</h3>
                <span className="perfil-publico__reviews-count">
                {totalReviews} opiniões
              </span>
              </div>

              <div className="perfil-publico__reviews-summary">
                <div className="perfil-publico__reviews-score">
                  <span className="perfil-publico__reviews-score-value">{Number(vendor.avgRating).toFixed(1)}</span>
                </div>
                <RatingStars value={vendor.avgRating} />

                {totalReviews > 0 && (
                    <div className="perfil-publico__reviews-actions">
                      <button className="perfil-publico__reviews-arrow" onClick={handlePrevPage} disabled={safePage === 0}>‹</button>
                      <button className="perfil-publico__reviews-arrow" onClick={handleNextPage} disabled={safePage >= totalPages - 1}>›</button>
                    </div>
                )}
              </div>
            </header>

            {totalReviews === 0 ? (
                <div className="perfil-publico__reviews-empty">
                  <p>Este vendedor ainda não possui avaliações públicas.</p>
                </div>
            ) : (
                <div className="perfil-publico__reviews-list">
                  {reviewsPageItems.map((review, idx) => (
                      <article key={review.id || idx} className="perfil-publico__review-item">
                        <div className="perfil-publico__review-top">
                          <div>
                            <div className="perfil-publico__review-author">
                              {review.authorName}
                            </div>
                            <div className="perfil-publico__review-date">
                              {formatDate(review.createdAt)}
                            </div>
                          </div>
                          <RatingStars value={review.rating} />
                        </div>
                        <p className="perfil-publico__review-comment">
                          {review.comment || 'Sem comentário.'}
                        </p>
                      </article>
                  ))}
                </div>
            )}

            <div className="perfil-publico__reviews-footer">
              <button
                  type="button"
                  className="perfil-publico__reviews-button"
                  onClick={() => setIsReviewModalOpen(true)}
              >
                Avaliar este vendedor
              </button>
            </div>
          </section>

          {/* === SEÇÃO DE ANÚNCIOS (VITRINE) === */}
          <section className="perfil-publico__section">
            <h3>Anúncios ativos de {vendor.name}</h3>

            {sellerSkins.length === 0 ? (
                <div className="perfil-publico__placeholder">
                  <p>Nenhum anúncio ativo no momento.</p>
                </div>
            ) : (
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

        {/* === MODAL DE AVALIAÇÃO === */}
        {isReviewModalOpen && (
            <div className="perfil-publico__modal-backdrop" role="dialog" aria-modal="true">
              <div className="perfil-publico__modal">
                <header className="perfil-publico__modal-header">
                  <h2 className="perfil-publico__modal-title">Avaliar vendedor</h2>
                  <button className="perfil-publico__modal-close" onClick={() => setIsReviewModalOpen(false)}>×</button>
                </header>
                <p className="perfil-publico__modal-subtitle">
                  Como foi sua experiência com <strong>{vendor.name}</strong>?
                </p>
                <form onSubmit={handleSubmitReview}>
                  <div className="perfil-publico__modal-field">
                    <label className="perfil-publico__modal-label">Nota</label>
                    <div className="perfil-publico__modal-stars">
                      {[1, 2, 3, 4, 5].map(v => (
                          <button
                              key={v}
                              type="button"
                              className={`perfil-publico__modal-star ${v <= reviewRating ? 'perfil-publico__modal-star--active' : ''}`}
                              onClick={() => setReviewRating(v)}
                          >
                            ★
                          </button>
                      ))}
                    </div>
                  </div>
                  <div className="perfil-publico__modal-field">
                    <label className="perfil-publico__modal-label">Comentário</label>
                    <textarea
                        className="perfil-publico__modal-textarea"
                        rows={4}
                        placeholder="Ex: Vendedor rápido, produto entregue conforme combinado..."
                        value={reviewComment}
                        onChange={e => setReviewComment(e.target.value)}
                    />
                  </div>
                  <div className="perfil-publico__modal-actions">
                    <button type="button" className="perfil-publico__modal-button perfil-publico__modal-button--ghost" onClick={() => setIsReviewModalOpen(false)}>Cancelar</button>
                    <button type="submit" className="perfil-publico__modal-button perfil-publico__modal-button--primary">Enviar</button>
                  </div>
                </form>
              </div>
            </div>
        )}

        {/* === CHAT FLUTUANTE === */}
        {user && chatOpen && (
            <div className="chat-float">
              <ChatFlutuante
                  usuarioAlvo={chatOpen}
                  onFechar={() => setChatOpen(null)}
              />
            </div>
        )}
      </div>
  );
}
