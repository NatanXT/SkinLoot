import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import anuncioService from '../../services/anuncioService.js';
import './DetalheAnuncio.css';
import AuthBrand from '../../components/logo/AuthBrand.jsx';

export default function DetalheAnuncio() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [anuncio, setAnuncio] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [liked, setLiked] = useState(false); // novo estado de like
  const [loadingLike, setLoadingLike] = useState(false);

  // Busca o anúncio
  useEffect(() => {
    async function carregar() {
      try {
        setCarregando(true);
        const dados = await anuncioService.buscarPorId(id);
        setAnuncio(dados);
        setLiked(Boolean(dados._raw?.liked || false)); // se backend já sinaliza
      } catch {
        setErro('Não foi possível carregar o anúncio.');
      } finally {
        setCarregando(false);
      }
    }
    carregar();
  }, [id]);

  // Alternar favorito
  async function alternarFavorito() {
    if (loadingLike) return;
    setLoadingLike(true);
    try {
      if (liked) {
        await anuncioService.unlikeAnuncio(id);
      } else {
        await anuncioService.likeAnuncio(id);
      }
      setLiked(!liked);
    } catch (err) {
      console.error('Erro ao alternar favorito:', err);
    } finally {
      setLoadingLike(false);
    }
  }

  if (carregando) {
    return (
      <div className="detalhe-root">
        <AuthBrand />
        <p>Carregando anúncio...</p>
      </div>
    );
  }

  if (erro) {
    return (
      <div className="detalhe-root">
        <AuthBrand />
        <p className="erro">{erro}</p>
        <button className="btn btn--ghost" onClick={() => navigate(-1)}>
          Voltar
        </button>
      </div>
    );
  }

  if (!anuncio) return null;

  return (
    <div className="detalhe-root">
      <div className="detalhe-topbar">
        <AuthBrand />
        <Link to="/" className="btn btn--ghost sm">
          Voltar à Vitrine
        </Link>
      </div>

      <div className="detalhe-card">
        <div className="detalhe-imagem">
          <img
            src={anuncio.image || anuncio.skinImageUrl || anuncio.imagemUrl}
            alt={anuncio.title || anuncio.titulo}
            onError={(e) => (e.currentTarget.src = '/img/placeholder.png')}
          />
        </div>

        <div className="detalhe-info">
          <h1>{anuncio.title || anuncio.titulo}</h1>
          <p className="preco">
            R${' '}
            {Number(anuncio.price || anuncio.preco).toLocaleString('pt-BR', {
              minimumFractionDigits: 2,
            })}
          </p>
          <p>
            <strong>Vendedor:</strong>{' '}
            {anuncio.seller?.name || anuncio.usuarioNome || '—'}
          </p>
          <p>
            <strong>Descrição:</strong>{' '}
            {anuncio._raw?.descricao || 'Sem descrição.'}
          </p>

          {/* Botão de Favoritar */}
          <button
            className={`btn-like ${liked ? 'ativo' : ''}`}
            disabled={loadingLike}
            onClick={alternarFavorito}
          >
            {liked ? '★ Favoritado' : '☆ Favoritar'}
          </button>

          {/* Botões principais */}
          <div className="detalhe-acoes">
            <button className="btn btn--ghost" onClick={() => navigate(-1)}>
              Voltar
            </button>
            <button
              className="btn btn--primary"
              onClick={() =>
                window.open(anuncio._raw?.linkExterno || '#', '_blank')
              }
            >
              Comprar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
