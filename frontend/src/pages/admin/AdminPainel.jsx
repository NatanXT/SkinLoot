// ==========================================================
// Caminho: frontend/src/pages/admin/AdminPainel.jsx
// ----------------------------------------------------------
// Tela de painel administrativo do SkinLoot.
// - Backdrop/gradiente seguindo o padrão da Dashboard/Perfil
// - Topbar fixa com título e ações
// - Cards de resumo (itens ativos, ocultos, banidos)
// - Filtros (busca, tipo, status)
// - Tabela com listagem de itens (mockados)
// - Exportação da tabela filtrada para PDF e CSV
// ----------------------------------------------------------
// Observação:
// Nesta versão os dados são mocks estáticos (ITENS_MOCK).
// Depois você pode trocar por chamadas reais à API do backend.
// ==========================================================

import React, { useMemo, useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "./AdminPainel.css";

/**
 * Estrutura de um item administrável no painel.
 * Exemplo: skin, caixa, usuário etc.
 *
 * Campos:
 * - id: identificador numérico
 * - nome: nome exibido do item
 * - tipo: tipo do item (ex.: "skin", "caixa", "usuario")
 * - categoria: categoria auxiliar (ex.: rifle, faca, conta)
 * - status: estado atual (ativo, oculto, banido)
 * - preco: valor em moeda (opcional, pode ser 0 para usuários)
 * - criadoEm: data de criação (string)
 */
const ITENS_MOCK = [
  {
    id: 1,
    nome: "AK-47 | Neon Revolution",
    tipo: "skin",
    categoria: "Rifle",
    status: "ativo",
    preco: 320.5,
    criadoEm: "2025-01-12",
  },
  {
    id: 2,
    nome: "Caixa Sortuda #01",
    tipo: "caixa",
    categoria: "Caixa promocional",
    status: "ativo",
    preco: 12.9,
    criadoEm: "2025-02-05",
  },
  {
    id: 3,
    nome: " M4A4 | Cyber Beast",
    tipo: "skin",
    categoria: "Rifle",
    status: "oculto",
    preco: 210.0,
    criadoEm: "2025-02-18",
  },
  {
    id: 4,
    nome: "Conta suspeita - Player123",
    tipo: "usuario",
    categoria: "Conta",
    status: "banido",
    preco: 0,
    criadoEm: "2025-03-02",
  },
  {
    id: 5,
    nome: "Caixa HighRoller",
    tipo: "caixa",
    categoria: "Caixa premium",
    status: "ativo",
    preco: 49.9,
    criadoEm: "2025-03-20",
  },
];

/**
 * Formata valores numéricos em moeda BRL.
 * Caso não haja valor, retorna "-".
 */
function formatarPreco(valor) {
  if (!valor && valor !== 0) return "-";
  if (Number.isNaN(valor)) return "-";

  try {
    return valor.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 2,
    });
  } catch {
    return `R$ ${valor}`;
  }
}

/**
 * Escapa valores para uso em CSV:
 * - Converte para string
 * - Dobra aspas internas
 * - Envolve tudo em aspas
 */
