// Avaliacoes.jsx
import React from "react";
import "../../styles/home/Avaliacoes.css";

/**
 * Componente que exibe depoimentos de usuários em formato de blocos de citação.
 */
export default function Avaliacoes() {
  return (
    <section className="avaliacoes" id="avaliacoes">
      <h2>O que dizem sobre nós</h2>
      <div className="avaliacoes-grid">
        <blockquote>“Melhor site de skins que já usei!” – Lucas, SP</blockquote>
        <blockquote>“Sistema de troca rápido e confiável.” – Marina, RJ</blockquote>
        <blockquote>“Encontrei minha faca dos sonhos.” – Pedro, PR</blockquote>
      </div>
    </section>
  );
}
