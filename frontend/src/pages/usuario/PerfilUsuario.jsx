// src/pages/usuario/PerfilUsuario.jsx

import { useContext, useEffect, useMemo, useState, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import './PerfilUsuario.css';
import { useAuth } from '../../services/AuthContext';
import { getMyProfile } from '../../services/users';
import { useToast } from '../../context/ToastContext';
import { getPlanoLimit } from '../../services/skinsService';
import {
  listarMinhasNormalizadas as getMinhasSkins,
  criarAnuncio as criarSkin,
  editarAnuncio as editarSkin,
  desativarAnuncio as desativarSkin,
  reativarAnuncio as reativarSkin,
} from '../../services/anuncioService';
import { listarJogos } from '../../services/jogoService';
import { renovarPlano, upgradePlano } from '../../services/planos';
import AuthBrand from '../../components/logo/AuthBrand';
import CheckoutModal from '../../components/checkout/CheckoutModal';

// Helpers
const fmtBRL = (n) =>
  Number.isFinite(Number(n))
    ? Number(n).toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    : '—';

// Mantido em sincronia com DashboardVitrine (label, cor, prioridade)
const plansMeta = {
  gratuito: { label: 'Gratuito', color: '#454B54', weight: 1.0 },
  intermediario: { label: 'Intermediário', color: '#00C896', weight: 1.6 },
  plus: { label: '+ Plus', color: '#39FF14', weight: 2.2 },
};

const DEFAULT_CSGO_DETAILS = {
  desgasteFloat: '',
  patternIndex: '',
  statTrak: false,
  exterior: 'Factory New',
};
const DEFAULT_CS2_DETAILS = {
  desgasteFloat: '',
  patternIndex: '',
  statTrak: false,
  exterior: 'Factory New',
};
const DEFAULT_LOL_DETAILS = {
  chroma: '',
  tipoSkin: '',
  championName: '',
};
const DEFAULT_FORM_EDICAO = {
  skinNome: '',
  preco: '',
  imagemUrl: '',
  // REMOVIDO: O campo 'detalhes'
  // ADICIONADOS:
  detalhesCsgo: DEFAULT_CSGO_DETAILS,
  detalhesCs2: DEFAULT_CS2_DETAILS,
  detalhesLol: DEFAULT_LOL_DETAILS,
};
const EXTERIOR_TO_FLOAT_MAP = {
  'Factory New': '0.03',
  'Minimal Wear': '0.10',
  'Field-Tested': '0.25',
  'Well-Worn': '0.40',
  'Battle-Scarred': '0.60',
};

// Placeholder final (fallback)
const IMG_PLACEHOLDER = 'https://placehold.co/600x400?text=Skin';

/** Lê um File como dataURL (para preview e extração base64). */
function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const rd = new FileReader();
    rd.onload = () => resolve(String(rd.result || ''));
    rd.onerror = reject;
    rd.readAsDataURL(file);
  });
}

/** Extrai { base64, mime } de uma dataURL (ex.: "data:image/png;base64,...."). */
function dataUrlToParts(dataUrl) {
  try {
    if (!dataUrl || typeof dataUrl !== 'string') return {};
    if (!dataUrl.startsWith('data:')) return {};
    const [head, b64] = dataUrl.split(',');
    if (!head || !b64) return {};
    // head: "data:image/png;base64"
    const mime = head.substring(5, head.indexOf(';')) || 'image/*';
    return { base64: b64, mime };
  } catch {
    return {};
  }
}

