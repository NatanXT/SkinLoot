// src/pages/usuario/PerfilUsuario.jsx
// ============================================================================
// Perfil do usuário (mock até a API ficar pronta)
// - Dados da conta
// - Plano/cota
// - Minhas Skins: puxa do mock via service
// - Modal de Renovar/Upgrade
// - Editar Skin: preview clicável + upload de arquivo OU URL/dataURL
// - Desativar Skin: confirmação dupla com a palavra "Confirmo"
// - Reativar Skin: abre editor e só ativa após salvar, respeitando limite
// ============================================================================

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
//import Uploader from '../../components/uploader/Uploader';

// ---------- Helpers ----------
const fmtBRL = (n) =>
  Number.isFinite(Number(n))
    ? Number(n).toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    : '—';

const plansMeta = {
  gratuito: { label: 'Gratuito', color: '#454B54' },
  intermediario: { label: 'Intermediário', color: '#00C896' },
  plus: { label: '+ Plus', color: '#39FF14' },
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

const DEFAULT_CSGO_DETAILS = {
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
  descricao: '',
  detalhesCsgo: DEFAULT_CSGO_DETAILS,
  detalhesLol: DEFAULT_LOL_DETAILS,
};

export default function PerfilUsuario() {
  const { user, logout, setUser } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation(); // ✅ usado para abrir modal vinda da vitrine

  const [perfil, setPerfil] = useState(null);
  const [skins, setSkins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  // Modal de plano
  const [painel, setPainel] = useState(null); // "renovar" | "upgrade" | null
  const [busy, setBusy] = useState(false);

  const [filtroStatus, setFiltroStatus] = useState('todas');
  const skinsFiltradas = useMemo(() => {
    if (filtroStatus === 'ativas')
      return skins.filter((s) => s.ativo !== false);
    if (filtroStatus === 'inativas')
      return skins.filter((s) => s.ativo === false);
    return skins;
  }, [skins, filtroStatus]);

  // -------------------- Estado do modal de edição --------------------
  const [modalEdicaoAberto, setModalEdicaoAberto] = useState(false);
  const [skinEditando, setSkinEditando] = useState(null);
  const [formEdicao, setFormEdicao] = useState(DEFAULT_FORM_EDICAO);
  const [imagemFile, setImagemFile] = useState(null); // arquivo selecionado
  const [previewImagem, setPreviewImagem] = useState(''); // preview (arquivo ou URL/dataURL)
  const [salvandoEdicao, setSalvandoEdicao] = useState(false);
  const inputFileRef = useRef(null);

  // flag: reativar após salvar (fluxo de reativação abre editor primeiro)
  const [reativarDepoisDeSalvar, setReativarDepoisDeSalvar] = useState(false);

  // --------------- Estado do modal de desativação (2 passos) --------
  const [modalDesativarAberto, setModalDesativarAberto] = useState(false);
  const [skinDesativando, setSkinDesativando] = useState(null);
  const [passoDesativar, setPassoDesativar] = useState(1); // 1 ou 2
  const [confirmTexto, setConfirmTexto] = useState(''); // palavra "Confirmo"
  const [confirmCheck, setConfirmCheck] = useState(false);
  const [desativando, setDesativando] = useState(false);

  const [jogosList, setJogosList] = useState([]);
  const [selectedJogoId, setSelectedJogoId] = useState('');
  const selectedGameName = useMemo(() => {
    return jogosList.find((j) => j.id === selectedJogoId)?.nome || null;
  }, [jogosList, selectedJogoId]);

  // 🔔 dispara para a vitrine recarregar quando suas skins mudarem
  function notifySkinsChanged() {
    window.dispatchEvent(new CustomEvent('skins:changed'));
  }

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
          if (!cancel) setSkins(Array.isArray(s) ? s : s?.content || []);
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

  useEffect(() => {
    // Agora busca os jogos reais do backend
    const fetchJogos = async () => {
      try {
        const jogos = await listarJogos(); // <-- Chama a API real
        setJogosList(jogos); // <-- Salva a lista no estado
      } catch (error) {
        console.error("Falha ao carregar lista de jogos:", error);
        addToast("Não foi possível carregar os jogos.", "error");
        setJogosList([]); // Define como vazio em caso de erro
      }
    };

    fetchJogos();
  }, [addToast]);

  // ✅ abre a modal de upgrade automaticamente se veio da vitrine
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
    setSkinEditando({ __novo: true });

    // Reseta o formulário para o estado padrão
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

  async function handleLogout() {
    try {
      await logout();
      navigate('/');
    } catch (e) {
      console.error('Falha ao sair:', e);
    }
  }

  // --------------------------- Plano -------------------------------
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



  // ========================== EDITAR / CRIAR SKIN ============================
  function abrirEditar(skin) {
    setSkinEditando(skin);
    const urlAtual = skin?.imagemUrl || skin?.image || skin?.imagem || '';
    const raw = skin?._raw || {};
    const jogoId = raw.jogo?.id || '';
    setSelectedJogoId(jogoId);
    const gameName = raw.jogo?.nome || null;
    setFormEdicao({
      skinNome: skin?.skinNome || skin?.title || skin?.nome || '',
      preco: skin?.preco ?? skin?.price ?? '',
      imagemUrl: urlAtual,
      descricao: raw.descricao ?? '',

      // Preenche os detalhes corretos, ou usa o padrão
      // Se for CSGO, preenche CSGO, senão usa o padrão (limpo)
      detalhesCsgo: gameName === 'CS:GO' && raw.detalhesCsgo
          ? raw.detalhesCsgo
          : DEFAULT_CSGO_DETAILS,

      // Se for LoL, preenche LoL, senão usa o padrão (limpo)
      detalhesLol: gameName === 'League of Legends' && raw.detalhesLol
          ? raw.detalhesLol
          : DEFAULT_LOL_DETAILS,
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
    setImagemFile(file);
    setFormEdicao((v) => ({ ...v, imagemUrl: '' })); // evita validação de URL
    const dataURL = await readFileAsDataURL(file);
    setPreviewImagem(String(dataURL || ''));
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

  // Salva (cria ou edita)
  async function salvarEdicao() {
    setSalvandoEdicao(true);
    try {
      // Validação de Nome e Preço (sem alteração)
      const nomeOk = String(formEdicao.skinNome || '').trim().length > 0;
      const precoNum = Number(String(formEdicao.preco).replace(',', '.'));
      if (!nomeOk || !Number.isFinite(precoNum) || precoNum < 0) {
        addToast('Preencha nome e preço válidos.', 'error');
        setSalvandoEdicao(false);
        return;
      }

      // NOVO: Validação de Jogo
      if (!selectedJogoId) {
        addToast('Você precisa selecionar um jogo.', 'error');
        setSalvandoEdicao(false);
        return;
      }

      // REMOVIDO: Validação de JSON (não é mais um texto)
      // try { ... JSON.parse(formEdicao.detalhes) ... }

      const id = skinEditando?.id || skinEditando?._id;

      // MODIFICADO: Montagem do payload
      // Este payload agora corresponde ao que o `anuncioService` (que editamos) espera
      const payload = {
        titulo: formEdicao.skinNome, // O 'skinNome' do formulário é o 'titulo' do payload
        descricao: formEdicao.descricao,
        preco: precoNum,

        skinId: null, // (Se você tiver autocomplete de skin, esta lógica mudará)
        skinName: formEdicao.skinNome,
        status: reativarDepoisDeSalvar ? 'ATIVO' : (skinEditando?.status || 'ATIVO'),

        // --- NOVA ESTRUTURA DE DADOS ---
        jogoId: selectedJogoId,
        // Envia o objeto de detalhes correto com base no nome do jogo, o outro vai como 'null'
        detalhesCsgo: selectedGameName === 'CS:GO' ? formEdicao.detalhesCsgo : null,
        detalhesLol: selectedGameName === 'League of Legends' ? formEdicao.detalhesLol : null,
        // --- FIM DA NOVA ESTRUTURA ---

        // Campos de imagem (sem alteração)
        skinImageUrl: imagemFile ? null : formEdicao.imagemUrl,
        skinImageBase64: imagemFile?.base64 || null,
        skinImageMime: imagemFile?.mime || null,
      };

      if (id) {
        // ------- EDITAR -------
        const payloadEdit = { ...payload };
        // se não enviou imagem nova, não manda campos de imagem
        if (!imagemFile && !formEdicao.imagemUrl) {
          delete payloadEdit.skinImageUrl;
          delete payloadEdit.skinImageBase64;
          delete payloadEdit.skinImageMime;
        }

        const atualizadoRaw = await editarSkin(id, payloadEdit);
        const atualizado = withImagemUrl(atualizadoRaw);
        setSkins((p) =>
            p.map((s) => (s.id === id ? { ...s, ...atualizado } : s)),
        );
        addToast('Skin atualizada!', 'success');
      } else {
        // ------- CRIAR -------
        const novaRaw = await criarSkin(payload);
        const nova = withImagemUrl(novaRaw);
        setSkins((p) => [nova, ...p]);
        addToast('Skin cadastrada!', 'success');
        // força recálculo do perfil (se o serviço não retornar o user novo)
        (async () => {
          try {
            const p = await getMyProfile();
            setPerfil(p);
            if (typeof setUser === 'function') setUser(p);
          } catch {}
        })();
      }

      fecharEditar();
    } catch (e) {
      addToast(e?.response?.data?.message || 'Falha ao salvar a skin.', 'error');
    } finally {
      setSalvandoEdicao(false);
      setReativarDepoisDeSalvar(false);
    }
  }

  // ==================== DESATIVAR / REATIVAR ====================
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
    setFormEdicao({
      skinNome: skin?.skinNome || skin?.title || skin?.nome || '',
      preco: skin?.preco ?? skin?.price ?? '',
      imagemUrl: urlAtual,
    });
    setImagemFile(null);
    setPreviewImagem(urlAtual || '');
    setModalEdicaoAberto(true);
  }

  // ============================ RENDER =============================
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
              <select
                className="perfil-select"
                value={filtroStatus}
                onChange={(e) => setFiltroStatus(e.target.value)}
              >
                <option value="todas">Todas</option>
                <option value="ativas">Apenas ativas</option>
                <option value="inativas">Apenas inativas</option>
              </select>

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
                    onClick={onConfirmarRenovar}
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
                    },
                    {
                      key: 'intermediario',
                      label: 'Intermediário',
                      lim: getPlanoLimit('intermediario'),
                      cor: plansMeta.intermediario.color,
                    },
                    {
                      key: 'plus',
                      label: 'Plus',
                      lim: getPlanoLimit('plus'),
                      cor: plansMeta.plus.color,
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
                          Limite de anúncios:{' '}
                          <strong>
                            {Number.isFinite(pl.lim) ? pl.lim : '∞'}
                          </strong>
                        </li>
                        <li>Badge de destaque</li>
                        {pl.key !== 'gratuito' && (
                          <li>Relatórios de visualização</li>
                        )}
                        {pl.key === 'plus' && (
                          <li>Spotlight na página inicial</li>
                        )}
                      </ul>
                      <button
                        className="btn btn--primary btn--full"
                        data-plan={pl.key} // ✅ usado para focar quando veio da vitrine
                        disabled={pl.key === planoKey || busy}
                        title={
                          pl.key === planoKey
                            ? 'Plano atual'
                            : 'Migrar para este plano'
                        }
                        onClick={() => onEscolherPlano(pl.key, pl.label)}
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

      {/* ========================= MODAL: EDITAR / NOVA ========================= */}
        {/* REVERTIDO para sua estrutura de <div> original */}
        {modalEdicaoAberto && (
            <div className="perfil-modal" role="dialog" aria-modal="true">
                <div
                    className="perfil-modal__backdrop"
                    onClick={fecharEditar}
                    role="button"
                    tabIndex={-1}
                    aria-label="Fechar"
                />

                <div className="perfil-modal__janela">
                    <div className="perfil-modal__head">
                        <h3>{skinEditando?.__novo ? 'Cadastrar nova skin' : 'Editar skin'}</h3>
                        <button onClick={fecharEditar} aria-label="Fechar">✕</button>
                    </div>

                    {/* O Uploader (que já existia) */}
                    <Uploader
                        label="Imagem da skin"
                        preview={previewImagem}
                        onFileChange={setImagemFile}
                    />

                    {/* O NOVO formulário dinâmico que criamos */}
                    <form
                        className="perfil-form"
                        noValidate
                        onSubmit={(e) => { e.preventDefault(); salvarEdicao(); }}
                    >

                        {/* Seletor de Jogo */}
                        <div className="perfil-form__row">
                            <label htmlFor="f-jogo">Jogo (Obrigatório)</label>
                            <select
                                id="f-jogo"
                                value={selectedJogoId}
                                onChange={(e) => setSelectedJogoId(e.target.value)}
                                required
                                disabled={!skinEditando?.__novo}
                            >
                                <option value="" disabled>Selecione um jogo...</option>
                                {jogosList.map((jogo) => (
                                    <option key={jogo.id} value={jogo.id}>{jogo.nome}</option>
                                ))}
                            </select>
                            {!skinEditando?.__novo && (
                                <small className="perfil-form__hint">O jogo não pode ser alterado após a criação.</small>
                            )}
                        </div>

                        {/* Nome da Skin */}
                        <div className="perfil-form__row">
                            <label htmlFor="f-nome">Nome (Título)</label>
                            <input
                                id="f-nome"
                                type="text"
                                required
                                placeholder="Nome da skin (Ex: AWP | Dragon Lore)"
                                value={formEdicao.skinNome}
                                onChange={(e) => setFormEdicao((v) => ({ ...v, skinNome: e.target.value }))}
                            />
                        </div>

                        {/* Descrição */}
                        <div className="perfil-form__row">
                            <label htmlFor="f-descricao">Descrição</label>
                            <textarea
                                id="f-descricao"
                                placeholder="Descrição do anúncio, detalhes, etc."
                                rows={3}
                                value={formEdicao.descricao}
                                onChange={(e) =>
                                    setFormEdicao((v) => ({ ...v, descricao: e.target.value }))
                                }
                            />
                        </div>

                        {/* Preço */}
                        <div className="perfil-form__row">
                            <label htmlFor="f-preco">Preço (R$)</label>
                            <input
                                id="f-preco"
                                type="text"
                                inputMode="numeric"
                                required
                                placeholder="0,00"
                                value={formEdicao.preco}
                                onChange={(e) =>
                                    setFormEdicao((v) => ({ ...v, preco: e.target.value }))
                                }
                            />
                        </div>

                        {/* --- CAMPOS CONDICIONAIS --- */}

                        {/* Campos de CS:GO */}
                        {selectedGameName === 'CS:GO' && (
                            <fieldset className="perfil-form__fieldset">
                                {/* ... (campos de float, pattern, exterior, stattrak) ... */}
                            </fieldset>
                        )}

                        {/* Campos de LoL */}
                        {selectedGameName === 'League of Legends' && (
                            <fieldset className="perfil-form__fieldset">
                                {/* ... (campos de champion, tipo, chroma) ... */}
                            </fieldset>
                        )}

                        {/* URL da Imagem */}
                        <div className="perfil-form__row">
                            <label htmlFor="f-imagem">URL da imagem (opcional)</label>
                            <input
                                id="f-imagem"
                                type="text"
                                placeholder="https://exemplo.com/imagem.png"
                                value={formEdicao.imagemUrl}
                                onChange={(e) => {
                                    setImagemFile(null);
                                    setFormEdicao((v) => ({ ...v, imagemUrl: e.target.value }));
                                }}
                            />
                            <small className="perfil-form__hint">
                                Dica: cole uma URL <strong>ou</strong> clique na imagem acima
                                para enviar um arquivo.
                            </small>
                        </div>

                        {/* Botões de Ação */}
                        <div className="perfil-modal__actions">
                            <button
                                className="btn btn--ghost"
                                type="button"
                                onClick={fecharEditar}
                            >
                                Cancelar
                            </button>
                            <button
                                className="btn btn--primary"
                                type="submit"
                                disabled={salvandoEdicao}
                            >
                                {salvandoEdicao ? 'Salvando...' : (skinEditando?.__novo ? 'Cadastrar' : 'Salvar')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )}
        {/* ========================= FIM DO MODAL ========================= */}

      {/* ============== MODAL: DESATIVAR (CONFIRMAÇÃO DUPLA) ============== */}
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
    </div>
  );
}
