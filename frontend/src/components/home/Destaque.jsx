// Destaque.jsx
import React from 'react';
import '../home/Destaque.css';

/**
 * Componente de destaque para uma skin especial com botão de chamada para ação.
 */
export default function Destaque() {
  return (
    <section className="destaque">
      <h2>Skin em Destaque</h2>
      <div className="destaque-box">
        <img src="/img/awp_neo_noir.png" alt="AWP Neon Rider" />
        <div>
          <h3>AWP | Neon Rider</h3>
          <p>Rara, minimal wear, super valorizada.</p>
          <button className="cta-button">Comprar Agora</button>
        </div>
      </div>
    </section>
  );
}
