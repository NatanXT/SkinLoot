// ======================================================
// ChatFlutuante.jsx
// Caminho: src/components/chat/ChatFlutuante.jsx
// ------------------------------------------------------
// Componente principal do chat flutuante.
// Recursos:
// - Botão minimizado ("pill") com badge de não lidas
// - Janela expandida com lista de conversas e mensagens
// - Envio e recebimento via WebSocket (STOMP + SockJS)
// - Histórico de conversa via API REST
// - Auto-scroll e controle de não lidas
// ------------------------------------------------------

import { useState, useEffect, useMemo, useRef } from 'react';
import './ChatFlutuante.css';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useAuth } from '../../services/AuthContext';
import api from '../../services/api';

export default function ChatFlutuante({ usuarioAlvo, onFechar }) {
  // ======================================================
  // CONTEXTO E ESTADOS PRINCIPAIS
  // ======================================================
  const { user } = useAuth(); // Usuário autenticado (quem sou eu)

  const [aberto, setAberto] = useState(false);
  const [contatos, setContatos] = useState([]);
  const [contatoAtivoId, setContatoAtivoId] = useState(null);
  const [texto, setTexto] = useState('');

  const mensagensRef = useRef(null); // Ref para auto-scroll
  const stompClientRef = useRef(null); // Ref do cliente STOMP

  // ======================================================
  // DERIVADOS MEMOIZADOS
  // ======================================================

  // Contato atualmente ativo
  const contatoAtivo = useMemo(
    () => contatos.find((c) => c.id === contatoAtivoId) || null,
    [contatos, contatoAtivoId],
  );

  // Total de mensagens não lidas
  const totalNaoLidas = useMemo(
    () => contatos.reduce((acc, c) => acc + (c.naoLidas || 0), 0),
    [contatos],
  );

  // Contato mais recente com mensagens não lidas
  const contatoComNaoLidaMaisRecente = useMemo(() => {
    const candidato = contatos
      .filter((c) => (c.naoLidas || 0) > 0)
      .map((c) => ({
        contato: c,
        lastTs:
          c.mensagens?.length > 0
            ? Number(c.mensagens[c.mensagens.length - 1].id) || 0
            : 0,
      }))
      .sort((a, b) => b.lastTs - a.lastTs)[0];
    return candidato?.contato || null;
  }, [contatos]);

  // Define qual avatar exibir (prioriza não lidas > ativo > último contato)
  const contatoParaAvatar = useMemo(() => {
    if (contatoComNaoLidaMaisRecente) return contatoComNaoLidaMaisRecente;
    if (contatoAtivo) return contatoAtivo;
    const candidato = contatos
      .map((c) => ({
        contato: c,
        lastTs:
          c.mensagens?.length > 0
            ? Number(c.mensagens[c.mensagens.length - 1].id) || 0
            : 0,
      }))
      .sort((a, b) => b.lastTs - a.lastTs)[0];
    return candidato?.contato || null;
  }, [contatoComNaoLidaMaisRecente, contatoAtivo, contatos]);

  // ======================================================
  // AUTO-SCROLL AO TROCAR CONVERSA OU RECEBER NOVAS MSGS
  // ======================================================
  useEffect(() => {
    if (!mensagensRef.current) return;
    mensagensRef.current.scrollTop = mensagensRef.current.scrollHeight;
  }, [contatoAtivoId, contatoAtivo?.mensagens.length]);

  // ======================================================
  // CONEXÃO WEBSOCKET (STOMP)
  // ======================================================
  useEffect(() => {
    if (user && !stompClientRef.current) {
      console.log('Iniciando conexão WebSocket...');

      const stompClient = new Client({
        webSocketFactory: () => new SockJS('http://localhost:8080/ws-chat'),
        reconnectDelay: 5000,
        onConnect: () => {
          console.log('WebSocket conectado.');

          // Inscrição na fila privada do usuário
          stompClient.subscribe(`/user/queue/mensagens`, (payload) => {
            const novaMensagem = JSON.parse(payload.body);
            receberMensagem(novaMensagem);
          });
        },
        onStompError: (frame) => {
          console.error('Erro STOMP:', frame.headers['message'], frame.body);
        },
      });

      stompClient.activate();
      stompClientRef.current = stompClient;
    }

    // Limpeza: desconecta ao desmontar
    return () => {
      if (stompClientRef.current) {
        console.log('Desconectando WebSocket...');
        stompClientRef.current.deactivate();
        stompClientRef.current = null;
      }
    };
  }, [user]);

    useEffect(() => {
        if (!user || !user.id) return; // Só roda se o usuário estiver carregado

        const carregarListaDeConversas = async () => {
            try {
                // 1. Chama o novo endpoint
                const { data: ultimasMensagens } = await api.get('/api/chat/minhas-conversas');

                // 2. Mapeia a resposta (lista de ChatMessageResponse)
                const listaContatos = ultimasMensagens.map((msg) => {
                    const souEu = msg.remetenteId === user.id;
                    const outroUsuarioId = souEu ? msg.destinatarioId : msg.remetenteId;
                    const outroUsuarioNome = souEu ? msg.destinatarioNome : msg.remetenteNome;

                    // 3. Formata a última mensagem para o estado local
                    const msgFormatada = {
                        id: msg.id,
                        autor: souEu ? 'eu' : 'ele',
                        texto: msg.conteudo,
                        timestamp: msg.timestamp,
                    };

                    // 4. Cria o objeto de Contato
                    return {
                        id: outroUsuarioId,
                        nome: outroUsuarioNome,
                        foto: 'https://i.pravatar.cc/60?u=' + outroUsuarioId, // Placeholder
                        status: 'offline', // Placeholder (precisaria de sistema de presença)
                        naoLidas: 0, // TODO: O backend precisaria calcular isso
                        mensagens: [msgFormatada], // Começa com a última mensagem
                    };
                });

                // 5. Define o estado com todas as conversas
                setContatos(listaContatos);

            } catch (error) {
                console.error("Falha ao carregar lista de conversas:", error);
            }
        };

        carregarListaDeConversas();
    }, [user]); // Roda uma vez quando 'user' é carregado

  // ======================================================
  // FUNÇÃO: Carregar histórico de conversa (REST)
  // ======================================================
  const carregarHistorico = async (alvo) => {
    try {
      const { data } = await api.get(`/api/chat/conversa/${alvo.id}`);

      return data.map((msg) => ({
        id: msg.id,
        autor: msg.remetenteNome === user.nome ? 'eu' : 'ele',
        texto: msg.conteudo,
        timestamp: msg.timestamp,
      }));
    } catch (err) {
      console.error('Falha ao carregar histórico:', err);
      return [];
    }
  };

  // ======================================================
  // EFEITO: Quando usuário clica em "Contato" (usuarioAlvo)
  // ======================================================
  useEffect(() => {
    if (!usuarioAlvo) return;

    setAberto(true);

    const setupContato = async () => {
      const novoContato = {
        id: usuarioAlvo.id,
        nome: usuarioAlvo.nome,
        foto:
          usuarioAlvo.foto ?? `https://i.pravatar.cc/60?u=${usuarioAlvo.id}`,
        status: 'online agora',
        naoLidas: 0,
        mensagens: [],
      };

      const historico = await carregarHistorico(usuarioAlvo);
      novoContato.mensagens = historico;

      setContatos((prev) => {
        const existe = prev.some((c) => c.id === usuarioAlvo.id);
        if (existe) {
          return prev.map((c) =>
            c.id === usuarioAlvo.id ? { ...c, mensagens: historico } : c,
          );
        }
        return [...prev, novoContato];
      });

      setContatoAtivoId(usuarioAlvo.id);

      const precoFmt = usuarioAlvo.preco?.toLocaleString('pt-BR', {});
      setTexto(
        `Olá, fiquei interessado na skin: ${
          usuarioAlvo.nome || 'Dragon Lore'
        }, valor: ${precoFmt || '—'}, podemos conversar?`,
      );
    };

    setupContato();
  }, [usuarioAlvo]);

  // ======================================================
  // FUNÇÃO: Receber mensagem do WebSocket
  // ======================================================
  const receberMensagem = (novaMensagem) => {
    if (!user || !user.id) {
      console.error('Usuário não encontrado no AuthContext.');
      return;
    }

    const souEu = novaMensagem.remetenteId === user.id;
    const outroUsuarioId = souEu
      ? novaMensagem.destinatarioId
      : novaMensagem.remetenteId;
    const outroUsuarioNome = souEu
      ? novaMensagem.destinatarioNome
      : novaMensagem.remetenteNome;

    const msgFormatada = {
      id: novaMensagem.id,
      autor: souEu ? 'eu' : 'ele',
      texto: novaMensagem.conteudo,
      timestamp: novaMensagem.timestamp,
    };

    setContatos((prev) => {
      const index = prev.findIndex((c) => c.id === outroUsuarioId);
      const atualizados = [...prev];

      if (index > -1) {
        const contato = atualizados[index];

        // Evita duplicação
        if (contato.mensagens.some((m) => m.id === msgFormatada.id))
          return prev;

        atualizados[index] = {
          ...contato,
          mensagens: [...contato.mensagens, msgFormatada].sort(
            (a, b) => new Date(a.timestamp) - new Date(b.timestamp),
          ),
          naoLidas:
            aberto && contatoAtivoId === outroUsuarioId
              ? 0
              : (contato.naoLidas || 0) + 1,
          nome: outroUsuarioNome,
        };
      } else {
        atualizados.push({
          id: outroUsuarioId,
          nome: outroUsuarioNome,
          foto: `https://i.pravatar.cc/60?u=${outroUsuarioId}`,
          status: 'online agora',
          naoLidas: aberto && contatoAtivoId === outroUsuarioId ? 0 : 1,
          mensagens: [msgFormatada],
        });
      }

      return atualizados;
    });
  };

  // ======================================================
  // FUNÇÃO: Alternar janela do chat (abrir/fechar)
  // ======================================================
  function toggleChat() {
    setAberto((prev) => !prev);

    // Ao fechar, notifica o componente pai (se aplicável)
    if (aberto && onFechar) onFechar();

    setContatoAtivoId(null);
  }

  // ======================================================
  // FUNÇÃO: Abrir conversa e carregar histórico (se necessário)
  // ======================================================
  async function abrirConversa(c) {
    if (c.mensagens.length === 0) {
      const historico = await carregarHistorico(c);
      setContatos((prev) =>
        prev.map((x) =>
          x.id === c.id ? { ...x, mensagens: historico, naoLidas: 0 } : x,
        ),
      );
    } else {
      setContatos((prev) =>
        prev.map((x) => (x.id === c.id ? { ...x, naoLidas: 0 } : x)),
      );
    }
    setContatoAtivoId(c.id);
  }

  // ======================================================
  // FUNÇÃO: Enviar mensagem (via WebSocket)
  // ======================================================
  function enviarMensagem(e) {
    e.preventDefault();
    const textoLimpo = texto.trim();

    if (!textoLimpo || !contatoAtivoId || !stompClientRef.current) return;

    const payload = {
      destinatarioId: contatoAtivoId,
      conteudo: textoLimpo,
    };

    stompClientRef.current.publish({
      destination: '/app/chat/enviar',
      body: JSON.stringify(payload),
    });

    setTexto('');
  }

  // ======================================================
  // RENDERIZAÇÃO
  // ======================================================
  return (
    <div className="chat-flutuante">
      {aberto ? (
        // --------------------------------------------------
        // JANELA EXPANDIDA
        // --------------------------------------------------
        <div className="chat-janela chat-janela--rounded">
          {/* ===== LISTA DE CONVERSAS ===== */}
          {!contatoAtivo ? (
            <div className="chat-lista">
              <div className="chat-topo">
                <span className="chat-topo-label">Mensagens</span>
                <button
                  className="btn-fechar"
                  onClick={toggleChat}
                  aria-label="Fechar"
                >
                  ✕
                </button>
              </div>

              <div className="chat-contatos">
                {contatos.map((c) => (
                  <div
                    key={c.id}
                    className={`chat-contato ${
                      c.id === contatoAtivoId ? 'is-active' : ''
                    }`}
                    onClick={() => abrirConversa(c)}
                  >
                    <img src={c.foto} alt={c.nome} />
                    <div className="info">
                      <strong>{c.nome}</strong>
                      <span>{c.status}</span>
                    </div>
                    {c.naoLidas > 0 && (
                      <span className="badge">{c.naoLidas}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            // ===== CONVERSA ATIVA =====
            <>
              <div className="chat-topo">
                <div className="user">
                  <img src={contatoAtivo.foto} alt={contatoAtivo.nome} />
                  <div>
                    <strong>{contatoAtivo.nome}</strong>
                  </div>
                </div>
                <div className="chat-topo-actions">
                  <button
                    className="btn-voltar"
                    onClick={() => setContatoAtivoId(null)}
                    aria-label="Voltar para lista"
                  >
                    ←
                  </button>
                  <button
                    className="btn-fechar"
                    onClick={toggleChat}
                    aria-label="Fechar"
                  >
                    ✕
                  </button>
                </div>
              </div>

              <div className="chat-mensagens" ref={mensagensRef}>
                {contatoAtivo.mensagens.map((m) => (
                  <div
                    key={m.id}
                    className={`chat-msg ${
                      m.autor === 'eu' ? 'chat-eu' : 'chat-ele'
                    }`}
                  >
                    {m.texto}
                  </div>
                ))}
              </div>

              <form className="chat-form" onSubmit={enviarMensagem}>
                <input
                  type="text"
                  placeholder="Digite sua mensagem..."
                  value={texto}
                  onChange={(e) => setTexto(e.target.value)}
                />
                <button type="submit" aria-label="Enviar">
                  Enviar
                </button>
              </form>
            </>
          )}
        </div>
      ) : (
        // --------------------------------------------------
        // BOTÃO MINIMIZADO ("PILL")
        // --------------------------------------------------
        <button
          className="chat-icone chat-icone--pill"
          onClick={toggleChat}
          aria-label="Abrir mensagens"
        >
          {/* Ícone à esquerda */}
          <span className="chat-icone__left">
            <span className="chat-icone__emoji">💬</span>
            {totalNaoLidas > 0 && (
              <span className="chat-icone__badge">{totalNaoLidas}</span>
            )}
          </span>

          {/* Texto central */}
          <span className="chat-icone__label">Mensagens</span>

          {/* Avatar à direita */}
          <span className="chat-icone__right">
            {contatoParaAvatar?.foto ? (
              <img
                className="chat-icone__avatar"
                src={contatoParaAvatar.foto}
                alt={contatoParaAvatar.nome || 'Contato'}
              />
            ) : (
              <span className="chat-icone__avatar chat-icone__avatar--placeholder" />
            )}
          </span>
        </button>
      )}
    </div>
  );
}
