// ==========================================================
// Layout.jsx
// ----------------------------------------------------------
// Estrutura base de páginas autenticadas:
// - Sidebar lateral
// - Header fixo no topo
// - Conteúdo dinâmico (children ou rotas aninhadas via Outlet)
// - (Footer opcional - pode ser incluído globalmente)
// ==========================================================

import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../shared/Sidebar';
import Header from '../shared/Header';
import Footer from './Footer';
import './Layout.css';

/**
 * Componente de layout principal.
 * Engloba toda a estrutura de navegação e conteúdo das páginas.
 *
 * @param {ReactNode} children - Conteúdo específico da rota atual.
 */
export default function Layout({ children }) {
  return (
    <div className="layout-container">
      {/* Barra lateral */}
      <Sidebar />

      {/* Área principal */}
      <div className="main-section">
        <Header />
        <main className="content">{children}</main>
        <Outlet />
        {/* Rodapé opcional — pode ser ativado se desejar */}
        {/* <Footer /> */}
      </div>
    </div>
  );
}
