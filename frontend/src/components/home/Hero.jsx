// Hero.jsx
import React from "react";
import "../home/Hero.css";

/**
 * Seção de destaque inicial com título, subtítulo e botão.
 */
export default function Hero() {
  return (
    <section className="hero" id="home">
      <h1>Escolha a skin perfeita</h1>
      <p>Descubra, compre e negocie com estilo.</p>
      <button className="cta-button">Explorar Skins</button>
    </section>
  );
}
