// src/components/chat/ChatFlutuante.jsx
// ------------------------------------------------------
// Ajustes principais:
// - Mantém as correções de estado (contatoAtivoId, fechamento, auto-scroll).
// - Botão minimizado ("pill") super arredondado, com:
//     * Ícone à esquerda (com badge vermelha se houver não lidas)
//     * Texto "Mensagens" no centro
//     * Avatar do contato com mensagens não lidas (ou último contato) à direita
// - Lógica para escolher qual avatar exibir e a contagem de não lidas.
// ------------------------------------------------------

import { useState, useEffect, useMemo, useRef } from 'react';
import './ChatFlutuante.css';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useAuth } from '../../services/AuthContext'; // Para saber quem é "eu"
import api from '../../services/api';

// Respostas mock para simular o outro lado (remova quando integrar com backend)
// const respostasMock = [
//   'Oi, tudo bem! Vamos conversar sim.',
//   'Podemos ver, me fale sua proposta.',
//   'Achei interessante, nos falamos mais depois.',
// ];

export default function ChatFlutuante({ usuarioAlvo, onFechar }) {
    const { user } = useAuth();

    const [aberto, setAberto] = useState(false);
    const [contatos, setContatos] = useState([]);
    const [contatoAtivoId, setContatoAtivoId] = useState(null);
    const [texto, setTexto] = useState('');
    const mensagensRef = useRef(null);

    // NOVO: Referência para guardar o cliente STOMP
    const stompClientRef = useRef(null);

    const contatoAtivo = useMemo(
        () => contatos.find((c) => c.id === contatoAtivoId) || null,
        [contatos, contatoAtivoId],
    );

    // total de não lidas (para badge geral)
    const totalNaoLidas = useMemo(
        () => contatos.reduce((acc, c) => acc + (c.naoLidas || 0), 0),
        [contatos],
    );

    // contato com não lidas mais recente (p/ avatar da pill)
    const contatoComNaoLidaMaisRecente = useMemo(() => {
        const cand = contatos
            .filter((c) => (c.naoLidas || 0) > 0)
            .map((c) => ({
                contato: c,
                lastTs:
                    c.mensagens && c.mensagens.length
                        ? Number(c.mensagens[c.mensagens.length - 1].id) || 0
                        : 0,
            }))
            .sort((a, b) => b.lastTs - a.lastTs)[0];
        return cand?.contato || null;
    }, [contatos]);

    // fallback para avatar quando não há não lidas:
    // - usa ativo, senão último que falou (maior timestamp), senão um placeholder
    const contatoParaAvatar = useMemo(() => {
        if (contatoComNaoLidaMaisRecente) return contatoComNaoLidaMaisRecente;
        if (contatoAtivo) return contatoAtivo;
        const cand = contatos
            .map((c) => ({
                contato: c,
                lastTs:
                    c.mensagens && c.mensagens.length
                        ? Number(c.mensagens[c.mensagens.length - 1].id) || 0
                        : 0,
            }))
            .sort((a, b) => b.lastTs - a.lastTs)[0];
        return cand?.contato || null;
    }, [contatoComNaoLidaMaisRecente, contatoAtivo, contatos]);

    // ... (useMemos para 'totalNaoLidas' e 'contatoParaAvatar' continuam iguais) ...

    // auto-scroll quando troca conversa / chegam msgs
    useEffect(() => {
        if (!mensagensRef.current) return;
        mensagensRef.current.scrollTop = mensagensRef.current.scrollHeight;
    }, [contatoAtivoId, contatoAtivo?.mensagens.length]); // Modificado para reagir ao tamanho

    // NOVO: Efeito para conectar e desconectar do WebSocket
    useEffect(() => {
        // Só conecta se o usuário estiver logado
        if (user && !stompClientRef.current) {
            console.log('Iniciando conexão WebSocket...');

            // Cria o cliente STOMP
            const stompClient = new Client({
                webSocketFactory: () => new SockJS('http://localhost:8080/ws-chat'),
                reconnectDelay: 5000,
                onConnect: () => {
                    console.log('WebSocket Conectado!');

                    // Se inscreve na fila privada de mensagens
                    // O backend (ChatController) enviará novas mensagens para cá
                    stompClient.subscribe(`/user/queue/mensagens`, (payload) => {
                        const novaMensagem = JSON.parse(payload.body);
                        // Chama a função que adiciona a mensagem na tela
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

        // Função de limpeza: desconecta ao sair do componente
        return () => {
            if (stompClientRef.current) {
                console.log('Desconectando WebSocket...');
                stompClientRef.current.deactivate();
                stompClientRef.current = null;
            }
        };
    }, [user]); // Depende do 'user' do AuthContext

    // NOVO: Função para carregar o histórico de uma conversa via REST
    const carregarHistorico = async (alvo) => {
        try {
            const { data } = await api.get(`/api/chat/conversa/${alvo.id}`);

            // Traduz a resposta da API (ChatMessageResponse) para o estado do frontend
            const mensagensFormatadas = data.map((msg) => ({
                id: msg.id,
                // Compara o remetente da msg com o usuário logado
                autor: msg.remetenteNome === user.nome ? 'eu' : 'ele',
                texto: msg.conteudo,
                timestamp: msg.timestamp,
            }));

            return mensagensFormatadas;

        } catch (err) {
            console.error("Falha ao carregar histórico do chat:", err);
            return [];
        }
    };

    // quando vier usuarioAlvo (clicou em "Contato" no card)
    useEffect(() => {
        if (!usuarioAlvo) return;

        setAberto(true);

        // Função async interna para carregar o histórico
        const setupContato = async () => {
            // 1. Prepara o contato
            const novoContato = {
                id: usuarioAlvo.id,
                nome: usuarioAlvo.nome,
                foto: usuarioAlvo.foto ?? 'https://i.pravatar.cc/60?u=' + usuarioAlvo.id,
                status: 'online agora',
                naoLidas: 0,
                mensagens: [], // Começa vazio
            };

            // 2. Carrega o histórico da API
            const historico = await carregarHistorico(usuarioAlvo);
            novoContato.mensagens = historico;

            // 3. Adiciona ao estado
            setContatos((prev) => {
                const existe = prev.some((c) => c.id === usuarioAlvo.id);
                if (existe) {
                    // Se já existia, só atualiza as mensagens
                    return prev.map(c => c.id === usuarioAlvo.id ? { ...c, mensagens: historico } : c);
                }
                // Se não existia, adiciona
                return [...prev, novoContato];
            });

            // 4. Define como ativo
            setContatoAtivoId(usuarioAlvo.id);

            // 5. Preenche a mensagem de interesse (como antes)
            const precoFmt = usuarioAlvo.preco?.toLocaleString('pt-BR', { /*...*/ });
            setTexto(
                `Olá, fiquei interessado na skin: ${
                    usuarioAlvo.nome || 'Dragon Lore'
                }, valor: ${precoFmt || '—'}, podemos conversar ?`,
            );
        };

        setupContato();
    }, [usuarioAlvo]); //

    // NOVO: Função que é chamada pela inscrição do WebSocket
    const receberMensagem = (novaMensagem) => {
        // 'novaMensagem' é o ChatMessageResponse do backend

        // Descobre de quem é (remetente) ou para quem é (destinatário)
        const autorDaMensagem = novaMensagem.remetenteNome;
        const souEu = autorDaMensagem === user.nome;

        // O 'id' do outro usuário na conversa
        const outroUsuarioId = souEu
            ? contatos.find(c => c.nome === novaMensagem.destinatarioNome)?.id
            : contatos.find(c => c.nome === novaMensagem.remetenteNome)?.id;

        if (!outroUsuarioId) {
            // Se é uma conversa nova iniciada por outra pessoa, você precisaria
            // buscar os dados do usuário e adicionar um novo contato. (Lógica futura)
            console.warn("Recebi msg de um contato que não conheço:", novaMensagem);
            return;
        }

        const msgFormatada = {
            id: novaMensagem.id,
            autor: souEu ? 'eu' : 'ele',
            texto: novaMensagem.conteudo,
            timestamp: novaMensagem.timestamp,
        };

        setContatos((prev) =>
            prev.map((c) =>
                c.id === outroUsuarioId
                    ? {
                        ...c,
                        mensagens: [...c.mensagens, msgFormatada],
                        // Incrementa 'não lidas' SÓ se a janela estiver fechada ou em outra conversa
                        naoLidas: (aberto && contatoAtivoId === outroUsuarioId) ? 0 : (c.naoLidas || 0) + 1,
                    }
                    : c,
            ),
        );
    };

    function toggleChat() {
        setAberto((p) => !p);

        // 👇 ADICIONE ESTA LINHA DE VOLTA 👇
        // Se o chat estava aberto (aberto=true) e agora está fechando,
        // avise o componente pai.
        if (aberto && onFechar) {
            onFechar();
        }

        setContatoAtivoId(null);
    }

    // NOVO: Modificado para carregar histórico se necessário
    async function abrirConversa(c) {
        // Se as mensagens ainda não foram carregadas, carregue-as
        if (c.mensagens.length === 0) {
            const historico = await carregarHistorico(c);
            setContatos((prev) =>
                prev.map((x) => (x.id === c.id ? { ...x, mensagens: historico, naoLidas: 0 } : x)),
            );
        } else {
            // Se já tinha histórico, apenas limpa as não lidas
            setContatos((prev) =>
                prev.map((x) => (x.id === c.id ? { ...x, naoLidas: 0 } : x)),
            );
        }
        setContatoAtivoId(c.id);
    }

    // NOVO: Função de envio real via WebSocket
    function enviarMensagem(e) {
        e.preventDefault();
        const textoLimpo = texto.trim();
        if (!textoLimpo || !contatoAtivoId || !stompClientRef.current) return;

        // Este é o payload do ChatMessageRequest (backend)
        const payload = {
            destinatarioId: contatoAtivoId,
            conteudo: textoLimpo,
        };

        // Publica a mensagem para o endpoint do backend
        stompClientRef.current.publish({
            destination: '/app/chat/enviar',
            body: JSON.stringify(payload),
        });

        setTexto('');

        // REMOVIDO: Toda a lógica de 'setTimeout' e 'respostasMock'
    }

  return (
    <div className="chat-flutuante">
      {aberto ? (
        <div className="chat-janela chat-janela--rounded">
          {/* LISTA DE CONVERSAS */}
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
                    role="button"
                    tabIndex={0}
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
            // CONVERSA ATIVA
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
        // Ícone minimizado (pill)
        <button
          className="chat-icone chat-icone--pill"
          onClick={toggleChat}
          aria-label="Abrir mensagens"
        >
          {/* Esquerda: ícone + badge */}
          <span className="chat-icone__left">
            <span className="chat-icone__emoji">💬</span>
            {totalNaoLidas > 0 && (
              <span className="chat-icone__badge">{totalNaoLidas}</span>
            )}
          </span>

          {/* Centro: label */}
          <span className="chat-icone__label">Mensagens</span>

          {/* Direita: avatar do contato relevante */}
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
