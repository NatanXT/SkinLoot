import { useNavigate } from 'react-router-dom';
import './SkinCard.css';

// Metadados dos planos disponíveis
const plansMeta = {
  gratuito: { label: 'Gratuito', color: '#454B54' },
  intermediario: { label: 'Intermediário', color: '#00C896' },
  plus: { label: '+ Plus', color: '#39FF14' },
};

/**
 * @param {Object} data - Dados do anúncio (imagem, nome, preço, vendedor)
 * @param {boolean} liked - Indica se o item foi favoritado
 * @param {Function} onLike - Ação ao clicar em favorito
 * @param {Function} onContato - Ação ao clicar em "Contato"
 * @param {Function} onComprarFora - Ação ao clicar em "Comprar"
 */
export default function SkinCard({
  data,
  liked,
  onLike,
  onContato,
  onComprarFora,
}) {
  const navigate = useNavigate();

  // Normalização dos dados recebidos
  const titulo = data?.skinNome ?? data?.title ?? data?.nome ?? 'Skin';
  const imagem =
    data?.image ?? data?.imagemUrl ?? data?.imagem ?? '/img/placeholder.png';
  const vendedor =
    data?.usuarioNome ??
    data?.seller?.name ??
    data?.vendedorNome ??
    'Vendedor desconhecido';

  const precoNumber = Number(data?.price ?? data?.preco ?? NaN);
  const precoFmt = Number.isFinite(precoNumber)
    ? precoNumber.toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    : '—';

  const planKey = String(
    data?.planoNome ?? data?.plan ?? data?.plano ?? 'gratuito',
  ).toLowerCase();
  const planMeta = plansMeta[planKey] || { label: '—', color: '#999' };

  // Tentativa de resolver o ID do vendedor a partir de vários campos possíveis.
  const sellerId =
    data?.usuarioId ??
    data?.seller?.id ??
    data?.vendedorId ??
    data?.usuario?.id ??
    data?.sellerId ??
    data?.userId ??
    null;

  // Navega para a página de perfil público do vendedor, se o ID existir.
  const handleSellerClick = () => {
    if (!sellerId) {
      // Sem ID, não navega (componente continua funcional).
      return;
    }
    navigate(`/perfil-publico/${sellerId}`);
  };

  return (
    <article className="card">
      {/*  Imagem + Plano + Favorito  */}
      <div className="card__media">
        <img
          src={imagem}
          alt={titulo}
          loading="lazy"
          onError={(e) => {
            e.currentTarget.src = '/img/placeholder.png';
          }}
        />

        <span className="badge" style={{ background: planMeta.color }}>
          {planMeta.label}
        </span>

        <button
          className={`like ${liked ? 'is-liked' : ''}`}
          onClick={onLike}
          aria-label="Favoritar"
          type="button"
        >
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 6 4 4 6.5 4c1.74 0 3.41 1.01 4.22 2.53C11.09 5.01 12.76 4 14.5 4 17 4 19 6 19 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
            />
          </svg>
        </button>
      </div>

      {/*  Corpo do Card  */}
      <div className="card__body">
        <h3>{titulo}</h3>

        <div className="meta">
          <span className="price">R$ {precoFmt}</span>
        </div>

        {/*  Informações do vendedor  */}
        <div className="seller">
          {/* Mesma base visual dos botões ghost (btn btn--ghost) */}
          <button
            type="button"
            className={`btn btn--ghost seller__name ${
              sellerId ? 'seller__name--clickable' : 'seller__name--disabled'
            }`}
            onClick={sellerId ? handleSellerClick : undefined}
            disabled={!sellerId}
            title={
              sellerId
                ? 'Ver perfil público do vendedor'
                : 'Perfil do vendedor indisponível'
            }
          >
            <span className="seller__avatar">
              {vendedor?.charAt(0)?.toUpperCase() ?? '?'}
            </span>

            <span className="seller__label">
              <span className="seller__label-title">Vendedor</span>
              <span className="seller__label-name">{vendedor}</span>
            </span>
          </button>

          <div className="cta">
            <button
              className="btn btn--ghost"
              onClick={onContato}
              type="button"
            >
              Contato
            </button>
            <button
              className="btn btn--ghost"
              type="button"
              onClick={() => navigate(`/anuncio/${data.id || data._id}`)}
            >
              Ver detalhes
            </button>
          </div>
        </div>

        {/*  Botão inferior  */}
        <div className="cta cta--bottom">
          <button
            className="btn btn--primary full"
            type="button"
            onClick={onComprarFora}
          >
            Comprar
          </button>
        </div>
      </div>
    </article>
  );
}
