import { useEffect, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api'; // Sua api.ts
import anuncioService from '../../services/anuncioService';
import SkinCard from '../../components/skin/SkinCard';
import AuthBrand from '../../components/logo/AuthBrand';
import ChatFlutuante from '../../components/chat/ChatFlutuante';
import { useAuth } from '../../services/AuthContext';

// Importa o CSS do perfil privado para manter a identidade visual exata
import '../usuario/PerfilUsuario.css';
// Importa o CSS de detalhes para usar as estrelas/reputação se necessário
import '../detalhes/DetalheAnuncio.css';

// Helper para reputação (copiado ou importado de um utils)
function calcularNivel(media, total) {
    const m = Number(media) || 0;
    const t = Number(total) || 0;
    if (m >= 4.8 && t > 50) return { label: 'Vendedor Platinum', color: '#39FF14' }; // Neon Green
    if (m >= 4.0 && t > 10) return { label: 'Vendedor Ouro', color: '#facc15' }; // Yellow
    return { label: 'Vendedor Novo', color: '#7B8694' }; // Grey
}

export default function PerfilPublico() {
    const { id } = useParams();
    const { user } = useAuth(); // Para saber se sou eu mesmo

    const [vendedor, setVendedor] = useState(null);
    const [anuncios, setAnuncios] = useState([]);
    const [avaliacoes, setAvaliacoes] = useState([]);
    const [loading, setLoading] = useState(true);

    const [chatAberto, setChatAberto] = useState(null);

    useEffect(() => {
        async function carregar() {
            try {
                setLoading(true);
                // 1. Dados Públicos do Vendedor
                const resUser = await api.get(`/usuarios/public/${id}`);
                setVendedor(resUser.data);

                // 2. Anúncios Ativos
                const resAnuncios = await api.get(`/anuncios/usuario/${id}/ativos`);
                // Normaliza usando seu service existente
                const normalizados = resAnuncios.data.map(a => ({
                    ...anuncioService.normalizarDoBackend(a) // Assumindo que você exportou essa função ou adaptou
                    // Se normalizarDoBackend não for exportada, copie a lógica de mapeamento do SkinCard
                }));
                setAnuncios(normalizados);

                // 3. Avaliações (opcional, se já tiver o endpoint)
                try {
                    const resAval = await api.get(`/api/avaliacoes/usuario/${id}`);
                    setAvaliacoes(resAval.data);
                } catch(e) { /* ignora se não tiver avaliações */ }

            } catch (error) {
                console.error("Erro ao carregar perfil público", error);
            } finally {
                setLoading(false);
            }
        }
        carregar();
    }, [id]);

    // Se o usuário estiver vendo o próprio perfil público, mostre um aviso ou redirecione
    const isMe = user?.id === id;

    if (loading) return (
        <div className="perfil-root">
            <div className="perfil-topbar"><AuthBrand /></div>
            <div className="perfil-container" style={{textAlign:'center', marginTop: 50}}>
                Carregando perfil...
            </div>
        </div>
    );

    if (!vendedor) return <div className="perfil-root">Usuário não encontrado.</div>;

    const reputacao = calcularNivel(vendedor.mediaNotas, vendedor.totalAvaliacoes);

    return (
        <div className="perfil-root">
            {/* Topbar Reaproveitada */}
            <div className="perfil-topbar">
                <AuthBrand />
                <div className="perfil-actions">
                    <Link to="/" className="btn btn--ghost sm">Vitrine</Link>
                    {isMe && (
                        <Link to="/perfil" className="btn btn--primary sm">Editar Meu Perfil</Link>
                    )}
                </div>
            </div>

            {/* Hero Reaproveitado + Ajustado para exibição pública */}
            <header className="perfil-hero">
                <div className="perfil-hero__copy">
                    <h1>{vendedor.nome}</h1>
                    <div style={{display:'flex', gap: 10, justifyContent:'center', alignItems:'center', marginTop: 10}}>
                        {/* Badge de Nível */}
                        <span className="perfil-plano-badge" style={{background: reputacao.color, color: '#0B0D10'}}>
                {reputacao.label}
             </span>
                        {/* Nota */}
                        <span style={{color: '#E8F1F2', fontWeight: 'bold'}}>
                ⭐ {vendedor.mediaNotas?.toFixed(1) || '0.0'}
                            <span style={{color:'#7B8694', fontWeight:'normal', marginLeft:5}}>
                    ({vendedor.totalAvaliacoes || 0} avaliações)
                </span>
             </span>
                    </div>
                    <p style={{marginTop: 15}}>Membro desde {new Date().getFullYear()} (Mock)</p>
                </div>
            </header>

            <div className="perfil-container">

                {/* Seção de Avaliações (Resumo) */}
                <section className="perfil-block">
                    <h2>O que dizem sobre {vendedor.nome}</h2>
                    {avaliacoes.length > 0 ? (
                        <div className="perfil-grid perfil-grid--2">
                            {avaliacoes.slice(0, 2).map(av => (
                                <div key={av.id} className="perfil-card">
                                    <div style={{display:'flex', justifyContent:'space-between', marginBottom: 8}}>
                                        <strong style={{color: '#39FF14'}}>{'★'.repeat(av.nota)}</strong>
                                        <small style={{color:'#7B8694'}}>{new Date(av.dataCriacao).toLocaleDateString()}</small>
                                    </div>
                                    <p style={{color: '#E8F1F2', fontStyle: 'italic'}}>"{av.comentario}"</p>
                                    <small style={{display:'block', marginTop:8, color:'#7B8694'}}>- {av.avaliadorNome}</small>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="perfil-empty">Este vendedor ainda não possui avaliações detalhadas.</div>
                    )}
                </section>

                {/* Vitrine do Vendedor */}
                <section className="perfil-block">
                    <div className="perfil-block-header">
                        <h2>Skins à venda</h2>
                        <span style={{color: 'var(--muted)'}}>{anuncios.length} itens ativos</span>
                    </div>

                    {anuncios.length === 0 ? (
                        <div className="perfil-empty">
                            <p>Nenhum item à venda no momento.</p>
                        </div>
                    ) : (
                        <div className="perfil-grid-cards">
                            {anuncios.map((skin) => (
                                // Reutilizando o SkinCard da Vitrine
                                <SkinCard
                                    key={skin.id}
                                    data={skin}
                                    // Ações do card
                                    onContato={() => setChatAberto({
                                        seller: { id: vendedor.id, nome: vendedor.nome },
                                        skin: { id: skin.id, titulo: skin.skinNome, preco: skin.preco }
                                    })}
                                    // Ocultar botão de like se quiser, ou implementar
                                    liked={false}
                                />
                            ))}
                        </div>
                    )}
                </section>
            </div>

            {/* Chat Flutuante */}
            {user && chatAberto && (
                <div className="chat-float">
                    <ChatFlutuante
                        usuarioAlvo={chatAberto}
                        onFechar={() => setChatAberto(null)}
                    />
                </div>
            )}
        </div>
    );
}
