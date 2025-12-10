// src/components/skin/SkinCard.jsx
import { useNavigate } from 'react-router-dom';
import './SkinCard.css';

const plansMeta = {
  gratuito: { label: 'Gratuito', color: '#454B54' },
  intermediario: { label: 'Intermediário', color: '#00C896' },
  plus: { label: '+ Plus', color: '#39FF14' },
};

export default function SkinCard({
  data,
  liked,
  onLike,
  onContato,
  onComprarFora,
}) {
  const navigate = useNavigate();

  //console.log('%c[SkinCard] DATA RECEBIDA:', 'color:#4CAF50', data);

  const titulo =
    data?.skinNome ?? data?.title ?? data?.nome ?? 'Skin';

  const imagem =
    data?.image ??
    data?.imagemUrl ??
    data?.imagem ??
    data?.skinIcon ??     // estava faltando
    '/img/placeholder.png';

  //console.log('%c[SkinCard] IMAGEM RESOLVIDA:', 'color:#03A9F4', imagem);

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

  const sellerId =
    data?.usuarioId ??
    data?.seller?.id ??
    data?.vendedorId ??
    data?.usuario?.id ??
    data?.sellerId ??
    data?.userId ??
    null;

  const handleSellerClick = () => {
    if (!sellerId) return;
    navigate(`/perfil-publico/${sellerId}`);
  };

  return (
    <article className="card">
      <div className="card__media">
        <img
          src={imagem}
          alt={titulo}
          loading="lazy"
          onError={(e) => {
            // console.warn(
            //   '%c[SkinCard] ERRO AO CARREGAR IMAGEM! CAIU NO FALLBACK:',
            //   'color:red',
            //   imagem,
            // );
            e.currentTarget.src = '/img/placeholder.png';
          }}
          // onLoad={() => {
          //   console.log(
          //     '%c[SkinCard] IMAGEM CARREGADA COM SUCESSO:',
          //     'color:green',
          //     imagem,
          //   );
          // }}
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

      <div className="card__body">
        <h3>{titulo}</h3>

        <div className="meta">
          <span className="price">R$ {precoFmt}</span>
        </div>

        <div className="seller">
          <button
            type="button"
            className={`btn btn--ghost seller__name ${
              sellerId ? 'seller__name--clickable' : 'seller__name--disabled'
            }`}
            onClick={sellerId ? handleSellerClick : undefined}
            disabled={!sellerId}
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
            <button className="btn btn--ghost" onClick={onContato}>
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
