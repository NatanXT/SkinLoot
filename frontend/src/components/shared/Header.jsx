import React from 'react';
import './Header.css';
import { FaBars, FaTimes } from 'react-icons/fa';

/**
 * @param {boolean} isOpen - Indica se a sidebar está aberta
 * @param {Function} toggleSidebar - Alterna a visibilidade da sidebar
 */
export default function Header({ isOpen, toggleSidebar }) {
  return (
    <header className="header">
      {/* Botão de menu lateral (visível no mobile) */}
      <button
        className="sidebar-toggle"
        onClick={toggleSidebar}
        aria-label="Alternar menu lateral"
      >
        {isOpen ? <FaTimes /> : <FaBars />}
      </button>

      {/* Logo da plataforma */}
      <div className="logo">SkinLoot</div>

      {/* Campo de busca */}
      <div className="search-header">
        <input type="text" placeholder="Buscar skins..." />
        <button>Buscar</button>
      </div>

      {/* Links de navegação */}
      <nav className="nav-links">
        <a href="#home">Início</a>
        <a href="#categorias">Categorias</a>
        <a href="#avaliacoes">Avaliações</a>
      </nav>
    </header>
  );
}
