// ==========================================================
// Avaliacoes.jsx
// ----------------------------------------------------------
// Componente simples de depoimentos dos usuários.
// Exibe citações estilizadas centralizadas.
// ==========================================================

import React from 'react';
import '../home/Avaliacoes.css';

/**
 * Renderiza uma seção com depoimentos de usuários.
 * Estrutura:
 * - Título
 * - Três citações fixas
 */
export default function Avaliacoes() {
  return (
    <section className="avaliacoes" id="avaliacoes">
      <h2>O que dizem sobre nós</h2>

      <div className="avaliacoes-grid">
        <blockquote>“Melhor site de skins que já usei!” – Lucas, SP</blockquote>
        <blockquote>
          “Sistema de troca rápido e confiável.” – Marina, RJ
        </blockquote>
        <blockquote>“Encontrei minha faca dos sonhos.” – Pedro, PR</blockquote>
      </div>
    </section>
  );
}
