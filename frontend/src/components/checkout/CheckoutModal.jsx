// ========================================================================
// CheckoutModal.jsx
// ------------------------------------------------------------------------
// Modal interno usado dentro da modal de "Renovar" e "Upgrade".
// Possui três etapas:
//
// 1) Resumo do Plano
// 2) Seleção do método de pagamento (Cartão / PIX)
// 3) Pagamento e Confirmação
//
// Tudo é 100% mockado, porém com UX realista:
// - Geração de QRCode simulado
// - Validação básica de cartão fake
// - Delay com loading
// - Tela de confirmação
//
// Observação: nenhum texto menciona "mock".
// ========================================================================

import React, { useEffect, useState } from "react";
import "./CheckoutModal.css";

export default function CheckoutModal({
  open,
  onClose,
  plano,
  variante,
  onConfirmar,
}) {
  if (!open) return null;

  const precos = {
    gratuito: { mensal: 0, trimestral: 0, anual: 0 },
    intermediario: { mensal: 19.9, trimestral: 54.9, anual: 199.9 },
    plus: { mensal: 39.9, trimestral: 109.9, anual: 399.9 },
  };

  const [etapa, setEtapa] = useState(1);

  // Dados de pagamento
  const [metodo, setMetodo] = useState("");
  const [card, setCard] = useState({
    number: "",
    name: "",
    cvv: "",
    venc: "",
  });

  // Loader e confirmação
  const [processando, setProcessando] = useState(false);
  const [confirmado, setConfirmado] = useState(false);

  // PIX
  const [qrCode, setQrCode] = useState("");

  useEffect(() => {
    if (metodo === "pix") {
      const r = Math.random().toString(36).substring(2);
      setQrCode(`000201PIX-SKINLOOT-CODE-${r}`);
    }
  }, [metodo]);

  function formatCurrency(v) {
    return v.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 2,
    });
  }

  function handleAvancar() {
    if (etapa === 1) setEtapa(2);
    else if (etapa === 2 && metodo) setEtapa(3);
  }

  function validarCartao() {
    return (
      card.number.trim().length >= 12 &&
      card.name.trim().length >= 3 &&
      card.cvv.trim().length >= 3 &&
      card.venc.trim().length >= 4
    );
  }

  function handlePagar() {
    setProcessando(true);

    setTimeout(() => {
      setProcessando(false);
      setConfirmado(true);

      setTimeout(() => {
        onConfirmar(plano);
        onClose();
      }, 1800);
    }, 1500);
  }

  return (
    <div className="checkout-overlay">
      <div className="checkout-modal">
        <button className="checkout-close" onClick={onClose}>
          ✕
        </button>

        {/* ---------------------- ETAPA 1 ---------------------- */}
        {etapa === 1 && (
          <div className="checkout-step">
            <h2>Confirmar Plano</h2>
            <p className="checkout-subtitle">
              Você está prestes a ativar o plano <strong>{plano}</strong>.
            </p>

            <div className="checkout-resumo">
              <span>Tipo escolhido:</span>
              <strong>{variante}</strong>

              <span>Valor:</span>
              <strong>
                {formatCurrency(precos[plano][variante])} / {variante}
              </strong>
            </div>

            <button
              className="btn btn--primary full"
              onClick={handleAvancar}
            >
              Continuar
            </button>
          </div>
        )}

        {/* ---------------------- ETAPA 2 ---------------------- */}
        {etapa === 2 && (
          <div className="checkout-step">
            <h2>Forma de Pagamento</h2>
            <p className="checkout-subtitle">
              Selecione o método desejado para prosseguir.
            </p>

            <div className="checkout-metodos">
              <button
                className={`checkout-metodo ${
                  metodo === "cartao" ? "active" : ""
                }`}
                onClick={() => setMetodo("cartao")}
              >
                Cartão de Crédito
              </button>

              <button
                className={`checkout-metodo ${
                  metodo === "pix" ? "active" : ""
                }`}
                onClick={() => setMetodo("pix")}
              >
                PIX
              </button>
            </div>

            <button
              className="btn btn--primary full"
              disabled={!metodo}
              onClick={handleAvancar}
            >
              Avançar
            </button>
          </div>
        )}

        {/* ---------------------- ETAPA 3 ---------------------- */}
        {etapa === 3 && !confirmado && (
          <div className="checkout-step">
            <h2>Pagamento</h2>

            {/* ---------- Cartão ---------- */}
            {metodo === "cartao" && (
              <div className="card-form">
                <label>Número do Cartão</label>
                <input
                  maxLength={19}
                  placeholder="0000 0000 0000 0000"
                  value={card.number}
                  onChange={(e) =>
                    setCard({ ...card, number: e.target.value })
                  }
                />

                <label>Nome impresso no cartão</label>
                <input
                  placeholder="JOÃO DA SILVA"
                  value={card.name}
                  onChange={(e) =>
                    setCard({ ...card, name: e.target.value })
                  }
                />

                <div className="card-row">
                  <div>
                    <label>Validade</label>
                    <input
                      placeholder="MM/AA"
                      maxLength={5}
                      value={card.venc}
                      onChange={(e) =>
                        setCard({ ...card, venc: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <label>CVV</label>
                    <input
                      placeholder="000"
                      maxLength={4}
                      value={card.cvv}
                      onChange={(e) =>
                        setCard({ ...card, cvv: e.target.value })
                      }
                    />
                  </div>
                </div>

                <button
                  className="btn btn--primary full"
                  disabled={!validarCartao() || processando}
                  onClick={handlePagar}
                >
                  {processando ? "Processando..." : "Pagar"}
                </button>
              </div>
            )}

            {/* ---------- PIX ---------- */}
            {metodo === "pix" && (
              <div className="pix-box">
                <p>Escaneie o código abaixo:</p>

                <div className="pix-qrcode">
                  {qrCode.split("").map((c, i) => (
                    <span key={i}>{c}</span>
                  ))}
                </div>

                <small>{qrCode}</small>

                <button
                  className="btn btn--primary full"
                  onClick={handlePagar}
                  disabled={processando}
                >
                  {processando ? "Aguardando confirmação..." : "Paguei"}
                </button>
              </div>
            )}
          </div>
        )}

        {/* ---------------------- CONFIRMAÇÃO ---------------------- */}
        {confirmado && (
          <div className="checkout-step checkout-confirmado">
            <h2>Pagamento confirmado</h2>
            <p>Seu plano foi ativado com sucesso.</p>
            <div className="checkmark">✔</div>
          </div>
        )}
      </div>
    </div>
  );
}
