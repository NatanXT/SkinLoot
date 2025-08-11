// Footer.jsx
import React from "react";
import "../home/Footer.css";

/**
 * Rodapé do site com redes sociais e copyright.
 */
export default function Footer() {
  return (
    <footer className="footer">
      <p>&copy; 2025 SkinLoot. Todos os direitos reservados.</p>
      <div className="redes-sociais">
        <a href="#"><i className="pi pi-instagram" /></a>
        <a href="#"><i className="pi pi-discord" /></a>
        <a href="#"><i className="pi pi-twitter" /></a>
      </div>
    </footer>
  );
}
