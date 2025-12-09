import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './PerfilPreviewModal.css';
import api from '../../services/api';
import ReputacaoVendedor from './ReputacaoVendedor.jsx';

export default function PerfilPreviewModal({
  open,
  onClose,
  usuarioId,
  nomeFallback,
  avatarFallback,
}) {
  const navigate = useNavigate();

  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');
  const [perfil, setPerfil] = useState(null);

  useEffect(() => {
    if (!open || !usuarioId) return;

    let ativo = true;

    const carregarPerfil = async () => {
      try {
        setCarregando(true);
        setErro('');
        const { data } = await api.get(`/api/usuarios/${usuarioId}/publico`);
        if (!ativo) return;
        setPerfil(data || null);
      } catch (e) {
        console.error('Falha ao carregar perfil público:', e);
        if (!ativo) return;
        setErro('Não foi possível carregar o perfil do vendedor.');
        setPerfil(null);
      } finally {
        if (ativo) setCarregando(false);
      }
    };

    carregarPerfil();

    return () => {
      ativo = false;
    };
  }, [open, usuarioId]);

  if (!open) return null;

  const nome = perfil?.nome || nomeFallback || 'Usuário';
  const avatar =
    perfil?.avatarUrl ||
    perfil?.fotoPerfilUrl ||
    avatarFallback ||
    '/img/user-placeholder.png';

  const reputacao =
    perfil?.reputacao ||
    perfil?.rating ||
    perfil?.stats || {
      notaMedia: null,
      totalAvaliacoes: null,
      totalVendas: null,
      membroDesde: null,
    };

  const handleIrParaPerfil = () => {
    if (!usuarioId) return;
    if (onClose) onClose();
    navigate(`/usuario/${usuarioId}`);
  };

  const handleClickBackdrop = () => {
    if (onClose) onClose();
  };

  const handleClickConteudo = (e) => {
    e.stopPropagation();
  };

  return (
    <div
      className="perfil-preview-backdrop"
      onClick={handleClickBackdrop}
      aria-modal="true"
      role="dialog"
    >
      <div className="perfil-preview-modal" onClick={handleClickConteudo}>
        <header className="perfil-preview-header">
          <div className="perfil-preview-identidade">
            <img src={avatar} alt={nome} className="perfil-preview-avatar" />
            <div>
              <h3 className="perfil-preview-nome">{nome}</h3>
              {perfil?.planoAtual && (
                <span className="perfil-preview-plano">
                  Plano: {perfil.planoAtual}
                </span>
              )}
            </div>
          </div>

          <button
            type="button"
            className="perfil-preview-fechar"
            onClick={onClose}
            aria-label="Fechar"
          >
            X
          </button>
        </header>

        <section className="perfil-preview-corpo">
          {carregando && (
            <p className="perfil-preview-status">Carregando perfil...</p>
          )}

          {!carregando && erro && (
            <p className="perfil-preview-status perfil-preview-status--erro">
              {erro}
            </p>
          )}

          {!carregando && !erro && (
            <>
              {perfil?.bio && (
                <p className="perfil-preview-bio">{perfil.bio}</p>
              )}

              <ReputacaoVendedor
                notaMedia={
                  reputacao.notaMedia ??
                  reputacao.media ??
                  reputacao.rating ??
                  null
                }
                totalAvaliacoes={
                  reputacao.totalAvaliacoes ??
                  reputacao.qtdAvaliacoes ??
                  reputacao.reviewsCount ??
                  null
                }
                totalVendas={
                  reputacao.totalVendas ??
                  reputacao.vendas ??
                  reputacao.salesCount ??
                  null
                }
                membroDesde={
                  reputacao.membroDesde ??
                  reputacao.desde ??
                  reputacao.memberSince ??
                  null
                }
                compact
              />
            </>
          )}
        </section>

        <footer className="perfil-preview-rodape">
          <button
            type="button"
            className="btn btn--ghost"
            onClick={onClose}
          >
            Fechar
          </button>
          <button
            type="button"
            className="btn btn--primary"
            onClick={handleIrParaPerfil}
          >
            Ver perfil completo
          </button>
        </footer>
      </div>
    </div>
  );
}
