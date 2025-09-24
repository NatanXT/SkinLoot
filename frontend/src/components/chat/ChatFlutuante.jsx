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

// Respostas mock para simular o outro lado (remova quando integrar com backend)
const respostasMock = [
  'Oi, tudo bem! Vamos conversar sim.',
  'Podemos ver, me fale sua proposta.',
  'Achei interessante, nos falamos mais depois.',
];

export default function ChatFlutuante({ usuarioAlvo, onFechar }) {
  // controla janela aberta/fechada
  const [aberto, setAberto] = useState(false);

  // contatos existentes: [{id, nome, foto, status, naoLidas, mensagens: [{id, autor, texto}], ...}]
  const [contatos, setContatos] = useState([]);

  // id do contato ativo (evita problemas de referência)
  const [contatoAtivoId, setContatoAtivoId] = useState(null);

  // texto do input
  const [texto, setTexto] = useState('');

  // ref da área de mensagens para auto-scroll
  const mensagensRef = useRef(null);

  // contato ativo sempre atualizado
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

  // auto-scroll quando troca conversa / chegam msgs
  useEffect(() => {
    if (!mensagensRef.current) return;
    mensagensRef.current.scrollTop = mensagensRef.current.scrollHeight;
  }, [contatoAtivoId, contatos]);

  // quando vier usuarioAlvo (clicou em "Contato" no card)
  useEffect(() => {
    if (!usuarioAlvo) return;

    setAberto(true);

    setContatos((prev) => {
      const existe = prev.some((c) => c.id === usuarioAlvo.id);
      if (existe) return prev;
      const novo = {
        id: usuarioAlvo.id,
        nome: usuarioAlvo.nome,
        foto:
          usuarioAlvo.foto ?? 'https://i.pravatar.cc/60?u=' + usuarioAlvo.id,
        status: 'online agora',
        naoLidas: 0,
        mensagens: [],
      };
      return [...prev, novo];
    });

    setContatoAtivoId(usuarioAlvo.id);

    const precoFmt = usuarioAlvo.preco?.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    setTexto(
      `Olá, fiquei interessado na skin: ${
        usuarioAlvo.nome || 'Dragon Lore'
      }, valor: ${precoFmt || '—'}, podemos conversar ?`,
    );
  }, [usuarioAlvo]);

  function toggleChat() {
    setAberto((p) => !p);
    if (aberto && onFechar) onFechar();
    setContatoAtivoId(null); // ao fechar, volta para a lista
  }

  function abrirConversa(c) {
    setContatoAtivoId(c.id);
    setContatos((prev) =>
      prev.map((x) => (x.id === c.id ? { ...x, naoLidas: 0 } : x)),
    );
  }

  function enviarMensagem(e) {
    e.preventDefault();
    const textoLimpo = texto.trim();
    if (!textoLimpo || !contatoAtivoId) return;

    const targetId = contatoAtivoId; // captura no momento do envio
    const novaMsg = { id: Date.now(), autor: 'eu', texto: textoLimpo };

    setContatos((prev) =>
      prev.map((c) =>
        c.id === targetId ? { ...c, mensagens: [...c.mensagens, novaMsg] } : c,
      ),
    );
    setTexto('');

    // mock de respostas automáticas
    respostasMock.forEach((res, i) => {
      setTimeout(() => {
        setContatos((prev) =>
          prev.map((c) =>
            c.id === targetId
              ? {
                  ...c,
                  mensagens: [
                    ...c.mensagens,
                    { id: Date.now() + i, autor: 'ele', texto: res },
                  ],
                  naoLidas:
                    aberto && contatoAtivoId === targetId
                      ? c.naoLidas
                      : (c.naoLidas || 0) + 1,
                }
              : c,
          ),
        );
      }, 1200 * (i + 1));
    });
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
