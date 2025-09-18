// src/pages/usuario/PerfilUsuario.jsx
// ============================================================================
// Tela de Perfil do usuário
// - Dados básicos, plano/cota, listagem de skins e CTA de cadastro
// - Em MODO MOCK, consome users/skins dos serviços que já mockam os dados
// - Correção de imagens (mapeamento + fallback + onError)
// - Hover nas bordas dos campos "Dados da conta"
// - Painel/Modal leve para "Renovar" e "Fazer upgrade" na frente da tela
// - Integração com services de plano (mock/real) + atualização de estado
// - [NOVO] Fallback 2 usando as IMAGENS do MockSkins antes do placeholder
// ============================================================================

import { useEffect, useMemo, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./PerfilUsuario.css";
import { useAuth } from "../../services/AuthContext";
import { getMyProfile } from "../../services/users";
import { getMinhasSkins, getPlanoLimit /*, criarSkin*/ } from "../../services/skins";
import { renovarPlano, upgradePlano } from "../../services/planos";
import AuthBrand from "../../components/logo/AuthBrand";

// ✅ usamos as mesmas imagens da vitrine para o fallback:
import MockSkins from "../../components/mock/MockSkins.js";

// ---------- Helpers ----------
const fmtBRL = (n) =>
  Number.isFinite(Number(n))
    ? Number(n).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : "—";

// Paleta dos planos (mesma vibe da vitrine)
const plansMeta = {
  gratuito:      { label: "Gratuito",      color: "#454B54" },
  intermediario: { label: "Intermediário", color: "#00C896" },
  plus:          { label: "+ Plus",        color: "#39FF14" },
};

// Placeholder final (fallback 3)
const IMG_PLACEHOLDER = "https://placehold.co/600x400?text=Skin";

/** Hash simples e estável para indexar um mock a partir de uma chave (id/nome). */
function hashKeyToIndex(key, mod) {
  const s = String(key ?? "");
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) | 0; // int32
  }
  // força positivo e aplica módulo do tamanho da lista de mocks
  return Math.abs(h) % Math.max(1, mod);
}

/** Pega uma imagem do MockSkins com base em uma chave estável. */
function getMockImageByKey(stableKey) {
  if (!Array.isArray(MockSkins) || MockSkins.length === 0) return null;
  const idx = hashKeyToIndex(stableKey ?? "fallback", MockSkins.length);
  return MockSkins[idx]?.imagemUrl || null;
}

/** Normalizador de imagem (fallback 1): usa campos comuns do backend */
function urlDaSkin(s) {
  return (
    s?.imagemUrl ||
    s?.image ||
    s?.imagem ||
    s?.urlImagem ||
    s?.fotoUrl ||
    s?.url ||
    null
  );
}

/** Fallback 2 (MockSkins) com base em id/nome para ficar estável */
function mockUrlDaSkin(s) {
  const stableKey = s?.id || s?._id || s?.skinNome || s?.title || s?.nome || "fallback";
  return getMockImageByKey(stableKey);
}

