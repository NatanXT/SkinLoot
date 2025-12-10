import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './PerfilPreviewModal.css';

export default function PerfilPreviewModal({
  open,
  onClose,
  usuarioId,
  nomeFallback,
}) {
  const navigate = useNavigate();

  if (!open) return null;

  const nome = nomeFallback || "Usuário";
  const inicial = nome?.charAt(0)?.toUpperCase() || "U";

  function irParaPerfil() {
    if (onClose) onClose();
    navigate(`/perfil-publico/${usuarioId}`);
  }

  return (
    <div className="pp-backdrop" onClick={onClose}>
      <div className="pp-modal" onClick={(e) => e.stopPropagation()}>
        <header className="pp-header">
          <div className="pp-user">
            <div className="pp-avatar">{inicial}</div>
            <div>
              <h3 className="pp-name">{nome}</h3>
            </div>
          </div>

          <button className="pp-close" onClick={onClose} aria-label="Fechar">
            ✕
          </button>
        </header>

        <section className="pp-body">
          {/* Nenhuma mensagem de erro é exibida */}
        </section>

        <footer className="pp-footer">
          <button className="pp-btn pp-btn-ghost" onClick={onClose}>
            Fechar
          </button>
          <button className="pp-btn pp-btn-primary" onClick={irParaPerfil}>
            Ver perfil completo
          </button>
        </footer>
      </div>
    </div>
  );
}
