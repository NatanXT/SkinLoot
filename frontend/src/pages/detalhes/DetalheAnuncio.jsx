// frontend/src/pages/DetalheAnuncio.jsx

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
 * Formata data em dd/mm/aaaa (para avaliações)
 */
function fmtData(valor) {
  if (!valor) return '';
  const d = new Date(valor);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('pt-BR');
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
// 3. COMPONENTES DE APOIO — Detalhes por jogo e reputação do vendedor
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
    jogoNome === 'Counter-Strike 2' ||
      jogoNome === 'CS2'
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
        <legend>Detalhes (Counter Strike)</legend>
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

/**
 * Dados fake para visual da seção enquanto o backend não existe
 */
const AVALIACOES_VENDEDOR_DEMO = [
  {
    id: 'demo-1',
    autorNome: 'Jogador Anônimo',
    nota: 5,
    comentario: 'Entrega rápida e super atencioso. Recomendo muito.',
    dataCriacao: '2024-01-10',
  },
  {
    id: 'demo-2',
    autorNome: 'Cliente recorrente',
    nota: 4,
    comentario: 'Negociação tranquila, respondeu todas as dúvidas.',
    dataCriacao: '2024-02-05',
  },
  {
    id: 'demo-3',
    autorNome: 'Comprador verificado',
    nota: 5,
    comentario: 'Tudo conforme combinado, voltaria a comprar com ele.',
    dataCriacao: '2024-03-12',
  },
  {
    id: 'demo-4',
    autorNome: 'Usuário frequente',
    nota: 5,
    comentario: 'Atendimento excelente em todas as compras.',
    dataCriacao: '2024-03-20',
  },
];

/**
 * Desenha as estrelas de uma nota (0–5)
 */
function EstrelasAvaliacao({ nota }) {
  const valor = Number.isFinite(Number(nota)) ? Number(nota) : 0;
  const cheias = Math.round(valor);

  return (
    <span className="vendedor-estrelas" aria-label={`Nota ${valor} de 5`}>
      {Array.from({ length: 5 }).map((_, idx) => (
        <svg
          key={idx}
          viewBox="0 0 24 24"
          className={
            idx < cheias
              ? 'vendedor-estrela vendedor-estrela--cheia'
              : 'vendedor-estrela'
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
 * Calcula nível de confiança do vendedor a partir da média e da quantidade
 */
function calcularNivelConfianca(mediaNota, totalVendas) {
  const media = Number.isFinite(Number(mediaNota)) ? Number(mediaNota) : 0;
  const vendas = Number.isFinite(Number(totalVendas)) ? Number(totalVendas) : 0;

  // Score simples: 70% peso na nota, 30% peso em volume de vendas
  const scoreNota = (media / 5) * 70;
  const scoreVendas = (Math.min(vendas, 50) / 50) * 30;
  const score = Math.min(100, Math.round(scoreNota + scoreVendas));

  let nivel = 'Novo vendedor';
  let descricao = 'Ainda está construindo reputação na plataforma.';
  let classe = 'vendedor-confianca-nivel--novo';

  if (score >= 85) {
    nivel = 'Vendedor Nível Platinum';
    descricao = 'É um dos melhores vendedores da plataforma.';
    classe = 'vendedor-confianca-nivel--alto';
  } else if (score >= 65) {
    nivel = 'Vendedor Nível Ouro';
    descricao = 'Mantém bom histórico de vendas e atendimento.';
    classe = 'vendedor-confianca-nivel--medio';
  } else if (score >= 40) {
    nivel = 'Vendedor Nível Prata';
    descricao = 'Vendedor em crescimento, com desempenho estável.';
    classe = 'vendedor-confianca-nivel--baixo';
  }

  return { nivel, descricao, classe, score };
}

/**
 * Secção completa de reputação do vendedor (confiança + avaliações)
 *
 * Enquanto o backend não fornece dados, usamos valores padrão
 * para manter apenas o visual da seção.
 */
function SecaoReputacaoVendedor({
  nomeVendedor,
  mediaNota,
  totalAvaliacoes,
  totalVendas,
  avaliacoes,
  onAbrirAvaliacao,
}) {
  const mediaEfetiva =
      mediaNota !== null && mediaNota !== undefined ? mediaNota : 0;

  const vendasEfetivas =
      totalVendas !== null && totalVendas !== undefined ? totalVendas : 0;

  // Se não vier array ou vier vazio, usamos array vazio (nada de fake)
  const avaliacoesEfetivas = Array.isArray(avaliacoes) ? avaliacoes : [];

  const totalAvaliacoesEfetivo =
      totalAvaliacoes && totalAvaliacoes > 0
          ? totalAvaliacoes
          : avaliacoesEfetivas.length;

  const { nivel, descricao, classe, score } = calcularNivelConfianca(
      mediaEfetiva,
      vendasEfetivas,
  );

  // Carrossel simples, 3 avaliações por "página"
  const [pagina, setPagina] = useState(0);
  const itensPorPagina = 3;
  const totalPaginas = Math.max(
      1,
      Math.ceil(avaliacoesEfetivas.length / itensPorPagina),
  );
  const paginaSegura = Math.min(pagina, totalPaginas - 1);
  const inicio = paginaSegura * itensPorPagina;
  const fim = inicio + itensPorPagina;
  const listaAvaliacoes = avaliacoesEfetivas.slice(inicio, fim);

  function irAnterior() {
    setPagina((p) => Math.max(0, p - 1));
  }
  function irProxima() {
    setPagina((p) => Math.min(totalPaginas - 1, p + 1));
  }

  return (
    <section className="detalhe-vendedor" aria-label="Reputação do vendedor">
      {/* Coluna 1: Card de confiança */}
      <div className="detalhe-vendedor__col">
        <div className="vendedor-confianca-card">
          <div className="vendedor-confianca-header">
            <div
              className={`vendedor-confianca-nivel ${classe}`}
              aria-label={`Nível de confiança: ${nivel}`}
            >
              {nivel}
            </div>
            <p className="vendedor-confianca-sub">
              {descricao}
              {nomeVendedor ? ` Vendedor: ${nomeVendedor}.` : ''}
            </p>
          </div>

          {/* Barra de nível do vendedor com faixa contínua */}
          <div
            className="vendedor-confianca-barra"
            style={{ '--nivel-pct': `${score}%` }}
          >
            <div className="vendedor-confianca-barra__track">
              <div className="vendedor-confianca-barra__fill-inner" />
            </div>
            <div className="vendedor-confianca-legenda">
              <span>Baixa</span>
              <span>Média</span>
              <span>Alta</span>
              <span>Excelente</span>
            </div>
          </div>

          <div className="vendedor-confianca-metricas">
            <div className="vendedor-confianca-tag">
              Nota média {Number(mediaEfetiva).toFixed(1)} / 5
            </div>
            <div className="vendedor-confianca-tag">
              {totalAvaliacoesEfetivo}{' '}
              {totalAvaliacoesEfetivo === 1
                ? 'avaliação de compradores'
                : 'avaliações de compradores'}
            </div>
            <div className="vendedor-confianca-tag">
              {vendasEfetivas >= 100
                ? '+100 vendas concluídas'
                : `${vendasEfetivas} vendas concluídas`}
            </div>
          </div>
        </div>
      </div>

      {/* Coluna 2: Avaliações recentes + carrossel + botão avaliar */}
      <div className="detalhe-vendedor__col">
        <div className="vendedor-avaliacoes-card">
          <header className="vendedor-avaliacoes-header">
            <div>
              <h2 className="vendedor-avaliacoes-titulo">
                Avaliações sobre o vendedor
              </h2>
              <span className="vendedor-avaliacoes-contador">
                {totalAvaliacoesEfetivo}{' '}
                {totalAvaliacoesEfetivo === 1 ? 'avaliação' : 'avaliações'}
              </span>
            </div>

            <div className="vendedor-avaliacoes-actions">
              <div className="vendedor-avaliacoes-controles">
                <button
                  type="button"
                  className="vendedor-avaliacoes-arrow"
                  onClick={irAnterior}
                  disabled={paginaSegura === 0}
                  aria-label="Ver avaliações anteriores"
                >
                  ‹
                </button>
                <button
                  type="button"
                  className="vendedor-avaliacoes-arrow"
                  onClick={irProxima}
                  disabled={paginaSegura >= totalPaginas - 1}
                  aria-label="Ver próximas avaliações"
                >
                  ›
                </button>
              </div>
            </div>
          </header>

          <div className="vendedor-avaliacoes-lista">
            {listaAvaliacoes.length === 0 && (
              <p className="vendedor-avaliacoes-vazio">
                Ainda não há avaliações para este vendedor.
              </p>
            )}

              {listaAvaliacoes.map((av, idx) => {
                  // Mapeamento robusto dos campos
                  const nome =
                      av.autorNome ||
                      av.buyerName ||
                      av.usuarioNome ||
                      av.avaliadorNome || // Tente adicionar este, comum em Java
                      av.nome ||
                      'Comprador da plataforma';

                  const nota = Number(av.nota ?? av.rating ?? av.score ?? av.stars ?? 0);

                  const comentario =
                      av.comentario ||
                      av.comment ||
                      av.message ||
                      av.texto ||
                      av.description ||
                      'Sem comentário adicional.';

                  const data =
                      fmtData(av.dataCriacao || av.createdAt || av.date || av.timestamp) || '';

                  return (
                      <article
                          key={av.id || av._id || idx}
                          className="vendedor-avaliacao-item"
                      >
                          <div className="vendedor-avaliacao-topo">
                              <div>
                                  <div className="vendedor-avaliacao-autor">{nome}</div>
                                  {data && (
                                      <div className="vendedor-avaliacao-data">{data}</div>
                                  )}
                              </div>
                              <EstrelasAvaliacao nota={nota} />
                          </div>
                          <p className="vendedor-avaliacao-comentario">{comentario}</p>
                      </article>
                  );
              })}
          </div>

          <div className="vendedor-avaliacoes-footer">
            <button
              type="button"
              className="btn btn--ghost btn-avaliar-vendedor"
              onClick={onAbrirAvaliacao}
            >
              Avaliar este vendedor
            </button>
            {totalPaginas > 1 && (
              <span className="vendedor-avaliacoes-paginacao">
                Página {paginaSegura + 1} de {totalPaginas}
              </span>
            )}
          </div>
        </div>
      </div>
    </section>
  );
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
  const [avaliacoesReais, setAvaliacoesReais] = useState([]);
  const vendedorId = useMemo(() => {
    return anuncio?.usuarioId || anuncio?.seller?.id || anuncio?.vendedorId || null;
  }, [anuncio]);

  const carregarAvaliacoes = async (idDoVendedor) => {
    if (!idDoVendedor) return;
    try {
      const dados = await anuncioService.buscarAvaliacoesDoVendedor(idDoVendedor);
      // Garante que é um array para não quebrar o map
      setAvaliacoesReais(Array.isArray(dados) ? dados : []);
    } catch (error) {
      console.error("Erro ao buscar avaliações:", error);
    }
  };

  const [erro, setErro] = useState('');

  // ----- Estado de "favoritar" -----
  const [liked, setLiked] = useState(false);
  const [loadingLike, setLoadingLike] = useState(false);
  const [justToggled, setJustToggled] = useState(false);

  // ----- Estado do chat -----
  const [chatAberto, setChatAberto] = useState(null);
  const [unreads, setUnreads] = useState(0);

  // ----- Estado do modal de avaliação do vendedor -----
  const [avaliarAberto, setAvaliarAberto] = useState(false);
  const [notaAvaliacao, setNotaAvaliacao] = useState(0);
  const [textoAvaliacao, setTextoAvaliacao] = useState('');

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

  /**
   * Abre o modal de avaliação do vendedor
   */
  function abrirModalAvaliacao() {
    const vendedorId =
      anuncio?.usuarioId || anuncio?.seller?.id || anuncio?.vendedorId || null;

    if (exigirLogin('avaliar-vendedor', { vendedorId })) return;
    setAvaliarAberto(true);
  }

  /**
   * Fecha o modal de avaliação e limpa campos
   */
  function fecharModalAvaliacao() {
    setAvaliarAberto(false);
    setNotaAvaliacao(0);
    setTextoAvaliacao('');
  }

  /**
   * Envio da avaliação (por enquanto apenas simulação visual)
   */
  async function handleEnviarAvaliacao(event) {
    event.preventDefault();
    if (notaAvaliacao <= 0) {
      alert('Selecione uma nota para o vendedor.');
      return;
    }
    if (!vendedorId) {
      alert('Erro: Vendedor não identificado.');
      return;
    }

    try {
      await anuncioService.enviarAvaliacao({
        vendedorId: vendedorId,
        anuncioId: id, // Passamos o ID deste anúncio
        nota: notaAvaliacao,
        comentario: textoAvaliacao
      });

      alert('Avaliação enviada com sucesso!');
      fecharModalAvaliacao();

      // Atualiza a lista na tela sem precisar de F5
      await carregarAvaliacoes(vendedorId);

    } catch (error) {
      console.error(error);
      alert('Erro ao enviar avaliação. Verifique se você já comprou com este vendedor ou tente novamente.');
    }
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
// A variável definida logo acima na linha 611 é 'dados'
        const vId = dados?.usuarioId || dados?.seller?.id || dados?.vendedorId;        if (vId) {
          await carregarAvaliacoes(vId);
        }
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

  const nomeVendedor = anuncio?.seller?.name || anuncio?.usuarioNome || anuncio?.vendedorNome;

  // CÁLCULO DAS ESTATÍSTICAS REAIS
  // Aqui pegamos a lista real que veio do backend (avaliacoesReais) e calculamos a média
  const listaAvaliacoesParaExibir = avaliacoesReais;

  const mediaNotaCalculada = useMemo(() => {
    if (listaAvaliacoesParaExibir.length === 0) return 0;
    console.log("DADOS VINDOS DO BACKEND:", listaAvaliacoesParaExibir);
      const soma = listaAvaliacoesParaExibir.reduce((acc, av) => {
          // Tenta ler a nota de vários lugares possíveis para garantir
          const valor = Number(av.nota ?? av.rating ?? av.score ?? av.stars ?? 0);
          return acc + valor;
      }, 0);

      return soma / listaAvaliacoesParaExibir.length;
  }, [listaAvaliacoesParaExibir]);

  // Total de vendas (Se o backend não manda, mantemos 0 ou fallback)
  const totalVendasReal = raw?.totalVendasVendedor || raw?.sellerSalesCount || 0;

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
            <span className="v">{nomeVendedor || '—'}</span>
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

      {/* Seção de reputação do vendedor (abaixo do card principal) */}
      <SecaoReputacaoVendedor
          nomeVendedor={nomeVendedor}
          mediaNota={mediaNotaCalculada}      // <--- CORREÇÃO: Usar a média calculada do backend
          totalAvaliacoes={listaAvaliacoesParaExibir.length} // <--- CORREÇÃO: Usar o tamanho da lista real
          totalVendas={totalVendasReal}       // <--- CORREÇÃO: Usar o total de vendas real
          avaliacoes={listaAvaliacoesParaExibir} // <--- CORREÇÃO: Passar a lista real
          onAbrirAvaliacao={abrirModalAvaliacao}
      />

      {/* Modal de avaliação do vendedor (apenas visual por enquanto) */}
      {avaliarAberto && (
        <div
          className="avaliacao-modal-backdrop"
          role="dialog"
          aria-modal="true"
        >
          <div className="avaliacao-modal">
            <header className="avaliacao-modal-header">
              <h2>Avaliar vendedor</h2>
              <button
                type="button"
                className="avaliacao-modal-close"
                onClick={fecharModalAvaliacao}
                aria-label="Fechar"
              >
                ×
              </button>
            </header>

            <p className="avaliacao-modal-subtitulo">
              Conte para outros compradores como foi a sua experiência com{' '}
              <strong>{nomeVendedor || 'este vendedor'}</strong>.
            </p>

            <form onSubmit={handleEnviarAvaliacao}>
              <div className="avaliacao-modal-campo">
                <label className="avaliacao-modal-label">
                  Nota do vendedor
                </label>
                <div className="avaliacao-modal-estrelas">
                  {Array.from({ length: 5 }).map((_, idx) => {
                    const valor = idx + 1;
                    const ativo = valor <= notaAvaliacao;
                    return (
                      <button
                        key={valor}
                        type="button"
                        className={
                          ativo
                            ? 'avaliacao-modal-estrela avaliacao-modal-estrela--ativa'
                            : 'avaliacao-modal-estrela'
                        }
                        onClick={() => setNotaAvaliacao(valor)}
                        aria-label={`Dar nota ${valor} de 5`}
                      >
                        ★
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="avaliacao-modal-campo">
                <label className="avaliacao-modal-label">
                  Comentário (opcional)
                </label>
                <textarea
                  className="avaliacao-modal-textarea"
                  rows={4}
                  placeholder="Fale sobre atendimento, cumprimento do combinado, tempo de resposta..."
                  value={textoAvaliacao}
                  onChange={(e) => setTextoAvaliacao(e.target.value)}
                />
              </div>

              <div className="avaliacao-modal-acoes">
                <button
                  type="button"
                  className="btn btn--ghost avaliacao-modal-botao"
                  onClick={fecharModalAvaliacao}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn btn--primary avaliacao-modal-botao"
                >
                  Enviar avaliação
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