export default function PerfilUsuario() {
  // Alguns AuthContext expõem setUser; se existir, usamos para refletir o plano na topbar.
  const { user, logout, setUser } = useAuth();
  const navigate = useNavigate();

  const [perfil, setPerfil] = useState(null);
  const [skins, setSkins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // Estados do painel/modal
  const [painel, setPainel] = useState(null); // "renovar" | "upgrade" | null
  const [busy, setBusy] = useState(false);    // loading dos botões confirmar
  const dialogRef = useRef(null);

  // Carrega perfil + skins
  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        setLoading(true);
        setErr("");

        const p = await getMyProfile();
        if (!cancel) setPerfil(p);

        const s = await getMinhasSkins();
        if (!cancel) setSkins(Array.isArray(s) ? s : (s?.content || []));
      } catch (e) {
        if (!cancel) setErr(e?.message || "Não foi possível carregar seu perfil.");
      } finally {
        if (!cancel) setLoading(false);
      }
    })();
    return () => { cancel = true; };
  }, []);

  // Plano a partir do perfil, com fallback do contexto
  const planoKey = String(perfil?.plano || perfil?.plan || user?.plano || "gratuito").toLowerCase();
  const planoInfo = plansMeta[planoKey] || plansMeta.gratuito;

  const limitePlano = getPlanoLimit(planoKey);
  const usados = skins.length;
  const restantes = Number.isFinite(limitePlano) ? Math.max(0, limitePlano - usados) : "∞";
  const atingiuLimite = Number.isFinite(limitePlano) && usados >= limitePlano;

  const progress = useMemo(() => {
    if (!Number.isFinite(limitePlano)) return 100;
    if (limitePlano <= 0) return 0;
    return Math.min(100, Math.round((usados / limitePlano) * 100));
  }, [usados, limitePlano]);

  function handleNovaSkin() {
    if (atingiuLimite) return;
    navigate("/anunciar"); // ajuste para sua rota de cadastro
    // (Opcional: criar direto via criarSkin e recarregar lista)
  }

  function abrirRenovar() { setPainel("renovar"); }
  function abrirUpgrade() { setPainel("upgrade"); }
  function fecharPainel() {
    if (busy) return;
    setPainel(null);
  }

  async function handleLogout() {
    try {
      await logout();
      navigate("/");
    } catch (e) {
      console.error("Falha ao sair:", e);
    }
  }

  // ---------- Ações dos botões (chamando os services) ----------
  async function onConfirmarRenovar() {
    setBusy(true);
    try {
      const atualizado = await renovarPlano(planoKey);
      setPerfil((prev) => ({ ...prev, ...atualizado }));
      if (typeof setUser === "function") setUser((prev) => ({ ...prev, ...atualizado }));
      alert("Plano renovado com sucesso!");
      setPainel(null);
    } catch (e) {
      console.error(e);
      alert("Falha ao renovar o plano.");
    } finally {
      setBusy(false);
    }
  }

  async function onEscolherPlano(planoNovo, label) {
    setBusy(true);
    try {
      const atualizado = await upgradePlano(planoNovo);
      setPerfil((prev) => ({ ...prev, ...atualizado }));
      if (typeof setUser === "function") setUser((prev) => ({ ...prev, ...atualizado }));
      alert(`Upgrade para ${label} realizado com sucesso!`);
      setPainel(null);
    } catch (e) {
      console.error(e);
      alert("Falha ao realizar upgrade de plano.");
    } finally {
      setBusy(false);
    }
  }

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
          <p style={{ color: "#f66" }}>{err}</p>
          <button className="btn btn--ghost" onClick={() => window.location.reload()}>Tentar novamente</button>
        </div>
      </div>
    );
  }

  return (
    <div className="perfil-root">
      {/* Topbar simples */}
      <div className="perfil-topbar">
        <AuthBrand />
        <div className="perfil-actions">
          <Link to="/" className="btn btn--ghost sm">Vitrine</Link>
          <button className="btn btn--ghost sm" onClick={handleLogout}>Sair</button>
        </div>
      </div>

      <header className="perfil-hero">
        <div className="perfil-hero__copy">
          <h1>Meu Perfil</h1>
        <p>Gerencie seus dados, seu plano e seus anúncios/skins.</p>
        </div>
      </header>

      <div className="perfil-container">
        {/* Dados básicos + Plano */}
        <section className="perfil-block">
          <h2>Dados da conta</h2>
          <div className="perfil-grid perfil-grid--2">
            <div className="perfil-card">
              {/* Cada campo tem hover na borda (ver CSS) */}
              <div className="perfil-field">
                <label>Nome</label>
                <div className="perfil-value" tabIndex={0}>
                  {perfil?.nome || perfil?.name || user?.nome || "—"}
                </div>
              </div>
              <div className="perfil-field">
                <label>E-mail</label>
                <div className="perfil-value" tabIndex={0}>
                  {perfil?.email || user?.email || "—"}
                </div>
              </div>
              <div className="perfil-field">
                <label>Desde</label>
                <div className="perfil-value" tabIndex={0}>
                  {perfil?.criadoEm
                    ? new Date(perfil.criadoEm).toLocaleDateString("pt-BR")
                    : perfil?.createdAt
                    ? new Date(perfil.createdAt).toLocaleDateString("pt-BR")
                    : "—"}
                </div>
              </div>
            </div>

            <div className="perfil-card">
              <div className="perfil-plano-header">
                <span className="perfil-plano-badge" style={{ background: plansMeta[planoKey]?.color }}>
                  {plansMeta[planoKey]?.label}
                </span>
                <div className="perfil-plano-title">Plano atual</div>
              </div>

              <div className="perfil-cota">
                <div className="perfil-cota-row">
                  <span>Limite de anúncios</span>
                  <strong>
                    {Number.isFinite(limitePlano) ? `${usados}/${limitePlano}` : `${usados}/∞`}
                  </strong>
                </div>
                <div className="perfil-progress">
                  <div className="perfil-progress__bar" style={{ width: `${progress}%` }} />
                </div>
                <div className="perfil-cota-hint">
                  {atingiuLimite
                    ? "Você atingiu o limite do seu plano."
                    : `Você ainda pode cadastrar ${Number.isFinite(restantes) ? restantes : "∞"} skins.`}
                </div>
              </div>

              <div className="perfil-plano-actions">
                <button className="btn btn--ghost" onClick={abrirRenovar}>Renovar</button>
                <button className="btn btn--primary" onClick={abrirUpgrade}>Fazer upgrade</button>
              </div>
            </div>
          </div>
        </section>

        {/* Minhas skins */}
        <section className="perfil-block">
          <div className="perfil-block-header">
            <h2>Minhas Skins</h2>
            <button
              className="btn btn--primary"
              onClick={handleNovaSkin}
              disabled={atingiuLimite}
              title={atingiuLimite ? "Limite atingido para seu plano" : "Cadastrar nova skin"}
            >
              Cadastrar nova skin
            </button>
          </div>

          {skins.length === 0 ? (
            <div className="perfil-empty">
              <p>Você ainda não cadastrou nenhuma skin.</p>
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
              {skins.map((s) => {
                // URL principal (backend ou storage dev)
                const primarySrc = urlDaSkin(s);
                // URL de fallback 2 (MockSkins) — estável por id/nome
                const mockSrc = mockUrlDaSkin(s) || IMG_PLACEHOLDER;
                // Usamos a principal se existir; senão já caímos no mock
                const initialSrc = primarySrc || mockSrc;

                return (
                  <article key={s.id || s._id} className="card">
                    <div className="card__media">
                      <img
                        src={initialSrc}
                        alt={s.skinNome || s.title || s.nome || "Skin"}
                        loading="lazy"
                        // onError: se falhar a principal, tenta UMA vez a mock; depois placeholder
                        onError={(e) => {
                          const el = e.currentTarget;
                          const alreadyTriedMock = el.dataset.triedMock === "1";

                          if (!alreadyTriedMock) {
                            el.dataset.triedMock = "1";
                            const newMock = mockSrc || IMG_PLACEHOLDER;
                            if (el.src !== newMock) {
                              el.src = newMock;
                              return;
                            }
                          }

                          // Último recurso: placeholder
                          if (el.src !== IMG_PLACEHOLDER) {
                            el.src = IMG_PLACEHOLDER;
                          }
                        }}
                      />
                      <span className="badge" style={{ background: plansMeta[planoKey]?.color }}>
                        {plansMeta[planoKey]?.label}
                      </span>
                    </div>
                    <div className="card__body">
                      <h3>{s.skinNome || s.title || s.nome || "Skin"}</h3>
                      <div className="meta">
                        <span className="price">R$ {fmtBRL(s.preco ?? s.price)}</span>
                      </div>
                      <div className="seller">
                        <span>ID: {s.id || s._id || "—"}</span>
                        <div className="cta">
                          <button className="btn btn--ghost">Editar</button>
                          <button className="btn btn--ghost">Desativar</button>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {/* ---------- Painel/Modal para Renovar / Upgrade ---------- */}
      {painel && (
        <div className="perfil-modal" role="dialog" aria-modal="true" ref={dialogRef}>
          <div className="perfil-modal__backdrop" onClick={fecharPainel} />
          <div className="perfil-modal__card">
            <div className="perfil-modal__head">
              <h3>
                {painel === "renovar" ? "Renovar plano" : "Fazer upgrade de plano"}
              </h3>
              <button className="perfil-modal__close" onClick={fecharPainel} aria-label="Fechar">×</button>
            </div>

            {painel === "renovar" ? (
              <>
                <p className="perfil-modal__desc">
                  Você está no plano <strong style={{ color: plansMeta[planoKey]?.color }}>{plansMeta[planoKey]?.label}</strong>.
                  Revise as informações e confirme a renovação.
                </p>

                <div className="perfil-modal__grid">
                  <div className="perfil-modal__item">
                    <span className="k">Plano atual</span>
                    <span className="v">{plansMeta[planoKey]?.label}</span>
                  </div>
                  <div className="perfil-modal__item">
                    <span className="k">Limite de anúncios</span>
                    <span className="v">
                      {Number.isFinite(limitePlano) ? `${limitePlano}` : `∞`}
                    </span>
                  </div>
                  <div className="perfil-modal__item">
                    <span className="k">Situação</span>
                    <span className="v">{atingiuLimite ? "No limite" : "Dentro do limite"}</span>
                  </div>
                </div>

                <div className="perfil-modal__actions">
                  <button className="btn btn--ghost" onClick={fecharPainel} disabled={busy}>Cancelar</button>
                  <button className="btn btn--primary" onClick={onConfirmarRenovar} disabled={busy}>
                    {busy ? "Confirmando..." : "Confirmar renovação"}
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="perfil-modal__desc">
                  Escolha um plano para fazer upgrade e aumentar sua visibilidade e limites.
                </p>

                <div className="perfil-upgrade-grid">
                  {[
                    { key: "gratuito",       label: "Gratuito",       lim: getPlanoLimit("gratuito"),       cor: plansMeta.gratuito.color },
                    { key: "intermediario",  label: "Intermediário",  lim: getPlanoLimit("intermediario"),  cor: plansMeta.intermediario.color },
                    { key: "plus",           label: "Plus",           lim: getPlanoLimit("plus"),           cor: plansMeta.plus.color },
                  ].map((pl) => (
                    <div key={pl.key} className="perfil-upgrade-card">
                      <div className="perfil-upgrade-badge" style={{ background: pl.cor }}>
                        {pl.label}
                      </div>
                      <ul className="perfil-upgrade-list">
                        <li>Limite de anúncios: <strong>{Number.isFinite(pl.lim) ? pl.lim : "∞"}</strong></li>
                        <li>Badge de destaque</li>
                        {pl.key !== "gratuito" && <li>Relatórios de visualização</li>}
                        {pl.key === "plus" && <li>Spotlight na página inicial</li>}
                      </ul>
                      <button
                        className="btn btn--primary btn--full"
                        disabled={pl.key === planoKey || busy}
                        title={pl.key === planoKey ? "Plano atual" : "Migrar para este plano"}
                        onClick={() => onEscolherPlano(pl.key, pl.label)}
                      >
                        {pl.key === planoKey ? "Seu plano atual" : (busy ? "Processando..." : `Escolher ${pl.label}`)}
                      </button>
                    </div>
                  ))}
                </div>

                <div className="perfil-modal__actions">
                  <button className="btn btn--ghost" onClick={fecharPainel} disabled={busy}>Fechar</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
