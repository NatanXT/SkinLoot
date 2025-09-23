import React from 'react';
import './Marketplace.css';

export default function Marketplace() {
  // Exemplo simples com lista fixa de skins
  const skins = [
    { id: 1, nome: 'Skin Dragão', preco: 30 },
    { id: 2, nome: 'Skin Fogo', preco: 45 },
    { id: 3, nome: 'Skin Gelo', preco: 25 },
  ];

  return (
    <div className="marketplace-container">
      <h1>Marketplace</h1>
      <div className="skins-list">
        {skins.map((skin) => (
          <div key={skin.id} className="skin-card">
            <h3>{skin.nome}</h3>
            <p>Preço: R$ {skin.preco},00</p>
            <button>Comprar</button>
          </div>
        ))}
      </div>
    </div>
  );
}