export default function PerfilUsuario() {
  const { user, logout, setUser } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation(); // usado para abrir modal vinda da vitrine

  const [perfil, setPerfil] = useState(null);
  const [skins, setSkins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  // Modal de plano
  const [painel, setPainel] = useState(null); // "renovar" | "upgrade" | null
  const [busy, setBusy] = useState(false);

  // Checkout mockado
  const [checkoutAberto, setCheckoutAberto] = useState(false);
  const [checkoutPlano, setCheckoutPlano] = useState(null); // "gratuito" | "intermediario" | "plus"
  const [checkoutVariante, setCheckoutVariante] = useState('mensal'); // fixo para demo
  const [checkoutAcao, setCheckoutAcao] = useState(null); // { tipo: 'renovar' } ou { tipo: 'upgrade', planoNovo, label }

  const [filtroStatus, setFiltroStatus] = useState('todas');
  const [filtroStatusAberto, setFiltroStatusAberto] = useState(false);

  const filtroOptions = [
    { value: 'todas', label: 'Todas' },
    { value: 'ativas', label: 'Apenas ativas' },
    { value: 'inativas', label: 'Apenas inativas' },
  ];

  function getFiltroLabel(value) {
    return filtroOptions.find((opt) => opt.value === value)?.label || 'Todas';
  }

  const skinsFiltradas = useMemo(() => {
    if (filtroStatus === 'ativas')
      return skins.filter((s) => s.ativo !== false);
    if (filtroStatus === 'inativas')
      return skins.filter((s) => s.ativo === false);
    return skins;
  }, [skins, filtroStatus]);

  // Estado do modal de edição
  const [modalEdicaoAberto, setModalEdicaoAberto] = useState(false);
  const [skinEditando, setSkinEditando] = useState(null);
  const [formEdicao, setFormEdicao] = useState(DEFAULT_FORM_EDICAO);
  const [imagemFile, setImagemFile] = useState(null); // arquivo selecionado
  const [previewImagem, setPreviewImagem] = useState(''); // preview (arquivo ou URL/dataURL)
  const [salvandoEdicao, setSalvandoEdicao] = useState(false);
  const inputFileRef = useRef(null);

  const [jogosList, setJogosList] = useState([]);
  const [selectedJogoId, setSelectedJogoId] = useState('');

  // flag: reativar após salvar (fluxo de reativação abre editor primeiro)
  const [reativarDepoisDeSalvar, setReativarDepoisDeSalvar] = useState(false);

  // Estado do modal de desativação (2 passos)
  const [modalDesativarAberto, setModalDesativarAberto] = useState(false);
  const [skinDesativando, setSkinDesativando] = useState(null);
  const [passoDesativar, setPassoDesativar] = useState(1); // 1 ou 2
  const [confirmTexto, setConfirmTexto] = useState(''); // palavra "Confirmo"
  const [confirmCheck, setConfirmCheck] = useState(false);
  const [desativando, setDesativando] = useState(false);
  // Mantém se o anúncio entrou no editor sem jogo (true = pode escolher)
  const jogoInicialVazioRef = useRef(true);

  const selectedGameName = useMemo(() => {
    return (
      jogosList.find((j) => String(j.id) === String(selectedJogoId))?.nome ||
      null
    );
  }, [jogosList, selectedJogoId]);

  // dispara para a vitrine recarregar quando suas skins mudarem
  function notifySkinsChanged() {
    window.dispatchEvent(new CustomEvent('skins:changed'));
  }
  // Efeito para buscar a lista de jogos da API
  useEffect(() => {
    const fetchJogos = async () => {
      try {
        const jogos = await listarJogos(); // <-- Chama a API real
        setJogosList(jogos); // <-- Salva a lista no estado
      } catch (error) {
        console.error('Falha ao carregar lista de jogos:', error);
        addToast('Não foi possível carregar os jogos.', 'error');
        setJogosList([]); // Define como vazio em caso de erro
      }
    };
    fetchJogos();
  }, [addToast]);

  // Carregamento inicial (perfil + skins do mock)
  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        setLoading(true);
        setErr('');
        const p = await getMyProfile();
        if (!cancel) setPerfil(p);

        try {
          const s = await getMinhasSkins();

          // Ordenação por data mais recente -> mais antiga
          const ordenadas = (Array.isArray(s) ? s : s?.content || []).sort(
            (a, b) => {
              const getTime = (obj) =>
                Number(obj?.listedAt) ||
                Number(
                  obj?.dataCriacao ? new Date(obj.dataCriacao).getTime() : 0,
                ) ||
                Number(
                  obj?.createdAt ? new Date(obj.createdAt).getTime() : 0,
                ) ||
                0;

              return getTime(b) - getTime(a); // mais recente primeiro
            },
          );

          if (!cancel) setSkins(ordenadas);
        } catch {
          if (!cancel) setSkins([]);
        }
      } catch (e) {
        if (!cancel)
          setErr(e?.message || 'Não foi possível carregar seu perfil.');
      } finally {
        if (!cancel) setLoading(false);
      }
    })();
    return () => {
      cancel = true;
    };
  }, []);

  // abre a modal de upgrade automaticamente se veio da vitrine
  useEffect(() => {
    const panel = location.state?.openPlanoPanel; // 'upgrade' | 'renovar'
    const pre = location.state?.preselectPlan; // 'gratuito' | 'intermediario' | 'plus'

    if (panel) {
      setPainel(panel);

      if (pre) {
        // foca o botão do plano sugerido
        setTimeout(() => {
          const el = document.querySelector(
            `.perfil-upgrade-card button[data-plan="${pre}"]`,
          );
          el?.focus();
        }, 0);
      }

      // limpa o state para não reabrir ao voltar
      navigate('.', { replace: true, state: null });
    }
  }, [location, navigate]);

  // Plano e cota
  const planoKey = String(
    perfil?.planoAssinatura?.nome || // estrutura do backend
      perfil?.plano || // fallback local
      user?.plano || // fallback global
      'gratuito',
  ).toLowerCase();

  const planoInfo = plansMeta[planoKey] || plansMeta.gratuito;

  const limitePlano = getPlanoLimit(planoKey);
  const usados = skins.filter((s) => s.ativo !== false).length; // conta ativos
  const restantes = Number.isFinite(limitePlano)
    ? Math.max(0, limitePlano - usados)
    : '∞';
  const atingiuLimite = Number.isFinite(limitePlano) && usados >= limitePlano;

  const progress = useMemo(() => {
    if (!Number.isFinite(limitePlano)) return 100;
    if (limitePlano <= 0) return 0;
    return Math.min(100, Math.round((usados / limitePlano) * 100));
  }, [usados, limitePlano]);

  function handleNovaSkin() {
    if (atingiuLimite) return;

    jogoInicialVazioRef.current = true;

    setFormEdicao(DEFAULT_FORM_EDICAO);
    setSelectedJogoId(''); // Reseta a seleção de jogo
    setImagemFile(null);
    setPreviewImagem('');
    setModalEdicaoAberto(true);
  }

  function abrirRenovar() {
    setPainel('renovar');
  }
  function abrirUpgrade() {
    setPainel('upgrade');
  }
  function fecharPainel() {
    if (!busy) setPainel(null);
  }

  // Checkout para plano
  function abrirCheckoutRenovar() {
    setCheckoutPlano(planoKey);
    setCheckoutVariante('mensal');
    setCheckoutAcao({ tipo: 'renovar' });
    setPainel(null);
    setCheckoutAberto(true);
  }

  function abrirCheckoutUpgrade(planoNovo, label) {
    setCheckoutPlano(planoNovo);
    setCheckoutVariante('mensal');
    setCheckoutAcao({ tipo: 'upgrade', planoNovo, label });
    setPainel(null);
    setCheckoutAberto(true);
  }

  async function handleCheckoutConfirmar() {
    if (!checkoutAcao) {
      setCheckoutAberto(false);
      return;
    }

    try {
      if (checkoutAcao.tipo === 'renovar') {
        await onConfirmarRenovar();
      } else if (checkoutAcao.tipo === 'upgrade') {
        await onEscolherPlano(checkoutAcao.planoNovo, checkoutAcao.label);
      }
    } finally {
      setCheckoutAberto(false);
      setCheckoutAcao(null);
    }
  }

  async function handleLogout() {
    try {
      await logout();
      navigate('/');
    } catch (e) {
      console.error('Falha ao sair:', e);
    }
  }

  // Plano
  async function onConfirmarRenovar() {
    setBusy(true);
    try {
      await renovarPlano(planoKey);
      const p = await getMyProfile();
      setPerfil(p);
      if (typeof setUser === 'function') setUser(p);
      addToast('Plano renovado com sucesso!', 'success');
      setPainel(null);
    } catch (error) {
      console.error('Falha ao renovar plano:', error);
      addToast(
        error?.response?.data?.message || 'Erro ao renovar plano.',
        'error',
      );
    } finally {
      setBusy(false);
    }
  }
  async function onEscolherPlano(planoNovo, label) {
    setBusy(true);
    try {
      await upgradePlano(planoNovo);
      const novoNomePlano = planoNovo.toUpperCase();
      setPerfil((prev) => ({
        ...prev,
        planoAssinatura: { ...prev?.planoAssinatura, nome: novoNomePlano },
        plano: planoNovo,
      }));
      if (typeof setUser === 'function') {
        setUser((prev) => ({
          ...prev,
          planoAssinatura: { ...prev?.planoAssinatura, nome: novoNomePlano },
          plano: planoNovo,
        }));
      }
      addToast(`Upgrade para ${label} realizado!`, 'success');
      setPainel(null);
    } catch (error) {
      console.error('Falha ao fazer upgrade:', error);
      addToast(
        error?.response?.data?.message || 'Erro ao fazer upgrade.',
        'error',
      );
    } finally {
      setBusy(false);
    }
  }

  //  EDITAR / CRIAR SKIN
  function abrirEditar(skin) {
    setSkinEditando(skin);

    const urlAtual = skin?.imagemUrl || skin?.image || skin?.imagem || '';
    const raw = skin?._raw || {}; // Pega os dados brutos da API

    // NOVO: Define o jogo selecionado
    const jogoId = raw.jogo?.id || skin?.jogo?.id || '';

    // Se já havia jogo, travamos o select; se não havia, deixamos editar.
    jogoInicialVazioRef.current = !jogoId;

    setSelectedJogoId(jogoId);

    const gameName = raw.jogo?.nome || skin?.jogo?.nome || skin?.game || null;

    // MODIFICADO: Preenche o formulário com dados existentes
    setFormEdicao({
      skinNome: skin?.skinNome || skin?.title || skin?.nome || '',
      preco: skin?.preco ?? skin?.price ?? '',
      imagemUrl: urlAtual,
      descricao: raw.descricao ?? '',
      // Preenche os detalhes corretos, ou usa o padrão
      detalhesCsgo:
        raw.detalhesCsgo || skin?._raw?.detalhesCsgo || DEFAULT_CSGO_DETAILS,
      detalhesCs2:
        raw.detalhesCs2 ||
        raw.cs2 ||
        skin?._raw?.detalhesCs2 ||
        skin?._raw?.cs2 ||
        DEFAULT_CS2_DETAILS,
      detalhesLol:
        raw.detalhesLol || skin?._raw?.detalhesLol || DEFAULT_LOL_DETAILS,
    });

    setImagemFile(null);
    setPreviewImagem(urlAtual || '');
    setModalEdicaoAberto(true);
  }

  function fecharEditar() {
    if (salvandoEdicao) return;
    setModalEdicaoAberto(false);
    setSkinEditando(null);
    setFormEdicao({ skinNome: '', preco: '', imagemUrl: '' });
    setImagemFile(null);
    setPreviewImagem('');
    setReativarDepoisDeSalvar(false);
  }

  // Atualiza preview quando digita URL (se não houver arquivo)
  useEffect(() => {
    if (!modalEdicaoAberto) return;
    if (imagemFile) return;
    setPreviewImagem(formEdicao.imagemUrl || '');
  }, [formEdicao.imagemUrl, imagemFile, modalEdicaoAberto]);

  // Ao selecionar arquivo: guarda file, zera URL e gera preview
  async function onEscolherArquivo(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (readEvent) => {
      let dataUrl = String(readEvent.target?.result || '');

      // INÍCIO DA CORREÇÃO
      dataUrl = dataUrl.replace(/(\r\n|\n|\r)/gm, '').trim();

      const parts = dataUrl.split(',');
      if (
        parts.length !== 2 ||
        !parts[0].startsWith('data:image') ||
        !parts[1]
      ) {
        console.error('dataURL inesperada, não foi possível dividir:', dataUrl);
        addToast(
          'Formato de arquivo de imagem inválido ou corrompido.',
          'error',
        );
        setPreviewImagem(''); // Limpa o preview se falhar
        setImagemFile(null);
        return;
      }

      const [head, base64] = parts;
      const mime = head.match(/:(.*?);/)?.[1] || 'image/png';

      setPreviewImagem(dataUrl);

      setImagemFile({
        file: file,
        base64: base64,
        mime: mime,
      });
      setFormEdicao((v) => ({ ...v, imagemUrl: '' }));
    };
    reader.onerror = () => {
      addToast('Falha ao ler o arquivo de imagem.', 'error');
      setPreviewImagem('');
      setImagemFile(null);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  }

  // Normaliza backend para garantir campo de imagem
  function withImagemUrl(obj) {
    if (!obj) return obj;
    const imagemUrl =
      obj.skinIcon ||
      obj.imagemUrl ||
      obj.imageUrl ||
      obj.image ||
      obj.imagem ||
      '';
    return { ...obj, imagemUrl };
  }

  const handleExteriorChange = (e) => {
    const novoExterior = e.target.value;
    const floatPadrao = EXTERIOR_TO_FLOAT_MAP[novoExterior] || '';

    setFormEdicao((prev) => ({
      ...prev,
      detalhesCsgo: {
        ...prev.detalhesCsgo,
        exterior: novoExterior,
        desgasteFloat: floatPadrao,
      },
    }));
  };

  // Salva (cria ou edita)
  async function salvarEdicao() {
    setSalvandoEdicao(true);
    try {
      const nomeOk = String(formEdicao.skinNome || '').trim().length > 0;
      const precoNum = Number(String(formEdicao.preco).replace(',', '.'));
      if (!nomeOk || !Number.isFinite(precoNum) || precoNum < 0) {
        addToast('Preencha nome e preço válidos.', 'error');
        setSalvandoEdicao(false);
        return;
      }

      // Validação de Jogo
      if (!selectedJogoId) {
        addToast('Você precisa selecionar um jogo.', 'error');
        setSalvandoEdicao(false);
        return;
      }

      // Preparar imagem Base64/MIME se for arquivo ou dataURL
      let skinImageBase64 = null;
      let skinImageMime = null;
      let finalImageUrl = formEdicao.imagemUrl;
      if (imagemFile) {
        skinImageBase64 = imagemFile.base64 || null;
        skinImageMime = imagemFile.mime || null;
        finalImageUrl = null;
      } else if (formEdicao.imagemUrl?.startsWith('data:')) {
        const parts = dataUrlToParts(formEdicao.imagemUrl);
        skinImageBase64 = parts.base64 || null;
        skinImageMime = parts.mime || null;
        finalImageUrl = null;
      }

      const id = skinEditando?.id || skinEditando?._id;

      const payload = {
        titulo: formEdicao.skinNome,
        descricao: formEdicao.descricao,
        preco: precoNum,
        skinId: null,
        skinName: formEdicao.skinNome,
        status: reativarDepoisDeSalvar
          ? 'ATIVO'
          : skinEditando?.status || 'ATIVO',

        jogoId: selectedJogoId,
        detalhesCsgo:
          selectedGameName === 'CS:GO' ? formEdicao.detalhesCsgo : null,

        detalhesCs2: selectedGameName === 'CS2' ? formEdicao.detalhesCs2 : null,

        detalhesLol:
          selectedGameName === 'League of Legends'
            ? formEdicao.detalhesLol
            : null,

        skinImageUrl: finalImageUrl,
        skinImageBase64: skinImageBase64,
        skinImageMime: skinImageMime,
      };

      if (id) {
        const atualizadoRaw = await editarSkin(id, payload);
        const atualizado = withImagemUrl(atualizadoRaw);

        if (reativarDepoisDeSalvar) {
          await reativarSkin(id);
          atualizado.ativo = true;
        }

        setSkins((lista) =>
          lista.map((s) =>
            String(s.id || s._id) === String(id) ? { ...s, ...atualizado } : s,
          ),
        );

        addToast(
          reativarDepoisDeSalvar
            ? 'Skin salva e reativada!'
            : 'Skin atualizada!',
          'success',
        );
        notifySkinsChanged();
      } else {
        const novaRaw = await criarSkin(payload);
        const nova = withImagemUrl(novaRaw);
        setSkins((lista) => [nova, ...lista]);
        addToast('Skin criada!', 'success');
        notifySkinsChanged();
      }

      fecharEditar();
    } catch (e) {
      addToast(e?.message || 'Falha ao salvar a skin.', 'error');
    } finally {
      setSalvandoEdicao(false);
      setReativarDepoisDeSalvar(false);
    }
  }

  //  DESATIVAR / REATIVAR
  function abrirDesativar(skin) {
    setSkinDesativando(skin);
    setPassoDesativar(1);
    setConfirmTexto('');
    setConfirmCheck(false);
    setModalDesativarAberto(true);
  }

  function fecharDesativar() {
    if (desativando) return;
    setModalDesativarAberto(false);
    setSkinDesativando(null);
    setPassoDesativar(1);
    setConfirmTexto('');
    setConfirmCheck(false);
  }

  async function confirmarDesativacaoFinal() {
    if (!skinDesativando?.id && !skinDesativando?._id) return;

    const okTexto =
      String(confirmTexto || '')
        .trim()
        .toLowerCase() === 'confirmo';
    if (!okTexto || !confirmCheck) return;

    const id = skinDesativando.id || skinDesativando._id;
    setDesativando(true);
    try {
      await desativarSkin(id);
      setSkins((lista) =>
        lista.map((s) =>
          String(s.id || s._id) === String(id) ? { ...s, ativo: false } : s,
        ),
      );
      addToast('Skin desativada com sucesso.', 'success');
      notifySkinsChanged();
      fecharDesativar();
    } catch (e) {
      addToast(e?.message || 'Falha ao desativar a skin.', 'error');
    } finally {
      setDesativando(false);
    }
  }

  async function handleReativar(skin) {
    const id = skin?.id || skin?._id;
    if (!id) return;

    if (Number.isFinite(limitePlano) && usados >= limitePlano) {
      addToast(
        'Você atingiu o limite do plano. Faça upgrade para reativar.',
        'error',
      );
      return;
    }

    setReativarDepoisDeSalvar(true);
    setSkinEditando({ ...skin });
    const urlAtual = skin?.imagemUrl || skin?.image || skin?.imagem || '';
    const raw = skin?._raw || {}; // Pega os dados brutos da API

    const jogoId = raw.jogo?.id || skin?.jogo?.id || '';
    jogoInicialVazioRef.current = !jogoId;
    setSelectedJogoId(jogoId);

    setFormEdicao({
      skinNome: skin?.skinNome || skin?.title || skin?.nome || '',
      preco: skin?.preco ?? skin?.price ?? '',
      imagemUrl: urlAtual,
      descricao: raw.descricao ?? '',
      detalhesCsgo:
        raw.detalhesCsgo || skin?._raw?.detalhesCsgo || DEFAULT_CSGO_DETAILS,
      detalhesCs2:
        raw.detalhesCs2 ||
        raw.cs2 ||
        skin?._raw?.detalhesCs2 ||
        skin?._raw?.cs2 ||
        DEFAULT_CS2_DETAILS,
      detalhesLol:
        raw.detalhesLol || skin?._raw?.detalhesLol || DEFAULT_LOL_DETAILS,
    });
    setImagemFile(null);
    setPreviewImagem(urlAtual || '');
    setModalEdicaoAberto(true);
  }

  // RENDER
  if (loading) {
    return (
      <div className="perfil-root">
        <div className="perfil-topbar">
          <AuthBrand />
        </div>
        <div className="perfil-container">
          <p>Carregando seu perfil…</p>
        </div>
      </div>
    );
  }

  if (err) {
    return (
      <div className="perfil-root">
        <div className="perfil-topbar">
          <AuthBrand />
        </div>
        <div className="perfil-container">
          <p style={{ color: '#f66' }}>{err}</p>
          <button
            className="btn btn--ghost"
            onClick={() => window.location.reload()}
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="perfil-root">
      {/* Topbar */}
      <div className="perfil-topbar">
        <AuthBrand />
        <div className="perfil-actions">
          <Link to="/" className="btn btn--ghost sm">
            Vitrine
          </Link>
          <button className="btn btn--ghost sm" onClick={handleLogout}>
            Sair
          </button>
        </div>
      </div>

      <header className="perfil-hero">
        <div className="perfil-hero__copy">
          <h1>Meu Perfil</h1>
          <p>Gerencie seus dados, seu plano e seus anúncios/skins.</p>
        </div>
      </header>

      <div className="perfil-container">
        {/* Dados + Plano */}
        <section className="perfil-block">
          <h2>Dados da conta</h2>
          <div className="perfil-grid perfil-grid--2">
            <div className="perfil-card">
              <div className="perfil-field">
                <label>Nome</label>
                <div className="perfil-value" tabIndex={0}>
                  {perfil?.nome || perfil?.name || user?.nome || '—'}
                </div>
              </div>
              <div className="perfil-field">
                <label>E-mail</label>
                <div className="perfil-value" tabIndex={0}>
                  {perfil?.email || user?.email || '—'}
                </div>
              </div>
              <div className="perfil-field">
                <label>Desde</label>
                <div className="perfil-value" tabIndex={0}>
                  {perfil?.criadoEm
                    ? new Date(perfil.criadoEm).toLocaleDateString('pt-BR')
                    : perfil?.createdAt
                    ? new Date(perfil.createdAt).toLocaleDateString('pt-BR')
                    : '—'}
                </div>
              </div>
            </div>

            <div className="perfil-card">
              <div className="perfil-plano-header">
                <span
                  className="perfil-plano-badge"
                  style={{ background: planoInfo.color }}
                >
                  {planoInfo.label}
                </span>
                <div className="perfil-plano-title">Plano atual</div>
              </div>

              <div className="perfil-cota">
                <div className="perfil-cota-row">
                  <span>Limite de anúncios</span>
                  <strong>
                    {Number.isFinite(limitePlano)
                      ? `${usados}/${limitePlano}`
                      : `${usados}/∞`}
                  </strong>
                </div>
                <div className="perfil-progress">
                  <div
                    className="perfil-progress__bar"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="perfil-cota-hint">
                  {atingiuLimite
                    ? 'Você atingiu o limite do seu plano.'
                    : `Você ainda pode cadastrar ${
                        Number.isFinite(restantes) ? restantes : '∞'
                      } skins.`}
                </div>
              </div>

              <div className="perfil-plano-actions">
                <button className="btn btn--ghost" onClick={abrirRenovar}>
                  Renovar
                </button>
                <button className="btn btn--primary" onClick={abrirUpgrade}>
                  Fazer upgrade
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Minhas skins */}
        <section className="perfil-block">
          <div className="perfil-block-header">
            <h2>Minhas Skins</h2>

            <div className="perfil-filter-area">
              <div className="perfil-filter-select-wrapper">
                <button
                  type="button"
                  className="perfil-filter-select-display"
                  onClick={() =>
                    setFiltroStatusAberto((prevAberto) => !prevAberto)
                  }
                >
                  <span>{getFiltroLabel(filtroStatus)}</span>
                  <span className="perfil-filter-select-arrow">▼</span>
                </button>

                {filtroStatusAberto && (
                  <div className="perfil-filter-dropdown">
                    {filtroOptions.map((opt) => (
                      <button
                        type="button"
                        key={opt.value}
                        className={`perfil-filter-option ${
                          filtroStatus === opt.value ? 'active' : ''
                        }`}
                        onClick={() => {
                          setFiltroStatus(opt.value);
                          setFiltroStatusAberto(false);
                        }}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button
                className="btn btn--primary"
                onClick={handleNovaSkin}
                disabled={atingiuLimite}
                title={
                  atingiuLimite
                    ? 'Limite atingido para seu plano'
                    : 'Cadastrar nova skin'
                }
              >
                Cadastrar nova skin
              </button>
            </div>
          </div>

          {skins.filter((s) => s.ativo !== false).length === 0 ? (
            <div className="perfil-empty">
              <p>Você ainda não cadastrou nenhuma skin ativa.</p>
              <button
                className="btn btn--ghost"
                onClick={handleNovaSkin}
                disabled={atingiuLimite}
              >
                Cadastrar primeira skin
              </button>
            </div>
          ) : (
            <div className="perfil-grid-cards">
              {skinsFiltradas.map((s) => (
                <article
                  key={s.id || s._id}
                  className={`card ${s.ativo === false ? 'card--inativa' : ''}`}
                >
                  <div className="card__media">
                    <img
                      src={
                        s.imagemUrl ||
                        s.image ||
                        s.imagem ||
                        '/img/placeholder.png'
                      }
                      alt={s.skinNome || s.title || s.nome || 'Skin'}
                      loading="lazy"
                      onError={(e) => {
                        if (e.currentTarget.src !== IMG_PLACEHOLDER) {
                          e.currentTarget.src = IMG_PLACEHOLDER;
                        }
                      }}
                    />
                    <span
                      className="badge"
                      style={{ background: planoInfo.color }}
                    >
                      {s.ativo === false ? 'Inativa' : planoInfo.label}
                    </span>
                  </div>
                  <div className="card__body">
                    <h3>{s.skinNome || s.title || s.nome || 'Skin'}</h3>
                    <div className="meta">
                      <span className="price">
                        {s.ativo === false ? (
                          '—'
                        ) : (
                          <>R$ {fmtBRL(s.preco ?? s.price)}</>
                        )}
                      </span>
                    </div>
                    <div className="seller">
                      <span>ID: {s.id || s._id || '—'}</span>
                      <div className="cta">
                        {s.ativo === false ? (
                          <button
                            className="btn btn--primary"
                            onClick={() => handleReativar(s)}
                            title="Editar e reativar esta skin"
                          >
                            Reativar
                          </button>
                        ) : (
                          <>
                            <button
                              className="btn btn--ghost"
                              onClick={() => abrirEditar(s)}
                              title="Editar esta skin"
                            >
                              Editar
                            </button>
                            <button
                              className="btn btn--ghost"
                              onClick={() => abrirDesativar(s)}
                              title="Desativar esta skin"
                            >
                              Desativar
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Modal: Renovar / Upgrade */}
      {painel && (
        <div className="perfil-modal" role="dialog" aria-modal="true">
          <div className="perfil-modal__backdrop" onClick={fecharPainel} />
          <div className="perfil-modal__card">
            <div className="perfil-modal__head">
              <h3>
                {painel === 'renovar'
                  ? 'Renovar plano'
                  : 'Fazer upgrade de plano'}
              </h3>
              <button
                className="perfil-modal__close"
                onClick={fecharPainel}
                aria-label="Fechar"
              >
                ×
              </button>
            </div>

            {painel === 'renovar' ? (
              <>
                <p className="perfil-modal__desc">
                  Você está no plano{' '}
                  <strong style={{ color: planoInfo.color }}>
                    {planoInfo.label}
                  </strong>
                  . Revise as informações e confirme a renovação.
                </p>
                <div className="perfil-modal__grid">
                  <div className="perfil-modal__item">
                    <span className="k">Plano atual</span>
                    <span className="v">{planoInfo.label}</span>
                  </div>
                  <div className="perfil-modal__item">
                    <span className="k">Limite de anúncios</span>
                    <span className="v">
                      {Number.isFinite(limitePlano) ? `${limitePlano}` : '∞'}
                    </span>
                  </div>
                  <div className="perfil-modal__item">
                    <span className="k">Situação</span>
                    <span className="v">
                      {atingiuLimite ? 'No limite' : 'Dentro do limite'}
                    </span>
                  </div>
                </div>
                <div className="perfil-modal__actions perfil-modal__actions--inline">
                  <button
                    className="btn btn--ghost"
                    onClick={fecharPainel}
                    disabled={busy}
                  >
                    Cancelar
                  </button>
                  <button
                    className="btn btn--primary"
                    onClick={abrirCheckoutRenovar}
                    disabled={busy}
                  >
                    {busy ? 'Confirmando...' : 'Confirmar renovação'}
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="perfil-modal__desc">
                  Escolha um plano para fazer upgrade e aumentar sua
                  visibilidade e limites.
                </p>
                <div className="perfil-upgrade-grid">
                  {[
                    {
                      key: 'gratuito',
                      label: 'Gratuito',
                      lim: getPlanoLimit('gratuito'),
                      cor: plansMeta.gratuito.color,
                      prio: plansMeta.gratuito.weight,
                    },
                    {
                      key: 'intermediario',
                      label: 'Intermediário',
                      lim: getPlanoLimit('intermediario'),
                      cor: plansMeta.intermediario.color,
                      prio: plansMeta.intermediario.weight,
                    },
                    {
                      key: 'plus',
                      label: 'Plus',
                      lim: getPlanoLimit('plus'),
                      cor: plansMeta.plus.color,
                      prio: plansMeta.plus.weight,
                    },
                  ].map((pl) => (
                    <div key={pl.key} className="perfil-upgrade-card">
                      <div
                        className="perfil-upgrade-badge"
                        style={{ background: pl.cor }}
                      >
                        {pl.label}
                      </div>
                      <ul className="perfil-upgrade-list">
                        <li>
                          Prioridade de exibição:{' '}
                          <strong>{pl.prio.toFixed(1)}x</strong>
                        </li>
                        <li>
                          Limite de anúncios:{' '}
                          <strong>
                            {Number.isFinite(pl.lim) ? pl.lim : '∞'}
                          </strong>
                        </li>
                        {pl.key !== 'gratuito' && <li>Badge de destaque</li>}
                        <li>Suporte via e-mail</li>
                        {pl.key === 'plus' && (
                          <li>Spotlight na página inicial</li>
                        )}
                      </ul>
                      <button
                        className="btn btn--primary btn--full"
                        data-plan={pl.key}
                        disabled={pl.key === planoKey || busy}
                        title={
                          pl.key === planoKey
                            ? 'Plano atual'
                            : 'Migrar para este plano'
                        }
                        onClick={() => abrirCheckoutUpgrade(pl.key, pl.label)}
                      >
                        {pl.key === planoKey
                          ? 'Seu plano atual'
                          : busy
                          ? 'Processando...'
                          : `Escolher ${pl.label}`}
                      </button>
                    </div>
                  ))}
                </div>
                <div className="perfil-modal__actions perfil-modal__actions--inline">
                  <button
                    className="btn btn--ghost"
                    onClick={fecharPainel}
                    disabled={busy}
                  >
                    Fechar
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* MODAL: EDITAR / NOVA */}
      {modalEdicaoAberto && (
        <div className="perfil-modal" role="dialog" aria-modal="true">
          <div className="perfil-modal__backdrop" onClick={fecharEditar} />
          <div className="perfil-modal__card">
            <div className="perfil-modal__head">
              <h3>
                {skinEditando?.id || skinEditando?._id
                  ? 'Editar skin'
                  : 'Nova skin'}
              </h3>
              <button
                className="perfil-modal__close"
                onClick={fecharEditar}
                aria-label="Fechar"
              >
                ×
              </button>
            </div>

            {/* TUDO QUE CRESCE FICA ROLÁVEL AQUI */}
            <div className="perfil-modal__scroll">
              {/* Uploader clicável + preview (arquivo OU URL/dataURL colada) */}
              <div
                className="perfil-upload"
                role="button"
                tabIndex={0}
                onClick={() => inputFileRef.current?.click()}
                onKeyDown={(e) =>
                  (e.key === 'Enter' || e.key === ' ') &&
                  inputFileRef.current?.click()
                }
                title="Clique para selecionar uma imagem do computador"
              >
                {previewImagem ? (
                  <img
                    src={previewImagem}
                    alt="Pré-visualização"
                    onError={(e) => {
                      e.currentTarget.src = IMG_PLACEHOLDER;
                    }}
                  />
                ) : (
                  <div className="perfil-upload__placeholder">
                    Clique para enviar uma imagem
                  </div>
                )}
                <input
                  ref={inputFileRef}
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={onEscolherArquivo}
                />
              </div>

              <form
                className="perfil-form"
                noValidate
                onSubmit={(e) => {
                  e.preventDefault();
                  salvarEdicao();
                }}
              >
                {/* Seletor de Jogo */}
                <div className="perfil-form__row">
                  <label htmlFor="f-jogo">Jogo (Obrigatório)</label>
                  <select
                    id="f-jogo"
                    value={selectedJogoId}
                    onChange={(e) => setSelectedJogoId(e.target.value)}
                    required
                    // Desabilita se o anúncio JÁ tinha jogo ao abrir o editor
                    disabled={!jogoInicialVazioRef.current}
                    title={
                      !jogoInicialVazioRef.current
                        ? 'O jogo deste anúncio não pode ser alterado.'
                        : 'Selecione o jogo para este anúncio'
                    }
                  >
                    <option value="" disabled>
                      Selecione um jogo...
                    </option>
                    {jogosList.map((jogo) => (
                      <option key={jogo.id} value={jogo.id}>
                        {jogo.nome}
                      </option>
                    ))}
                  </select>

                  {!jogoInicialVazioRef.current && (
                    <small className="perfil-form__hint">
                      O jogo deste anúncio já foi definido e não pode ser
                      alterado. Para mudar, crie um novo anúncio.
                    </small>
                  )}
                </div>

                <div className="perfil-form__row">
                  <label htmlFor="f-nome">Nome</label>
                  <input
                    id="f-nome"
                    type="text"
                    required
                    placeholder="Nome da skin (Ex: AWP | Dragon Lore)"
                    value={formEdicao.skinNome}
                    onChange={(e) =>
                      setFormEdicao((v) => ({ ...v, skinNome: e.target.value }))
                    }
                  />
                </div>

                {/* Descrição */}
                <div className="perfil-form__row">
                  <label htmlFor="f-descricao">Descrição</label>
                  <textarea
                    id="f-descricao"
                    className="textarea"
                    placeholder="Descrição do anúncio, detalhes, etc."
                    rows={4}
                    value={formEdicao.descricao}
                    onChange={(e) =>
                      setFormEdicao((v) => ({
                        ...v,
                        descricao: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className="perfil-form__row">
                  <label htmlFor="f-preco">Preço (R$)</label>
                  <input
                    id="f-preco"
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    placeholder="0,00"
                    value={formEdicao.preco}
                    onChange={(e) =>
                      setFormEdicao((v) => ({ ...v, preco: e.target.value }))
                    }
                  />
                </div>

                {/* Campos de CS:GO */}
                {selectedGameName === 'CS:GO' && (
                  <fieldset className="perfil-form__fieldset">
                    <legend>Detalhes (CS:GO)</legend>

                    <div className="perfil-form__grid-2">
                      <div className="perfil-form__row">
                        <label htmlFor="f-csgo-float">Desgaste (Float)</label>
                        <input
                          id="f-csgo-float"
                          type="number"
                          step="0.0001"
                          placeholder="Ex: 0.0712"
                          min="0"
                          max="1"
                          value={formEdicao.detalhesCsgo.desgasteFloat}
                          onChange={(e) =>
                            setFormEdicao((prev) => ({
                              ...prev,
                              detalhesCsgo: {
                                ...prev.detalhesCsgo,
                                desgasteFloat: e.target.value,
                              },
                            }))
                          }
                        />
                      </div>

                      <div className="perfil-form__row">
                        <label htmlFor="f-csgo-pattern">Pattern Index</label>
                        <input
                          id="f-csgo-pattern"
                          type="number"
                          step="1"
                          placeholder="Ex: 456"
                          min="0"
                          max="999"
                          value={formEdicao.detalhesCsgo.patternIndex}
                          onChange={(e) =>
                            setFormEdicao((prev) => ({
                              ...prev,
                              detalhesCsgo: {
                                ...prev.detalhesCsgo,
                                patternIndex: e.target.value,
                              },
                            }))
                          }
                        />
                      </div>
                    </div>

                    <div className="perfil-form__row">
                      <label htmlFor="f-csgo-exterior">Exterior</label>
                      <select
                        id="f-csgo-exterior"
                        value={formEdicao.detalhesCsgo.exterior}
                        onChange={(e) =>
                          setFormEdicao((prev) => ({
                            ...prev,
                            detalhesCsgo: {
                              ...prev.detalhesCsgo,
                              exterior: e.target.value,
                            },
                          }))
                        }
                      >
                        <option value="Factory New">Factory New</option>
                        <option value="Minimal Wear">Minimal Wear</option>
                        <option value="Field-Tested">Field-Tested</option>
                        <option value="Well-Worn">Well-Worn</option>
                        <option value="Battle-Scarred">Battle-Scarred</option>
                      </select>
                    </div>

                    <label className="check" style={{ marginTop: 12 }}>
                      <input
                        type="checkbox"
                        checked={formEdicao.detalhesCsgo.statTrak}
                        onChange={(e) =>
                          setFormEdicao((prev) => ({
                            ...prev,
                            detalhesCsgo: {
                              ...prev.detalhesCsgo,
                              statTrak: e.target.checked,
                            },
                          }))
                        }
                      />
                      <span>StatTrak™</span>
                    </label>
                  </fieldset>
                )}

                {/* Campos de CS2 */}
                {selectedGameName === 'CS2' && (
                  <fieldset className="perfil-form__fieldset">
                    <legend>Detalhes (CS2)</legend>

                    <div className="perfil-form__grid-2">
                      <div className="perfil-form__row">
                        <label htmlFor="f-cs2-float">Desgaste (Float)</label>
                        <input
                          id="f-cs2-float"
                          type="number"
                          step="0.0001"
                          placeholder="Ex: 0.0712"
                          min="0"
                          max="1"
                          value={formEdicao.detalhesCs2.desgasteFloat}
                          onChange={(e) =>
                            setFormEdicao((prev) => ({
                              ...prev,
                              detalhesCs2: {
                                ...prev.detalhesCs2,
                                desgasteFloat: e.target.value,
                              },
                            }))
                          }
                        />
                      </div>

                      <div className="perfil-form__row">
                        <label htmlFor="f-cs2-pattern">Pattern Index</label>
                        <input
                          id="f-cs2-pattern"
                          type="number"
                          step="1"
                          placeholder="Ex: 456"
                          min="0"
                          max="999"
                          value={formEdicao.detalhesCs2.patternIndex}
                          onChange={(e) =>
                            setFormEdicao((prev) => ({
                              ...prev,
                              detalhesCs2: {
                                ...prev.detalhesCs2,
                                patternIndex: e.target.value,
                              },
                            }))
                          }
                        />
                      </div>
                    </div>

                    <div className="perfil-form__row">
                      <label htmlFor="f-cs2-exterior">Exterior</label>
                      <select
                        id="f-cs2-exterior"
                        value={formEdicao.detalhesCs2.exterior}
                        onChange={(e) =>
                          setFormEdicao((prev) => ({
                            ...prev,
                            detalhesCs2: {
                              ...prev.detalhesCs2,
                              exterior: e.target.value,
                            },
                          }))
                        }
                      >
                        <option value="Factory New">Factory New</option>
                        <option value="Minimal Wear">Minimal Wear</option>
                        <option value="Field-Tested">Field-Tested</option>
                        <option value="Well-Worn">Well-Worn</option>
                        <option value="Battle-Scarred">Battle-Scarred</option>
                      </select>
                    </div>

                    <label className="check" style={{ marginTop: 12 }}>
                      <input
                        type="checkbox"
                        checked={formEdicao.detalhesCs2.statTrak}
                        onChange={(e) =>
                          setFormEdicao((prev) => ({
                            ...prev,
                            detalhesCs2: {
                              ...prev.detalhesCs2,
                              statTrak: e.target.checked,
                            },
                          }))
                        }
                      />
                      <span>StatTrak™</span>
                    </label>
                  </fieldset>
                )}

                {/* Campos de LoL */}
                {selectedGameName === 'League of Legends' && (
                  <fieldset className="perfil-form__fieldset">
                    <legend>Detalhes (LoL)</legend>

                    <div className="perfil-form__row">
                      <label htmlFor="f-lol-champion">Campeão</label>
                      <input
                        id="f-lol-champion"
                        type="text"
                        placeholder="Ex: Jinx"
                        value={formEdicao.detalhesLol.championName}
                        onChange={(e) =>
                          setFormEdicao((prev) => ({
                            ...prev,
                            detalhesLol: {
                              ...prev.detalhesLol,
                              championName: e.target.value,
                            },
                          }))
                        }
                      />
                    </div>

                    <div className="perfil-form__row">
                      <label htmlFor="f-lol-tipo">Tipo/Raridade</label>
                      <input
                        id="f-lol-tipo"
                        type="text"
                        placeholder="Ex: Lendária, Mítica, Prestígio"
                        value={formEdicao.detalhesLol.tipoSkin}
                        onChange={(e) =>
                          setFormEdicao((prev) => ({
                            ...prev,
                            detalhesLol: {
                              ...prev.detalhesLol,
                              tipoSkin: e.target.value,
                            },
                          }))
                        }
                      />
                    </div>

                    <div className="perfil-form__row">
                      <label htmlFor="f-lol-chroma">Chroma</label>
                      <input
                        id="f-lol-chroma"
                        type="text"
                        placeholder="Ex: Esmeralda (Opcional)"
                        value={formEdicao.detalhesLol.chroma}
                        onChange={(e) =>
                          setFormEdicao((prev) => ({
                            ...prev,
                            detalhesLol: {
                              ...prev.detalhesLol,
                              chroma: e.target.value,
                            },
                          }))
                        }
                      />
                    </div>
                  </fieldset>
                )}

                <div className="perfil-form__row">
                  <label htmlFor="f-imagem">URL da imagem (opcional)</label>
                  <input
                    id="f-imagem"
                    type="text"
                    placeholder="https://exemplo.com/imagem.png ou cole uma dataURL (data:image/png;base64,...)"
                    value={formEdicao.imagemUrl}
                    onChange={(e) => {
                      setImagemFile(null);
                      setFormEdicao((v) => ({
                        ...v,
                        imagemUrl: e.target.value,
                      }));
                    }}
                  />
                  <small className="perfil-form__hint">
                    Dica: cole uma URL <strong>ou</strong> clique na imagem
                    acima para enviar um arquivo. Também aceitamos uma{' '}
                    <strong>dataURL</strong>.
                  </small>
                </div>

                <div className="perfil-modal__actions">
                  <button
                    type="button"
                    className="btn btn--ghost"
                    onClick={fecharEditar}
                    disabled={salvandoEdicao}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="btn btn--primary"
                    disabled={salvandoEdicao}
                  >
                    {salvandoEdicao
                      ? 'Salvando...'
                      : skinEditando?.id || skinEditando?._id
                      ? 'Salvar alterações'
                      : 'Criar skin'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: DESATIVAR (CONFIRMAÇÃO DUPLA) */}
      {modalDesativarAberto && (
        <div className="perfil-modal" role="dialog" aria-modal="true">
          <div className="perfil-modal__backdrop" onClick={fecharDesativar} />
          <div className="perfil-modal__card">
            <div className="perfil-modal__head">
              <h3>Desativar skin</h3>
              <button
                className="perfil-modal__close"
                onClick={fecharDesativar}
                aria-label="Fechar"
              >
                ×
              </button>
            </div>

            {passoDesativar === 1 ? (
              <>
                <p className="perfil-modal__desc">
                  Você está prestes a desativar a skin{' '}
                  <strong>{skinDesativando?.skinNome}</strong>.
                </p>
                <ul className="perfil-alerta">
                  <li>A skin deixará de aparecer para outros usuários.</li>
                  <li>Você poderá reativá-la depois.</li>
                </ul>

                <div className="perfil-modal__actions perfil-modal__actions--inline">
                  <button className="btn btn--ghost" onClick={fecharDesativar}>
                    Cancelar
                  </button>
                  <button
                    className="btn btn--primary"
                    onClick={() => setPassoDesativar(2)}
                  >
                    Continuar
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="perfil-modal__desc">
                  Para confirmar, digite <strong>Confirmo</strong>{' '}
                  (maiúsculas/minúsculas não importam) e marque a caixa.
                </p>

                <div className="perfil-form__row">
                  <label htmlFor="f-confirma-texto">Digite “Confirmo”</label>
                  <input
                    id="f-confirma-texto"
                    type="text"
                    placeholder="Confirmo"
                    value={confirmTexto}
                    onChange={(e) => setConfirmTexto(e.target.value)}
                  />
                </div>

                <label className="perfil-check">
                  <input
                    type="checkbox"
                    checked={confirmCheck}
                    onChange={(e) => setConfirmCheck(e.target.checked)}
                  />
                  <span>
                    Entendo que esta ação desativará a skin e concordo em
                    prosseguir.
                  </span>
                </label>

                <div className="perfil-modal__actions perfil-modal__actions--inline">
                  <button
                    className="btn btn--ghost"
                    onClick={fecharDesativar}
                    disabled={desativando}
                  >
                    Cancelar
                  </button>
                  <button
                    className="btn btn--primary"
                    onClick={confirmarDesativacaoFinal}
                    disabled={
                      desativando ||
                      String(confirmTexto).trim().toLowerCase() !==
                        'confirmo' ||
                      !confirmCheck
                    }
                    title='Digite "Confirmo" e marque a confirmação'
                  >
                    {desativando ? 'Desativando...' : 'Desativar'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* CHECKOUT MOCKADO */}
      <CheckoutModal
        open={checkoutAberto}
        onClose={() => {
          setCheckoutAberto(false);
          setCheckoutAcao(null);
        }}
        plano={checkoutPlano || planoKey}
        variante={checkoutVariante}
        onConfirmar={handleCheckoutConfirmar}
      />
    </div>
  );
}
