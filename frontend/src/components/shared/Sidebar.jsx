// Sidebar.jsx
import React from 'react';
import './Sidebar.css';

/**
 * Menu lateral fixo que pode ser expandido ou recolhido.
 *
 * @param {boolean} isOpen - Indica se a sidebar está aberta
 * @param {function} toggleSidebar - Função para alternar visibilidade
 */
export default function Sidebar({ isOpen, toggleSidebar }) {
  return (
    <>
      {/* Overlay escuro ao fundo que fecha a sidebar ao clicar */}
      {isOpen && (
        <div className="sidebar-overlay" onClick={toggleSidebar}></div>
      )}

      {/* Sidebar com links de navegação */}
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