function escaparParaCsv(valor) {
  if (valor === null || valor === undefined) return '""';
  const texto = String(valor).replace(/"/g, '""');
  return `"${texto}"`;
}

/**
 * Componente principal da tela de painel admin.
 * Responsável por:
 * - Calcular resumos (totais por status)
 * - Filtrar a lista com base em busca, tipo e status
 * - Renderizar cards, filtros e tabela
 * - Exportar a tabela filtrada para PDF e CSV
 */
export default function AdminPainel() {
  const [termoBusca, setTermoBusca] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("todos");
  const [filtroStatus, setFiltroStatus] = useState("todos");

  /**
   * Resumo geral baseado na lista completa (sem filtros).
   */
  const resumo = useMemo(() => {
    const total = ITENS_MOCK.length;
    const ativos = ITENS_MOCK.filter((item) => item.status === "ativo").length;
    const ocultos = ITENS_MOCK.filter((item) => item.status === "oculto").length;
    const banidos = ITENS_MOCK.filter((item) => item.status === "banido").length;

    return { total, ativos, ocultos, banidos };
  }, []);

  /**
   * Lista filtrada com base nos controles de busca/tipo/status.
   */
  const itensFiltrados = useMemo(() => {
    return ITENS_MOCK.filter((item) => {
      const texto = `${item.nome} ${item.categoria} ${item.tipo}`
        .toLowerCase()
        .trim();

      const buscaOk =
        termoBusca.trim().length === 0 ||
        texto.includes(termoBusca.toLowerCase().trim());

      const tipoOk =
        filtroTipo === "todos" ? true : item.tipo === filtroTipo;

      const statusOk =
        filtroStatus === "todos" ? true : item.status === filtroStatus;

      return buscaOk && tipoOk && statusOk;
    });
  }, [termoBusca, filtroTipo, filtroStatus]);

  /**
   * Monta a descrição textual dos filtros atuais
   * para ser usada no PDF (linha abaixo do título).
   */
  function montarDescricaoFiltros() {
    const partes = [];

    if (termoBusca.trim()) {
      partes.push(`Busca: "${termoBusca.trim()}"`);
    }
    if (filtroTipo !== "todos") {
      partes.push(`Tipo: ${filtroTipo}`);
    }
    if (filtroStatus !== "todos") {
      partes.push(`Status: ${filtroStatus}`);
    }

    if (partes.length === 0) {
      return "Filtros: nenhum filtro aplicado (todos os itens visíveis no snapshot atual).";
    }

    return `Filtros: ${partes.join(" | ")}`;
  }

  /**
   * Gera um PDF com a tabela atual (itens filtrados).
   * Usa jsPDF + autoTable (função importada).
   *
   * Estilização:
   * - Cabeçalho verde SkinLoot
   * - Linhas zebradas
   * - Preço alinhado à direita
   * - Coluna de status com cores diferentes por valor
   * - Margens e rodapé configurados
   */
  function handleExportarPdf() {
    if (!itensFiltrados || itensFiltrados.length === 0) {
      window.alert("Não há itens para exportar com os filtros atuais.");
      return;
    }

    try {
      // Documento em paisagem (landscape), A4.
      const doc = new jsPDF({
        orientation: "landscape",
        unit: "pt",
        format: "a4",
      });

      // Título do relatório
      doc.setFontSize(18);
      doc.setTextColor(20, 20, 20);
      doc.text("Relatório de Itens Cadastrados - SkinLoot", 40, 40);

      // Informação de data/hora
      const dataGeracao = new Date().toLocaleString("pt-BR");
      doc.setFontSize(10);
      doc.setTextColor(90);
      doc.text(`Gerado em: ${dataGeracao}`, 40, 58);

      // Linha com descrição dos filtros atuais
      const descricaoFiltros = montarDescricaoFiltros();
      doc.setFontSize(10);
      doc.setTextColor(70);
      doc.text(descricaoFiltros, 40, 72);

      // Cabeçalho da tabela
      const cabecalho = [
        "ID",
        "Nome",
        "Tipo",
        "Categoria",
        "Status",
        "Preço",
        "Criado em",
      ];

      // Corpo da tabela: mapeia itensFiltrados em arrays simples
      const corpo = itensFiltrados.map((item) => [
        `#${item.id}`,
        item.nome,
        item.tipo,
        item.categoria,
        item.status,
        formatarPreco(item.preco),
        item.criadoEm,
      ]);

      // Tabela estilizada
     autoTable(doc, {
  head: [cabecalho],
  body: corpo,
  margin: { top: 90, right: 40, bottom: 40, left: 40 },

  // Estilo 100% claro
  styles: {
    fontSize: 9,
    cellPadding: 6,
    lineColor: [220, 220, 220],
    lineWidth: 0.4,
    textColor: [30, 30, 30],
    fillColor: [255, 255, 255],
    valign: "middle",
  },

  // Cabeçalho verde SkinLoot
  headStyles: {
    fillColor: [16, 198, 111],
    textColor: 255,
    fontStyle: "bold",
    halign: "left",
  },

  // Remove zebra completamente
  alternateRowStyles: {
    fillColor: [255, 255, 255],
    textColor: [30, 30, 30],
  },

  columnStyles: {
    0: { cellWidth: 40 },
    1: { cellWidth: 170 },
    2: { cellWidth: 70 },
    3: { cellWidth: 120 },
    4: { cellWidth: 70 },
    5: { halign: "right", cellWidth: 80 },
    6: { cellWidth: 80 },
  },

  didParseCell: (data) => {
    if (data.section !== "body") return;

    const colIndex = data.column.index;
    const valor = data.cell.raw;

    // Coluna STATUS com cores no tema claro
    if (colIndex === 4) {
      if (valor === "ativo") {
        data.cell.styles.textColor = [15, 160, 70];
        data.cell.styles.fontStyle = "bold";
      } else if (valor === "oculto") {
        data.cell.styles.textColor = [120, 130, 140];
      } else if (valor === "banido") {
        data.cell.styles.textColor = [230, 60, 60];
        data.cell.styles.fontStyle = "bold";
      }
    }

    if (colIndex === 5) {
      data.cell.styles.halign = "right";
    }
  },

  didDrawPage: (dados) => {
    const pagina = `Página ${dados.pageNumber}`;
    doc.setFontSize(9);
    doc.setTextColor(120);
    doc.text(
      pagina,
      doc.internal.pageSize.getWidth() - 80,
      doc.internal.pageSize.getHeight() - 20
    );
  },
});

      // Nome do arquivo
      doc.save("skinloot-itens.pdf");
    } catch (erro) {
      console.error("Erro ao gerar PDF:", erro);
      window.alert("Ocorreu um erro ao gerar o PDF. Veja o console para detalhes.");
    }
  }

  /**
   * Gera um CSV com a tabela atual (itens filtrados)
   * e dispara o download no navegador.
   */
  function handleExportarCsv() {
    if (!itensFiltrados || itensFiltrados.length === 0) {
      window.alert("Não há itens para exportar com os filtros atuais.");
      return;
    }

    const cabecalho = [
      "ID",
      "Nome",
      "Tipo",
      "Categoria",
      "Status",
      "Preço",
      "Criado em",
    ];

    const linhas = itensFiltrados.map((item) => [
      `#${item.id}`,
      item.nome,
      item.tipo,
      item.categoria,
      item.status,
      formatarPreco(item.preco),
      item.criadoEm,
    ]);

    // Monta o conteúdo do CSV:
    // - Cabeçalho + linhas
    // - Separador ";", comum para ambiente pt-BR
    const linhasCsv = [
      cabecalho.map(escaparParaCsv).join(";"),
      ...linhas.map((linha) => linha.map(escaparParaCsv).join(";")),
    ];

    const conteudoCsv = linhasCsv.join("\n");

    // Cria um Blob e dispara o download
    const blob = new Blob([conteudoCsv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "skinloot-itens.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  return (
    <div className="admin-root">
      {/* Backdrop com glow seguindo o padrão da vitrine/perfil */}
      <div className="admin-backdrop" />

      {/* Topbar fixa no topo (overlay sobre o backdrop) */}
      <header className="admin-topbar">
        <div className="admin-topbar__info">
          <h1 className="admin-topbar__titulo">Painel Administrativo</h1>
          <p className="admin-topbar__subtitulo">
            Central para gerenciar skins, caixas e usuários do SkinLoot.
          </p>
        </div>

        <div className="admin-topbar__acoes">
          <button
            type="button"
            className="btn btn--ghost sm admin-topbar__botao"
            onClick={handleExportarPdf}
          >
            Exportar PDF
          </button>
          <button
            type="button"
            className="btn btn--ghost sm admin-topbar__botao"
            onClick={handleExportarCsv}
          >
            Exportar CSV
          </button>
          <button
            type="button"
            className="btn btn--primary sm admin-topbar__botao"
            onClick={() => {
              // Aqui você pode abrir modal ou navegar para /admin/novo-item.
              console.log("Criar novo item clicado");
            }}
          >
            Criar novo item
          </button>
        </div>
      </header>

      {/* Hero curto com contexto da página */}
      <section className="admin-hero">
        <div className="admin-hero__copy">
          <h2>Visão geral da plataforma</h2>
          <p>
            Acompanhe rapidamente o volume de itens ativos, ocultos e banidos,
            filtre a listagem e aplique ações administrativas sem sair desta
            tela.
          </p>
        </div>
      </section>

      {/* Container principal de conteúdo */}
      <main className="admin-container">
        {/* Bloco: Cards de resumo */}
        <section className="admin-bloco">
          <header className="admin-bloco__cabecalho">
            <h3>Resumo rápido</h3>
            <span className="admin-bloco__hint">
              Dados baseados no snapshot atual do sistema.
            </span>
          </header>

          <div className="admin-resumo-grid">
            <article className="admin-card">
              <h4 className="admin-card__rotulo">Itens totais</h4>
              <p className="admin-card__valor">{resumo.total}</p>
              <span className="admin-card__descricao">
                Todos os itens cadastrados (skins, caixas, contas).
              </span>
            </article>

            <article className="admin-card admin-card--sucesso">
              <h4 className="admin-card__rotulo">Ativos</h4>
              <p className="admin-card__valor">{resumo.ativos}</p>
              <span className="admin-card__descricao">
                Visíveis para os usuários na vitrine/plataforma.
              </span>
            </article>

            <article className="admin-card admin-card--neutro">
              <h4 className="admin-card__rotulo">Ocultos</h4>
              <p className="admin-card__valor">{resumo.ocultos}</p>
              <span className="admin-card__descricao">
                Itens desativados temporariamente, em revisão ou rascunho.
              </span>
            </article>

            <article className="admin-card admin-card--perigo">
              <h4 className="admin-card__rotulo">Banidos</h4>
              <p className="admin-card__valor">{resumo.banidos}</p>
              <span className="admin-card__descricao">
                Itens bloqueados permanentemente por violarem regras.
              </span>
            </article>
          </div>
        </section>

        {/* Bloco: Filtros */}
        <section className="admin-bloco">
          <header className="admin-bloco__cabecalho">
            <h3>Filtros</h3>
            <span className="admin-bloco__hint">
              Refine a listagem abaixo usando busca, tipo e status.
            </span>
          </header>

          <div className="admin-filtros">
            {/* Campo de busca por texto */}
            <div className="admin-filtro admin-filtro--busca">
              <label htmlFor="admin-busca" className="admin-filtro__label">
                Buscar
              </label>
              <input
                id="admin-busca"
                type="text"
                className="admin-filtro__input"
                placeholder="Nome do item, categoria ou tipo..."
                value={termoBusca}
                onChange={(evento) => setTermoBusca(evento.target.value)}
              />
            </div>

            {/* Seletor de tipo */}
            <div className="admin-filtro">
              <label htmlFor="admin-tipo" className="admin-filtro__label">
                Tipo
              </label>
              <select
                id="admin-tipo"
                className="admin-filtro__input"
                value={filtroTipo}
                onChange={(evento) => setFiltroTipo(evento.target.value)}
              >
                <option value="todos">Todos</option>
                <option value="skin">Skins</option>
                <option value="caixa">Caixas</option>
                <option value="usuario">Usuários</option>
              </select>
            </div>

            {/* Seletor de status */}
            <div className="admin-filtro">
              <label htmlFor="admin-status" className="admin-filtro__label">
                Status
              </label>
              <select
                id="admin-status"
                className="admin-filtro__input"
                value={filtroStatus}
                onChange={(evento) => setFiltroStatus(evento.target.value)}
              >
                <option value="todos">Todos</option>
                <option value="ativo">Ativo</option>
                <option value="oculto">Oculto</option>
                <option value="banido">Banido</option>
              </select>
            </div>

            {/* Ações de filtro (limpar, aplicar) */}
            <div className="admin-filtro admin-filtro--acoes">
              <button
                type="button"
                className="btn btn--ghost sm admin-filtro__botao"
                onClick={() => {
                  setTermoBusca("");
                  setFiltroTipo("todos");
                  setFiltroStatus("todos");
                }}
              >
                Limpar filtros
              </button>
              <button
                type="button"
                className="btn btn--primary sm admin-filtro__botao"
                onClick={() => {
                  // No momento, os filtros já são reativos.
                  // Este botão pode virar "Salvar preset" ou "Aplicar filtros avançados".
                  console.log("Aplicar filtros (atual já é reativo)");
                }}
              >
                Aplicar
              </button>
            </div>
          </div>
        </section>

        {/* Bloco: Tabela de itens */}
        <section className="admin-bloco">
          <header className="admin-bloco__cabecalho admin-bloco__cabecalho--tabela">
            <div>
              <h3>Itens cadastrados</h3>
              <span className="admin-bloco__hint">
                Gerencie o estado e as ações individuais sobre cada item.
              </span>
            </div>

            <span className="admin-bloco__contador">
              {itensFiltrados.length} resultado
              {itensFiltrados.length === 1 ? "" : "s"}
            </span>
          </header>

          <div className="admin-tabela__wrapper">
            <table className="admin-tabela">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nome</th>
                  <th>Tipo</th>
                  <th>Categoria</th>
                  <th>Status</th>
                  <th>Preço</th>
                  <th>Criado em</th>
                  <th className="admin-tabela__th-acoes">Ações</th>
                </tr>
              </thead>
              <tbody>
                {itensFiltrados.length === 0 && (
                  <tr>
                    <td colSpan={8} className="admin-tabela__vazio">
                      Nenhum item encontrado com os filtros atuais.
                    </td>
                  </tr>
                )}

                {itensFiltrados.map((item) => (
                  <tr key={item.id}>
                    <td>#{item.id}</td>
                    <td className="admin-tabela__nome">{item.nome}</td>
                    <td className="admin-tabela__tipo">{item.tipo}</td>
                    <td className="admin-tabela__categoria">
                      {item.categoria}
                    </td>
                    <td>
                      <span
                        className={`admin-status-badge admin-status-badge--${item.status}`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td>{formatarPreco(item.preco)}</td>
                    <td>{item.criadoEm}</td>
                    <td className="admin-tabela__acoes">
                      <button
                        type="button"
                        className="btn btn--ghost sm"
                        onClick={() =>
                          console.log("Ver detalhes do item", item.id)
                        }
                      >
                        Detalhes
                      </button>
                      <button
                        type="button"
                        className="btn btn--outline sm admin-btn-outline"
                        onClick={() =>
                          console.log("Editar item", item.id)
                        }
                      >
                        Editar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
