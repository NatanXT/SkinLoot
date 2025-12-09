// frontend/src/components/shared/ReputacaoVendedor.jsx
import { useState } from 'react';

/**
 * Dados para manter o visual em pé enquanto não tiver backend real.
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
 * Formata data em dd/mm/aaaa
 */
function fmtData(valor) {
  if (!valor) return '';
  const d = new Date(valor);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('pt-BR');
}

/**
 * Desenha estrelas de nota (0–5).
 */
export function EstrelasAvaliacao({ nota }) {
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
 * Calcula nível de confiança do vendedor a partir da média e da quantidade de vendas.
 */
export function calcularNivelConfianca(mediaNota, totalVendas) {
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
 * Seção completa de reputação do vendedor (nível de confiança + avaliações).
 */
export function SecaoReputacaoVendedor({
  nomeVendedor,
  mediaNota,
  totalAvaliacoes,
  totalVendas,
  avaliacoes,
  onAbrirAvaliacao,
}) {
  const mediaEfetiva =
    mediaNota !== null && mediaNota !== undefined ? mediaNota : 4.8;
  const vendasEfetivas =
    totalVendas !== null && totalVendas !== undefined ? totalVendas : 120;

  const avaliacoesEfetivas =
    Array.isArray(avaliacoes) && avaliacoes.length > 0
      ? avaliacoes
      : AVALIACOES_VENDEDOR_DEMO;

  const totalAvaliacoesEfetivo =
    totalAvaliacoes && totalAvaliacoes > 0
      ? totalAvaliacoes
      : avaliacoesEfetivas.length;

  const { nivel, descricao, classe, score } = calcularNivelConfianca(
    mediaEfetiva,
    vendasEfetivas,
  );

  // Carrossel simples: 3 avaliações por "página"
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
              const nome =
                av.autorNome ||
                av.buyerName ||
                av.usuarioNome ||
                'Comprador da plataforma';
              const nota = av.nota || av.rating || av.score || 0;
              const comentario =
                av.comentario ||
                av.comment ||
                av.texto ||
                'Sem comentário adicional.';
              const data =
                fmtData(av.dataCriacao || av.createdAt || av.date) || '';

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

export default SecaoReputacaoVendedor;
