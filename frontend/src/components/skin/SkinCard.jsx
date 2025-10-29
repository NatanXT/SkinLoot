// ======================================================
// SkinCard.jsx
// Caminho: frontend/src/components/skin/SkinCard.jsx
// ------------------------------------------------------
// Componente visual responsável por exibir cada anúncio
// de skin (imagem, preço, vendedor e botões de ação).
// ------------------------------------------------------
// Props esperadas:
//  - data: objeto com os dados do anúncio
//  - liked: booleano (favoritado)
//  - onLike(): callback para alternar favorito
//  - onContato(): callback para abrir chat com o vendedor
//  - onComprarFora(): callback para redirecionar para compra externa
// ======================================================

import { useNavigate } from 'react-router-dom';
import './SkinCard.css';

const plansMeta = {
  gratuito: { label: 'Gratuito', color: '#454B54' },
  intermediario: { label: 'Intermediário', color: '#00C896' },
  plus: { label: '+ Plus', color: '#39FF14' },
};

export default function SkinCard({ data, liked, onLike, onContato, onComprarFora }) {
  const navigate = useNavigate();

  // Dados normalizados
  const titulo = data?.skinNome ?? data?.title ?? data?.nome ?? 'Skin';
  const imagem = data?.image ?? data?.imagemUrl ?? data?.imagem ?? '/img/placeholder.png';
  const vendedor =
    data?.usuarioNome ?? data?.seller?.name ?? data?.vendedorNome ?? 'Vendedor desconhecido';

  const precoNumber = Number(data?.price ?? data?.preco ?? NaN);
  const precoFmt = Number.isFinite(precoNumber)
    ? precoNumber.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : '—';

  const planKeyRaw = data?.planoNome ?? data?.plan ?? data?.plano ?? 'gratuito';
  const planKey = String(planKeyRaw).toLowerCase();
  const planMeta = plansMeta[planKey] || { label: '—', color: '#999' };

  return (
    <article className="card">
      {/* Imagem principal + badge de plano + botão de like */}
      <div className="card__media">
        <img
          src={imagem}
          alt={titulo}
          loading="lazy"
          onError={(e) => (e.currentTarget.src = '/img/placeholder.png')}
        />
        <span className="badge" style={{ background: planMeta.color }}>
          {planMeta.label}
        </span>

        <button
          className={`like ${liked ? 'is-liked' : ''}`}
          onClick={onLike}
          aria-label="Favoritar"
        >
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 6 4 4 6.5 4c1.74 0 3.41 1.01 4.22 2.53C11.09 5.01 12.76 4 14.5 4 17 4 19 6 19 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
            />
          </svg>
        </button>
      </div>

      {/* Corpo do card: título, preço e vendedor */}
      <div className="card__body">
        <h3>{titulo}</h3>
        <div className="meta">
          <span className="price">R$ {precoFmt}</span>
        </div>

        {/* Informações e botões principais */}
        <div className="seller">
          <span>Vendedor: {vendedor}</span>

          <div className="cta">
            <button className="btn btn--ghost" onClick={onContato}>
              Contato
            </button>
            <button
              className="btn btn--ghost"
              onClick={() => navigate(`/anuncio/${data.id || data._id}`)}
            >
              Ver detalhes
            </button>
          </div>
        </div>

        {/* Botão de compra (largura total) */}
        <div className="cta cta--bottom">
          <button className="btn btn--primary full" onClick={onComprarFora}>
            Comprar
          </button>
        </div>
      </div>
    </article>
  );
}
