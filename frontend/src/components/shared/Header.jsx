// Header.jsx
import React from "react";
import "./Header.css";
import { FaBars, FaTimes } from "react-icons/fa";

/**
 * Cabeçalho principal com logo, busca, navegação e botão de menu lateral.
 * 
 * @param {boolean} isOpen - Estado de visibilidade da sidebar
 * @param {function} toggleSidebar - Função para alternar a sidebar
 */
export default function Header({ isOpen, toggleSidebar }) {
  return (
    <header className="header">
      {/* Botão para abrir/fechar sidebar no mobile */}
      <button className="sidebar-toggle" onClick={toggleSidebar}>
        {isOpen ? <FaTimes /> : <FaBars />}
      </button>

      {/* Logo da empresa */}
      <div className="logo">SkinLoot</div>

      {/* Campo de busca */}
      <div className="search-header">
        <input type="text" placeholder="Buscar skins..." />
        <button>Buscar</button>
      </div>

      {/* Navegação */}
      <nav className="nav-links">
        <a href="#home">Início</a>
        <a href="#categorias">Categorias</a>
        <a href="#avaliacoes">Avaliações</a>
      </nav>
    </header>
  );
}
