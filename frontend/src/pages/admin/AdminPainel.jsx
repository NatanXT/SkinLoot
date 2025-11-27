// ==========================================================
// Caminho: frontend/src/pages/admin/AdminPainel.jsx
// ----------------------------------------------------------
// Tela de painel administrativo do SkinLoot.
// - Backdrop/gradiente seguindo o padrão da Dashboard/Perfil
// - Topbar fixa com título e ações
// - Cards de resumo (itens ativos, ocultos, banidos)
// - Filtros (busca, tipo, status)
// - Painel de detalhes do usuário/skin selecionado
// - Tabela com listagem de itens (dados da API)
// - Listagem em cards no mobile, com paginação
// - Exportação da tabela filtrada para PDF e CSV
// ----------------------------------------------------------
// Observação:
// Nesta versão os dados vêm da API (anúncios + usuários).
// A listagem usa tabela no desktop e cards no mobile.
// ==========================================================

import React, { useEffect, useMemo, useState } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import './AdminPainel.css';
import anuncioService from '../../services/anuncioService';
import api from '../../services/api';
import SkinCard from '../../components/skin/SkinCard.jsx';

/**
 * Metadados dos planos (para destacar plano do usuário no painel de detalhes)
 */
const planosMeta = {
  gratuito: { label: 'Gratuito', color: '#454B54' },
  free: { label: 'Gratuito', color: '#454B54' },
  intermediario: { label: 'Intermediário', color: '#00C896' },
  plus: { label: '+ Plus', color: '#39FF14' },
};

/**
 * Tenta extrair um ID de usuário a partir de um item de skin/caixa.
 * Considera diferentes formatos possíveis vindos do backend.
 */
function obterUsuarioIdDeItemSkin(item) {
  if (!item || !item.original) return null;
  const origem = item.original;
  return (
    origem.usuarioId ??
    origem.usuario_id ??
    origem.usuario?.id ??
    origem.seller?.id ??
    origem.vendedorId ??
    origem.ownerId ??
    null
  );
}

/**
 * Formata valores numéricos em moeda BRL.
 * Caso não haja valor, retorna "-".
 */
