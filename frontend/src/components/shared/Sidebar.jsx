// ==========================================================
// Sidebar.jsx
// ----------------------------------------------------------
// Menu lateral da aplicação.
// Pode ser expandido/recolhido no mobile e permanece fixo no desktop.
// ==========================================================

import React from 'react';
import './Sidebar.css';

/**
 * Sidebar de navegação lateral.
 *
 * @param {boolean} isOpen - Define se a sidebar está visível.
 * @param {Function} toggleSidebar - Fecha a sidebar ao clicar fora ou no ícone.
 */
export default function Sidebar({ isOpen, toggleSidebar }) {
  return (
    <>
      {/* Overlay clicável para fechar a sidebar (apenas mobile) */}
      {isOpen && <div className="sidebar-overlay" onClick={toggleSidebar} />}

      {/* Container lateral com links */}
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <ul>
          <li>
            <a href="#inicio">Início</a>
          </li>
          <li>
            <a href="#populares">Populares</a>
          </li>
          <li>
            <a href="#favoritas">Favoritas</a>
          </li>
          <li>
            <a href="#conta">Minha Conta</a>
          </li>
        </ul>
      </aside>
    </>
  );
}
