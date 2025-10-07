// src/pages/usuario/PerfilUsuario.jsx
// ============================================================================
// Perfil do usuário (mock até a API ficar pronta)
// - Dados da conta
// - Plano/cota
// - Minhas Skins: puxa do mock via service
// - Modal de Renovar/Upgrade (mock)
// - Editar Skin: preview clicável + upload de arquivo OU URL
// - Desativar Skin: confirmação dupla com a palavra "Confirmo" (case-insensitive)
// - Reativar Skin: abre editor e só ativa após salvar, respeitando limite
// ============================================================================

import { useEffect, useMemo, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
import AuthBrand from '../../components/logo/AuthBrand';

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

export default function PerfilUsuario() {
  const { user, logout, setUser } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [perfil, setPerfil] = useState(null);
  const [skins, setSkins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  // Modal de plano
  const [painel, setPainel] = useState(null); // "renovar" | "upgrade" | null
  const [busy, setBusy] = useState(false);

  // -------------------- Estado do modal de edição --------------------
  const [modalEdicaoAberto, setModalEdicaoAberto] = useState(false);
  const [skinEditando, setSkinEditando] = useState(null);
  const [formEdicao, setFormEdicao] = useState({
    skinNome: '',
    preco: '',
    imagemUrl: '',
  });
  const [imagemFile, setImagemFile] = useState(null); // arquivo selecionado
  const [previewImagem, setPreviewImagem] = useState(''); // preview (arquivo ou URL)
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
        // 1) Perfil (se falhar, aí sim mostra erro)
        const p = await getMyProfile();
        if (!cancel) setPerfil(p);

        // 2) Skins: NUNCA derruba a página
        try {
          const s = await getMinhasSkins();
          if (!cancel) setSkins(Array.isArray(s) ? s : s?.content || []);
        } catch {
          if (!cancel) setSkins([]); // só mostra vazio
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

  // Plano e cota
  const planoKey = String(
    perfil?.plano || perfil?.plan || user?.plano || 'gratuito',
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

    // abre o mesmo modal de edição, porém em modo "novo"
    setSkinEditando({ __novo: true });
    setFormEdicao({ skinNome: '', preco: '', imagemUrl: '' });
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

  // --------------------------- Plano (mock) -------------------------------
  async function onConfirmarRenovar() {
    setBusy(true);
    try {
      addToast('Plano renovado com sucesso! (mock)', 'success');
      setPainel(null);
    } finally {
      setBusy(false);
    }
  }
  async function onEscolherPlano(planoNovo, label) {
    setBusy(true);
    try {
      // Atualiza visualmente o plano no estado/contexto
      setPerfil((prev) => ({ ...prev, plano: planoNovo }));
      if (typeof setUser === 'function')
        setUser((prev) => ({ ...prev, plano: planoNovo }));
      addToast(`Upgrade para ${label} realizado! (mock)`, 'success');
      setPainel(null);
    } finally {
      setBusy(false);
    }
  }

  // ========================== EDITAR / CRIAR SKIN ============================
  // Abre modal com dados atuais
  function abrirEditar(skin) {
    setSkinEditando(skin);
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

  // Fecha modal de edição
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
  function onEscolherArquivo(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImagemFile(file);
    setFormEdicao((v) => ({ ...v, imagemUrl: '' })); // evita validação de URL
    const reader = new FileReader();
    reader.onload = () => setPreviewImagem(String(reader.result || ''));
    reader.readAsDataURL(file);
  }

  // Salva (cria ou edita)
  async function salvarEdicao() {
    setSalvandoEdicao(true);
    try {
      // Validação
      const nomeOk = String(formEdicao.skinNome || '').trim().length > 0;
      const precoNum = Number(String(formEdicao.preco).replace(',', '.'));
      if (!nomeOk || !Number.isFinite(precoNum) || precoNum < 0) {
        addToast('Preencha nome e preço válidos.', 'error');
        setSalvandoEdicao(false);
        return;
      }

      const id = skinEditando?.id || skinEditando?._id;
      const payload = {
        // campos de AnuncioRequest:
        titulo: formEdicao.skinNome,
        descricao: '', // opcional
        preco: precoNum,

        // campos que seu service de anúncio usa para popular a skin no anúncio:
        skinName: formEdicao.skinNome,
        skinImageUrl: formEdicao.imagemUrl,
        ...(imagemFile ? { imagemFile } : {}),

        // se quiser guardar qualidade/desgaste, pode ligar estes também:
        // qualidade: formEdicao.qualidade,
        // desgasteFloat: formEdicao.desgasteFloat,
      };

      if (id) {
        // ------- EDITAR -------
        const atualizado = await editarSkin(id, payload);

        // Se estava reativando via editor
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

        notifySkinsChanged(); // << notifica vitrine
      } else {
        // ------- CRIAR -------
        const nova = await criarSkin(payload);
        setSkins((lista) => [nova, ...lista]); // topo
        addToast('Skin criada!', 'success');

        notifySkinsChanged(); // << notifica vitrine
      }

      fecharEditar();
    } catch (e) {
      addToast(e?.message || 'Falha ao salvar a skin.', 'error');
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

    // Confirmação: precisa digitar "Confirmo" (maiúsc./minúsc. indiferente) + checkbox
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

      notifySkinsChanged(); // << notifica vitrine
      fecharDesativar();
    } catch (e) {
      addToast(e?.message || 'Falha ao desativar a skin.', 'error');
    } finally {
      setDesativando(false);
    }
  }

  // Reativar: abre o editor e só ativa após salvar
  async function handleReativar(skin) {
    const id = skin?.id || skin?._id;
    if (!id) return;

    // Respeitar cota do plano (não permite passar do limite)
    if (Number.isFinite(limitePlano) && usados >= limitePlano) {
      addToast(
        'Você atingiu o limite do plano. Faça upgrade para reativar.',
        'error',
      );
      return;
    }

    // Marca o flag e abre o mesmo modal de edição
    setReativarDepoisDeSalvar(true);
    setSkinEditando({ ...skin }); // ainda inativa no storage; ativará após salvar
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

        {/* Minhas skins (puxadas do mock) */}
        <section className="perfil-block">
          <div className="perfil-block-header">
            <h2>Minhas Skins</h2>
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
              {skins.map((s) => (
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
                        {/* Quando inativa: mostra "Reativar" */}
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

      {/* Modal: Renovar / Upgrade (mock) */}
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
                <div className="perfil-modal__actions">
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
                <div className="perfil-modal__actions">
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

            {/* Uploader clicável + preview (arquivo OU URL) */}
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

            {/* noValidate: desliga validação nativa (evita bloqueio do submit) */}
            <form
              className="perfil-form"
              noValidate
              onSubmit={(e) => {
                e.preventDefault();
                salvarEdicao();
              }}
            >
              <div className="perfil-form__row">
                <label htmlFor="f-nome">Nome</label>
                <input
                  id="f-nome"
                  type="text"
                  required
                  placeholder="Nome da skin"
                  value={formEdicao.skinNome}
                  onChange={(e) =>
                    setFormEdicao((v) => ({ ...v, skinNome: e.target.value }))
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

              <div className="perfil-form__row">
                <label htmlFor="f-imagem">URL da imagem (opcional)</label>
                <input
                  id="f-imagem"
                  type="text" // aceita qualquer string; se for URL válida, o service usa
                  placeholder="https://exemplo.com/imagem.png"
                  value={formEdicao.imagemUrl}
                  onChange={(e) => {
                    setImagemFile(null); // se digitar URL, prioriza URL
                    setFormEdicao((v) => ({ ...v, imagemUrl: e.target.value }));
                  }}
                />
                <small className="perfil-form__hint">
                  Dica: cole uma URL <strong>ou</strong> clique na imagem acima
                  para enviar um arquivo.
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
      )}

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

                <div className="perfil-modal__actions">
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

                <div className="perfil-modal__actions">
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