function formatarPreco(valor) {
  if (!valor && valor !== 0) return '-';
  if (Number.isNaN(valor)) return '-';

  try {
    return Number(valor).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
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
 * - Buscar anúncios e usuários na API
 * - Calcular resumos (totais por status)
 * - Filtrar a lista com base em busca, tipo e status
 * - Renderizar cards, filtros e tabela (desktop)
 * - Renderizar cards com paginação (mobile)
 * - Painel de detalhes do usuário/skin selecionado
 * - Exportar a tabela filtrada para PDF e CSV
 */
export default function AdminPainel() {
  const [termoBusca, setTermoBusca] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [listaItens, setListaItens] = useState([]);
  const [loading, setLoading] = useState(true);

  // Controle específico para mobile (cards + paginação + modal de filtros)
  const [paginaMobile, setPaginaMobile] = useState(1);
  const [filtrosMobileAbertos, setFiltrosMobileAbertos] = useState(false);
  const ITENS_POR_PAGINA_MOBILE = 4;

  // Estado do painel de detalhes
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedUserSkins, setSelectedUserSkins] = useState([]);

  useEffect(() => {
    async function carregarDados() {
      try {
        setLoading(true);

        // 1. Buscar Anúncios (Skins)
        // Usamos o service pois ele já trata imagens, nomes de jogos e normaliza os campos
        const skinsRaw = await anuncioService.listarFeedNormalizado();

        const skinsFormatadas = skinsRaw.map((skin) => ({
          id: skin.id,
          nome: skin.skinNome, // O service normaliza como 'skinNome'
          tipo: 'skin',
          categoria: skin.game || 'Desconhecido', // Ex: CS2, LoL
          // Mapeia booleano ou status string para as classes do CSS (ativo, oculto, banido)
          status: skin.ativo ? 'ativo' : 'oculto',
          preco: skin.preco,
          criadoEm: skin.listedAt
            ? new Date(skin.listedAt).toLocaleDateString('pt-BR')
            : '—',
          autor: skin.usuarioNome || skin.seller?.name || 'Desconhecido',
          original: skin, // Mantém o objeto original caso precise para edição
        }));

        // 2. Buscar Usuários (Chamada direta à API se não houver userService pronto)
        // Assumindo que seu endpoint é /usuarios e retorna uma lista
        let usuariosFormatados = [];
        try {
          const resUsers = await api.get('/usuarios');
          // Verifica se a resposta é array ou objeto paginado
          const usersData = Array.isArray(resUsers.data)
            ? resUsers.data
            : resUsers.data.content || [];

          usuariosFormatados = usersData.map((u) => ({
            id: u.id,
            nome: u.nome,
            tipo: 'usuario',
            autor: u.nome, // ou "Próprio" se preferir distinguir
            categoria: 'Conta', // Categoria fixa para usuários
            // Exemplo de lógica de status baseada no objeto do usuário
            status: u.statusAssinatura === 'ATIVA' ? 'ativo' : 'banido',
            preco: 0, // Usuário não tem preço
            criadoEm: u.dataCriacao
              ? new Date(u.dataCriacao).toLocaleDateString('pt-BR')
              : '—',
            original: u,
          }));
        } catch (errUser) {
          console.error(
            'Erro ao carregar usuários (pode ser permissão de admin):',
            errUser,
          );
        }

        // 3. Juntar tudo na lista principal
        setListaItens([...skinsFormatadas, ...usuariosFormatados]);
      } catch (error) {
        console.error('Erro ao carregar painel administrativo:', error);
      } finally {
        setLoading(false);
      }
    }

    carregarDados();
  }, []);

  // Sempre que filtros ou busca mudarem, voltamos para a primeira página no mobile
  useEffect(() => {
    setPaginaMobile(1);
  }, [termoBusca, filtroTipo, filtroStatus]);

  /**
   * Handler centralizado para clique em "Detalhes".
   * - Descobre o usuário dono (quando item é skin)
   * - Filtra todas as skins desse usuário
   * - Atualiza o painel de detalhes
   */
  function handleVerDetalhes(item) {
    if (!item) {
      setSelectedItem(null);
      setSelectedUser(null);
      setSelectedUserSkins([]);
      return;
    }

    let usuarioId = null;
    let usuarioDados = null;

    if (item.tipo === 'usuario') {
      usuarioId = item.original?.id ?? item.id ?? null;
      usuarioDados = item.original ?? null;
    } else if (item.tipo === 'skin' || item.tipo === 'caixa') {
      usuarioId = obterUsuarioIdDeItemSkin(item);
      if (usuarioId != null) {
        const encontrado = listaItens.find((i) => {
          if (i.tipo !== 'usuario') return false;
          const idUsuarioLista = i.original?.id ?? i.id;
          return String(idUsuarioLista) === String(usuarioId);
        });
        usuarioDados = encontrado?.original ?? null;
      }
    }

    // Filtra todas as skins do mesmo usuário (se conseguirmos resolver um ID)
    const skinsUsuario = listaItens.filter((i) => {
      if (i.tipo !== 'skin') return false;
      const idSkinUsuario = obterUsuarioIdDeItemSkin(i);
      if (!usuarioId || !idSkinUsuario) return false;
      return String(idSkinUsuario) === String(usuarioId);
    });

    setSelectedItem(item);
    setSelectedUser(usuarioDados);
    setSelectedUserSkins(skinsUsuario);
  }

  /**
   * Resumo geral baseado na lista completa (sem filtros).
   */
  const resumo = useMemo(() => {
    if (!listaItens || listaItens.length === 0) {
      return { total: 0, ativos: 0, ocultos: 0, banidos: 0 };
    }

    const total = listaItens.length;
    const ativos = listaItens.filter((item) => item.status === 'ativo').length;
    const ocultos = listaItens.filter(
      (item) => item.status === 'oculto',
    ).length;
    const banidos = listaItens.filter(
      (item) => item.status === 'banido',
    ).length;

    return { total, ativos, ocultos, banidos };
  }, [listaItens]);

  /**
   * Lista filtrada com base nos controles de busca/tipo/status.
   */
  const itensFiltrados = useMemo(() => {
    return listaItens.filter((item) => {
      const texto = `${item.nome} ${item.categoria} ${item.tipo}`
        .toLowerCase()
        .trim();

      const buscaOk =
        termoBusca.trim().length === 0 ||
        texto.includes(termoBusca.toLowerCase().trim());

      const tipoOk = filtroTipo === 'todos' ? true : item.tipo === filtroTipo;

      const statusOk =
        filtroStatus === 'todos' ? true : item.status === filtroStatus;

      return buscaOk && tipoOk && statusOk;
    });
  }, [termoBusca, filtroTipo, filtroStatus, listaItens]);

  /**
   * Subconjunto de itens para os cards no mobile (paginados).
   */
  const totalPaginasMobile = useMemo(() => {
    if (itensFiltrados.length === 0) return 1;
    return Math.ceil(itensFiltrados.length / ITENS_POR_PAGINA_MOBILE);
  }, [itensFiltrados.length]);

  const itensMobilePaginados = useMemo(() => {
    const inicio = (paginaMobile - 1) * ITENS_POR_PAGINA_MOBILE;
    const fim = inicio + ITENS_POR_PAGINA_MOBILE;
    return itensFiltrados.slice(inicio, fim);
  }, [itensFiltrados, paginaMobile]);

  /**
   * Monta a descrição textual dos filtros atuais
   * para ser usada no PDF (linha abaixo do título).
   */
  function montarDescricaoFiltros() {
    const partes = [];

    if (termoBusca.trim()) {
      partes.push(`Busca: "${termoBusca.trim()}"`);
    }
    if (filtroTipo !== 'todos') {
      partes.push(`Tipo: ${filtroTipo}`);
    }
    if (filtroStatus !== 'todos') {
      partes.push(`Status: ${filtroStatus}`);
    }

    if (partes.length === 0) {
      return 'Filtros: nenhum filtro aplicado (todos os itens visíveis no snapshot atual).';
    }

    return `Filtros: ${partes.join(' | ')}`;
  }

  /**
   * Gera um PDF com a tabela atual (itens filtrados).
   * Usa jsPDF + autoTable (função importada).
   *
   * Estilização:
   * - Cabeçalho verde SkinLoot
   * - Linhas claras
   * - Preço alinhado à direita
   * - Coluna de status com cores diferentes por valor
   * - Margens e rodapé configurados
   */
  function handleExportarPdf() {
    if (!itensFiltrados || itensFiltrados.length === 0) {
      window.alert('Não há itens para exportar com os filtros atuais.');
      return;
    }

    try {
      // Documento em paisagem (landscape), A4.
      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'pt',
        format: 'a4',
      });

      // Título do relatório
      doc.setFontSize(18);
      doc.setTextColor(20, 20, 20);
      doc.text('Relatório de Itens Cadastrados - SkinLoot', 40, 40);

      // Informação de data/hora
      const dataGeracao = new Date().toLocaleString('pt-BR');
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
        'ID',
        'Nome',
        'Tipo',
        'Categoria',
        'Status',
        'Preço',
        'Criado em',
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
          valign: 'middle',
        },

        // Cabeçalho verde SkinLoot
        headStyles: {
          fillColor: [16, 198, 111],
          textColor: 255,
          fontStyle: 'bold',
          halign: 'left',
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
          5: { halign: 'right', cellWidth: 80 },
          6: { cellWidth: 80 },
        },

        didParseCell: (data) => {
          if (data.section !== 'body') return;

          const colIndex = data.column.index;
          const valor = data.cell.raw;

          // Coluna STATUS com cores no tema claro
          if (colIndex === 4) {
            if (valor === 'ativo') {
              data.cell.styles.textColor = [15, 160, 70];
              data.cell.styles.fontStyle = 'bold';
            } else if (valor === 'oculto') {
              data.cell.styles.textColor = [120, 130, 140];
            } else if (valor === 'banido') {
              data.cell.styles.textColor = [230, 60, 60];
              data.cell.styles.fontStyle = 'bold';
            }
          }

          if (colIndex === 5) {
            data.cell.styles.halign = 'right';
          }
        },

        didDrawPage: (dados) => {
          const pagina = `Página ${dados.pageNumber}`;
          doc.setFontSize(9);
          doc.setTextColor(120);
          doc.text(
            pagina,
            doc.internal.pageSize.getWidth() - 80,
            doc.internal.pageSize.getHeight() - 20,
          );
        },
      });

      // Nome do arquivo
      doc.save('skinloot-itens.pdf');
    } catch (erro) {
      console.error('Erro ao gerar PDF:', erro);
      window.alert(
        'Ocorreu um erro ao gerar o PDF. Veja o console para detalhes.',
      );
    }
  }

  /**
   * Gera um CSV com a tabela atual (itens filtrados)
   * e dispara o download no navegador.
   */
  function handleExportarCsv() {
    if (!itensFiltrados || itensFiltrados.length === 0) {
      window.alert('Não há itens para exportar com os filtros atuais.');
      return;
    }

    const cabecalho = [
      'ID',
      'Nome',
      'Tipo',
      'Categoria',
      'Status',
      'Preço',
      'Criado em',
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
      cabecalho.map(escaparParaCsv).join(';'),
      ...linhas.map((linha) => linha.map(escaparParaCsv).join(';')),
    ];

    const conteudoCsv = linhasCsv.join('\n');

    // Cria um Blob e dispara o download
    const blob = new Blob([conteudoCsv], {
      type: 'text/csv;charset=utf-8;',
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'skinloot-itens.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  // =====================================================
  // Dados derivados para o painel de detalhes
  // =====================================================
  const possuiDetalheAberto = !!selectedItem;

  // Dados básicos do usuário (com fallbacks caso não tenha vindo de /usuarios)
  const usuarioNome =
    selectedUser?.nome ||
    selectedUser?.username ||
    selectedItem?.original?.usuarioNome ||
    selectedItem?.autor ||
    'Usuário';

  // Tentativa de seguir a mesma ideia do Perfil:
  // primeiro pegamos e-mail do objeto de usuário vindo da API,
  // depois tentamos nos dados brutos da skin.
  const usuarioEmail =
    selectedUser?.email ||
    selectedUser?.contatoEmail ||
    selectedUser?.user?.email ||
    selectedItem?.original?.usuarioEmail ||
    selectedItem?.original?.email ||
    selectedItem?.original?.seller?.email ||
    '—';

  const planoBruto =
    selectedUser?.planoNome ||
    selectedUser?.plano ||
    selectedUser?.plan ||
    selectedItem?.original?.planoNome ||
    selectedItem?.original?.plano ||
    selectedItem?.original?.plan ||
    'gratuito';

  const planoKey = String(planoBruto || 'gratuito').toLowerCase();
  const planoInfo = planosMeta[planoKey] ||
    planosMeta['gratuito'] || {
      label: planoBruto || '—',
      color: '#454B54',
    };

  const totalSkinsUsuario = selectedUserSkins.length;

  // Skin em destaque: se o item selecionado já é uma skin, usamos ela.
  // Caso seja um usuário, usamos a primeira skin da lista (se existir).
  const skinEmDestaque =
    selectedItem?.tipo === 'skin'
      ? selectedItem.original
      : totalSkinsUsuario > 0
      ? selectedUserSkins[0].original
      : null;

  // Dados básicos do produto em destaque (para o card compacto)
  const skinEmDestaqueNome =
    skinEmDestaque?.skinNome ||
    skinEmDestaque?.title ||
    skinEmDestaque?.nome ||
    'Produto';

  const skinEmDestaquePreco =
    skinEmDestaque?.preco ?? skinEmDestaque?.price ?? null;

  const skinEmDestaqueImagemUrl =
    skinEmDestaque?.imagemUrl ||
    skinEmDestaque?.image ||
    skinEmDestaque?.imagem ||
    skinEmDestaque?.skinIcon ||
    '/img/placeholder.png';

  const skinEmDestaqueJogo =
    skinEmDestaque?.jogo?.nome ||
    skinEmDestaque?.game ||
    skinEmDestaque?.gameName ||
    'Jogo não informado';

  const skinEmDestaqueStatus =
    selectedItem?.status ||
    (skinEmDestaque?.ativo === false ? 'oculto' : 'ativo');

  const skinEmDestaqueCategoria =
    selectedItem?.categoria ||
    skinEmDestaque?.game ||
    skinEmDestaque?.gameName ||
    'Categoria não informada';

  const skinEmDestaqueId = skinEmDestaque?.id || skinEmDestaque?._id || null;

  // Lista de "outras skins" do usuário (sem a skin em destaque)
  const outrasSkinsDoUsuario = useMemo(() => {
    if (!skinEmDestaque || totalSkinsUsuario === 0) return [];
    const idDestaque = skinEmDestaque.id || skinEmDestaque._id;

    return selectedUserSkins.filter((item) => {
      const origem = item.original || {};
      const idItem = origem.id || origem._id;
      return String(idItem) !== String(idDestaque);
    });
  }, [skinEmDestaque, selectedUserSkins, totalSkinsUsuario]);

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
              console.log('Criar novo item clicado');
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

        {/* Bloco: Filtros DESKTOP/TABLET */}
        <section className="admin-bloco admin-only-desktop">
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
                  setTermoBusca('');
                  setFiltroTipo('todos');
                  setFiltroStatus('todos');
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
                  console.log('Aplicar filtros (atual já é reativo)');
                }}
              >
                Aplicar
              </button>
            </div>
          </div>
        </section>

        {/* BOTÃO MOBILE: abrir modal de filtros/busca/ordenação */}
        <section className="admin-bloco admin-only-mobile">
          <button
            type="button"
            className="admin-mobile-filtros-botao"
            onClick={() => setFiltrosMobileAbertos(true)}
          >
            Filtrar, buscar e ordenar
          </button>
        </section>

        {/* MODAL MOBILE DE FILTROS/BUSCA */}
        {filtrosMobileAbertos && (
          <div
            className="admin-mobile-modal-overlay admin-only-mobile"
            onClick={() => setFiltrosMobileAbertos(false)}
          >
            <div
              className="admin-mobile-modal"
              onClick={(evento) => evento.stopPropagation()}
            >
              <div className="admin-mobile-modal__dragbar" />

              <h2 className="admin-mobile-modal__titulo">
                Filtros, busca e ordenação
              </h2>

              {/* BUSCA */}
              <div className="admin-mobile-modal__grupo">
                <label
                  htmlFor="admin-mobile-busca"
                  className="admin-mobile-modal__label"
                >
                  Buscar
                </label>
                <input
                  id="admin-mobile-busca"
                  type="text"
                  className="admin-filtro__input admin-mobile-modal__input"
                  placeholder="Nome do item, categoria ou tipo..."
                  value={termoBusca}
                  onChange={(evento) => setTermoBusca(evento.target.value)}
                />
              </div>

              {/* TIPO */}
              <div className="admin-mobile-modal__grupo">
                <label
                  htmlFor="admin-mobile-tipo"
                  className="admin-mobile-modal__label"
                >
                  Tipo
                </label>
                <select
                  id="admin-mobile-tipo"
                  className="admin-filtro__input admin-mobile-modal__input"
                  value={filtroTipo}
                  onChange={(evento) => setFiltroTipo(evento.target.value)}
                >
                  <option value="todos">Todos</option>
                  <option value="skin">Skins</option>
                  <option value="caixa">Caixas</option>
                  <option value="usuario">Usuários</option>
                </select>
              </div>

              {/* STATUS */}
              <div className="admin-mobile-modal__grupo">
                <label
                  htmlFor="admin-mobile-status"
                  className="admin-mobile-modal__label"
                >
                  Status
                </label>
                <select
                  id="admin-mobile-status"
                  className="admin-filtro__input admin-mobile-modal__input"
                  value={filtroStatus}
                  onChange={(evento) => setFiltroStatus(evento.target.value)}
                >
                  <option value="todos">Todos</option>
                  <option value="ativo">Ativo</option>
                  <option value="oculto">Oculto</option>
                  <option value="banido">Banido</option>
                </select>
              </div>

              <div className="admin-mobile-modal__acoes">
                <button
                  type="button"
                  className="btn btn--ghost sm admin-mobile-modal__botao"
                  onClick={() => {
                    setTermoBusca('');
                    setFiltroTipo('todos');
                    setFiltroStatus('todos');
                  }}
                >
                  Limpar
                </button>
                <button
                  type="button"
                  className="btn btn--primary sm admin-mobile-modal__botao"
                  onClick={() => {
                    setPaginaMobile(1);
                    setFiltrosMobileAbertos(false);
                  }}
                >
                  Aplicar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================== PAINEL DE DETALHES ================== */}
        {possuiDetalheAberto && (
          <section className="admin-bloco admin-detalhe">
            <header className="admin-bloco__cabecalho admin-detalhe__cabecalho">
              <div>
                <h3>Detalhes do usuário</h3>
                <span className="admin-bloco__hint">
                  Informações básicas do usuário e produtos relacionados.
                </span>
              </div>

              <div className="admin-detalhe__cabecalho-acoes">
                <span className="admin-detalhe__tag">
                  {selectedItem?.tipo === 'skin'
                    ? 'Visualizando a partir de uma skin'
                    : 'Visualizando a partir de um usuário'}
                </span>
                <button
                  type="button"
                  className="btn btn--ghost sm"
                  onClick={() => {
                    setSelectedItem(null);
                    setSelectedUser(null);
                    setSelectedUserSkins([]);
                  }}
                >
                  Fechar painel
                </button>
              </div>
            </header>

            {/* Grid superior: coluna de usuário + coluna de produto em destaque */}
            <div className="admin-detalhe__grid">
              {/* Coluna: dados básicos do usuário */}
              <div className="admin-detalhe__usuario">
                <h4 className="admin-detalhe__titulo-secao">
                  Dados do usuário
                </h4>

                <div className="admin-detalhe__linha">
                  <span className="admin-detalhe__label">Nome de usuário</span>
                  <span className="admin-detalhe__valor">{usuarioNome}</span>
                </div>

                <div className="admin-detalhe__linha">
                  <span className="admin-detalhe__label">E-mail</span>
                  <span className="admin-detalhe__valor">{usuarioEmail}</span>
                </div>

                <div className="admin-detalhe__linha">
                  <span className="admin-detalhe__label">Plano</span>
                  <span className="admin-detalhe__valor">
                    <span
                      className="admin-detalhe__plano-badge"
                      style={{ borderColor: planoInfo.color }}
                    >
                      <span
                        className="admin-detalhe__plano-dot"
                        style={{ backgroundColor: planoInfo.color }}
                      />
                      {planoInfo.label}
                    </span>
                  </span>
                </div>

                <div className="admin-detalhe__linha">
                  <span className="admin-detalhe__label">
                    Skins listadas neste painel
                  </span>
                  <span className="admin-detalhe__valor">
                    {totalSkinsUsuario > 0
                      ? `${totalSkinsUsuario} item${
                          totalSkinsUsuario === 1 ? '' : 's'
                        }`
                      : 'Nenhuma skin encontrada para este usuário na listagem atual.'}
                  </span>
                </div>
              </div>

              {/* Coluna: card em destaque (lado direito) */}
              <div className="admin-detalhe__destaque">
                <h4 className="admin-detalhe__titulo-secao">
                  Produto em destaque
                </h4>

                {skinEmDestaque ? (
                  <div className="admin-destaque-card">
                    <div className="admin-destaque-card__media">
                      <img
                        src={skinEmDestaqueImagemUrl}
                        alt={skinEmDestaqueNome}
                        loading="lazy"
                        onError={(e) => {
                          if (e.currentTarget.src !== '/img/placeholder.png') {
                            e.currentTarget.src = '/img/placeholder.png';
                          }
                        }}
                      />
                    </div>

                    <div className="admin-destaque-card__body">
                      <div className="admin-destaque-card__header-row">
                        <div className="admin-destaque-card__nome">
                          {skinEmDestaqueNome}
                        </div>
                        <div className="admin-destaque-card__preco">
                          {skinEmDestaquePreco != null
                            ? formatarPreco(skinEmDestaquePreco)
                            : 'Preço não informado'}
                        </div>
                      </div>

                      <div className="admin-destaque-card__tags">
                        <span className="admin-destaque-tag">
                          {skinEmDestaqueJogo}
                        </span>
                        <span className="admin-destaque-tag">
                          {skinEmDestaqueCategoria}
                        </span>
                        <span
                          className={`admin-destaque-tag admin-destaque-tag--status-${skinEmDestaqueStatus}`}
                        >
                          {skinEmDestaqueStatus}
                        </span>
                        {skinEmDestaqueId && (
                          <span className="admin-destaque-tag admin-destaque-tag--id">
                            ID #{skinEmDestaqueId}
                          </span>
                        )}
                      </div>

                      <div className="admin-destaque-card__meta">
                        <span className="admin-destaque-card__seller">
                          Vendedor: {usuarioNome}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="admin-detalhe__mensagem-vazia">
                    Nenhuma skin disponível para destacar.
                  </p>
                )}
              </div>
            </div>

            {/* Faixa inferior em largura total: carrossel de outros produtos */}
            <div className="admin-detalhe__carrossel-bloco admin-detalhe__carrossel-bloco--full">
              <div className="admin-detalhe__carrossel-header">
                <h4 className="admin-detalhe__titulo-secao">
                  Outros produtos deste usuário
                </h4>
                {outrasSkinsDoUsuario.length > 0 && (
                  <span className="admin-detalhe__hint-menor">
                    Arraste lateralmente para ver mais itens deste usuário.
                  </span>
                )}
              </div>

              {outrasSkinsDoUsuario.length > 0 ? (
                <div className="admin-detalhe__carrossel">
                  {outrasSkinsDoUsuario.map((item) => {
                    const origem = item.original || {};
                    const key = origem.id || origem._id || Math.random();
                    return (
                      <div key={key} className="admin-detalhe__carrossel-item">
                        <SkinCard
                          data={origem}
                          liked={false}
                          onLike={() => {}}
                          onContato={() => {}}
                          onComprarFora={() => {}}
                        />
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="admin-detalhe__mensagem-vazia">
                  Não encontramos outros produtos deste usuário na listagem
                  atual.
                </p>
              )}
            </div>
          </section>
        )}

        {/* Bloco: Tabela de itens (DESKTOP/TABLET) */}
        <section className="admin-bloco admin-only-desktop">
          <header className="admin-bloco__cabecalho admin-bloco__cabecalho--tabela">
            <div>
              <h3>Itens cadastrados</h3>
              <span className="admin-bloco__hint">
                Gerencie o estado e as ações individuais sobre cada item.
              </span>
            </div>

            <span className="admin-bloco__contador">
              {itensFiltrados.length} resultado
              {itensFiltrados.length === 1 ? '' : 's'}
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
                {itensFiltrados.length === 0 && !loading && (
                  <tr>
                    <td colSpan={8} className="admin-tabela__vazio">
                      Nenhum item encontrado com os filtros atuais.
                    </td>
                  </tr>
                )}

                {loading && (
                  <tr>
                    <td colSpan={8} className="admin-tabela__vazio">
                      Carregando itens...
                    </td>
                  </tr>
                )}

                {!loading &&
                  itensFiltrados.map((item) => {
                    const idTexto = String(item.id ?? '');
                    const idCurto =
                      idTexto.length > 10
                        ? `${idTexto.slice(0, 8)}...`
                        : idTexto || '-';

                    const linhaAtiva =
                      selectedItem &&
                      String(selectedItem.id ?? '') === idTexto &&
                      selectedItem.tipo === item.tipo;

                    return (
                      <tr
                        key={idTexto || Math.random()}
                        className={
                          linhaAtiva
                            ? 'admin-tabela__linha admin-tabela__linha--ativa'
                            : 'admin-tabela__linha'
                        }
                      >
                        <td>
                          {/* felipe: O ID (talvez você queira truncar se ficar muito grande) */}
                          <span title={idTexto}>#{idCurto}</span>

                          {/* ✅ O NOME DO USUÁRIO AQUI */}
                          <div
                            style={{
                              fontSize: '0.85rem',
                              color: '#888',
                              marginTop: '2px',
                            }}
                          >
                            ({item.autor})
                          </div>
                        </td>
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
                            onClick={() => handleVerDetalhes(item)}
                          >
                            Detalhes
                          </button>
                          <button
                            type="button"
                            className="btn btn--outline sm admin-btn-outline"
                            onClick={() => console.log('Editar item', item.id)}
                          >
                            Editar
                          </button>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </section>

        {/* Bloco: Cards MOBILE */}
        <section className="admin-bloco admin-only-mobile">
          <header className="admin-bloco__cabecalho admin-bloco__cabecalho--tabela">
            <div>
              <h3>Itens cadastrados</h3>
              <span className="admin-bloco__hint">
                Visualização em cards para telas menores.
              </span>
            </div>

            <span className="admin-bloco__contador">
              {itensFiltrados.length} resultado
              {itensFiltrados.length === 1 ? '' : 's'}
            </span>
          </header>

          <div className="admin-mobile-cards">
            {loading && (
              <p className="admin-mobile-cards__mensagem">
                Carregando itens...
              </p>
            )}

            {!loading &&
              itensMobilePaginados.map((item) => {
                const idTexto = String(item.id ?? '');
                const idCurto =
                  idTexto.length > 10
                    ? `${idTexto.slice(0, 8)}...`
                    : idTexto || '-';

                const cardAtivo =
                  selectedItem &&
                  String(selectedItem.id ?? '') === idTexto &&
                  selectedItem.tipo === item.tipo;

                return (
                  <article
                    key={idTexto || Math.random()}
                    className={
                      cardAtivo
                        ? 'admin-mobile-card admin-mobile-card--ativo'
                        : 'admin-mobile-card'
                    }
                  >
                    <header className="admin-mobile-card__header">
                      <div>
                        <p className="admin-mobile-card__id">ID: #{idCurto}</p>
                        <p className="admin-mobile-card__autor">
                          {item.autor || 'Autor desconhecido'}
                        </p>
                      </div>

                      <span
                        className={`admin-status-badge admin-status-badge--${item.status}`}
                      >
                        {item.status}
                      </span>
                    </header>

                    <div className="admin-mobile-card__body">
                      <p className="admin-mobile-card__nome">{item.nome}</p>

                      <div className="admin-mobile-card__linha">
                        <span className="admin-mobile-card__label">Tipo:</span>
                        <span className="admin-mobile-card__valor">
                          {item.tipo}
                        </span>
                      </div>

                      <div className="admin-mobile-card__linha">
                        <span className="admin-mobile-card__label">
                          Categoria:
                        </span>
                        <span className="admin-mobile-card__valor">
                          {item.categoria}
                        </span>
                      </div>

                      <div className="admin-mobile-card__linha">
                        <span className="admin-mobile-card__label">Preço:</span>
                        <span className="admin-mobile-card__valor">
                          {formatarPreco(item.preco)}
                        </span>
                      </div>

                      <div className="admin-mobile-card__linha">
                        <span className="admin-mobile-card__label">
                          Criado em:
                        </span>
                        <span className="admin-mobile-card__valor">
                          {item.criadoEm}
                        </span>
                      </div>
                    </div>

                    <footer className="admin-mobile-card__footer">
                      <button
                        type="button"
                        className="btn btn--ghost sm admin-mobile-card__botao"
                        onClick={() => handleVerDetalhes(item)}
                      >
                        Detalhes
                      </button>
                      <button
                        type="button"
                        className="btn btn--outline sm admin-mobile-card__botao"
                        onClick={() => console.log('Editar item', item.id)}
                      >
                        Editar
                      </button>
                    </footer>
                  </article>
                );
              })}

            {!loading &&
              itensMobilePaginados.length === 0 &&
              itensFiltrados.length > 0 && (
                <p className="admin-mobile-cards__mensagem">
                  Página vazia. Ajuste a paginação.
                </p>
              )}

            {!loading && itensFiltrados.length === 0 && (
              <p className="admin-mobile-cards__mensagem">
                Nenhum item encontrado com os filtros atuais.
              </p>
            )}
          </div>

          {totalPaginasMobile > 1 && (
            <div className="admin-mobile-paginacao">
              <button
                type="button"
                className="admin-mobile-paginacao__botao"
                disabled={paginaMobile === 1}
                onClick={() => setPaginaMobile((anterior) => anterior - 1)}
              >
                Anterior
              </button>

              <span className="admin-mobile-paginacao__info">
                Página {paginaMobile} de {totalPaginasMobile}
              </span>

              <button
                type="button"
                className="admin-mobile-paginacao__botao"
                disabled={paginaMobile === totalPaginasMobile}
                onClick={() => setPaginaMobile((anterior) => anterior + 1)}
              >
                Próxima
              </button>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
