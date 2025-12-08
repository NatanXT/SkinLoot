import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode'; // Correção da importação
import './CheckoutModal.css';

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
  const [metodo, setMetodo] = useState('');
  const [card, setCard] = useState({
    number: '',
    name: '',
    cvv: '',
    venc: '',
  });

  const [selectedPeriod, setSelectedPeriod] = useState('mensal'); // Seleção do tipo de plano
  const [parcelas, setParcelas] = useState(1); // número de parcelas
  const [parcelasAberto, setParcelasAberto] = useState(false); // dropdown customizado

  const [processando, setProcessando] = useState(false);
  const [confirmado, setConfirmado] = useState(false);
  const [erro, setErro] = useState(false); // Estado para erro (quando o tempo expirar)

  // PIX
  const [qrCode, setQrCode] = useState('');
  const [qrCodeImage, setQrCodeImage] = useState(''); // Imagem do QR Code gerado
  const [timer, setTimer] = useState(600); // 10 minutos em segundos (ajuste para 300 em produção)

  useEffect(() => {
    if (metodo === 'pix') {
      const r = Math.random().toString(36).substring(2);
      setQrCode(`000201PIX-SKINLOOT-CODE-${r}`);
      startTimer();
    }
  }, [metodo]);

  useEffect(() => {
    if (qrCode) {
      QRCode.toDataURL(qrCode).then(setQrCodeImage);
    }
  }, [qrCode]);

  // Função para iniciar o timer
  const startTimer = () => {
    const intervalId = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(intervalId); // Parar o timer quando chegar a zero
          setErro(true); // Exibe mensagem de erro
          setTimeout(() => {
            onClose(); // Fecha o modal após 1 segundo
          }, 1000);
          return 0;
        }
        return prev - 1;
      });
    }, 1000); // Decrementa a cada segundo
  };

  // Função para copiar o código PIX
  const handleCopyCode = () => {
    navigator.clipboard
      .writeText(qrCode)
      .then(() => {
        alert('Código PIX copiado para a área de transferência!');
      })
      .catch((err) => {
        console.error('Erro ao copiar código:', err);
      });
  };

  function formatCurrency(v) {
    return v.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
    });
  }

  function getValorAtual() {
    const base = precos[plano]?.[selectedPeriod] ?? 0;
    return base;
  }

  function handleAvancar() {
    if (etapa === 1) setEtapa(2);
    else if (etapa === 2 && metodo) setEtapa(3);
  }

  // Número do cartão: só dígitos, máximo 16, formatado em blocos de 4
  function handleNumeroCartaoChange(e) {
    const digitsOnly = e.target.value.replace(/\D/g, '').slice(0, 16);
    const formatted = digitsOnly.replace(/(.{4})/g, '$1 ').trim();
    setCard((prev) => ({ ...prev, number: formatted }));
  }

  // Validade: só dígitos, máximo 4, formata MM/AA
  function handleVencChange(e) {
    const digitsOnly = e.target.value.replace(/\D/g, '').slice(0, 4);
    let formatted = digitsOnly;

    if (digitsOnly.length >= 3) {
      formatted = `${digitsOnly.slice(0, 2)}/${digitsOnly.slice(2, 4)}`;
    }

    setCard((prev) => ({ ...prev, venc: formatted }));
  }

  // CVV: só dígitos, máximo 4
  function handleCvvChange(e) {
    const digitsOnly = e.target.value.replace(/\D/g, '').slice(0, 4);
    setCard((prev) => ({ ...prev, cvv: digitsOnly }));
  }

  function validarCartao() {
    const numeroLimpo = card.number.replace(/\D/g, '');
    const cvvLimpo = card.cvv.replace(/\D/g, '');
    const vencLimpo = card.venc.replace(/\D/g, '');

    if (numeroLimpo.length !== 16) return false;
    if (cvvLimpo.length < 3 || cvvLimpo.length > 4) return false;
    if (card.name.trim().length < 3) return false;

    if (vencLimpo.length !== 4) return false;
    const mes = parseInt(vencLimpo.slice(0, 2), 10);
    const ano = parseInt(vencLimpo.slice(2, 4), 10);

    if (Number.isNaN(mes) || Number.isNaN(ano)) return false;
    if (mes < 1 || mes > 12) return false;

    return true;
  }

  function handlePagar() {
    if (!validarCartao() && metodo === 'cartao') return;

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

  // Dados derivados para o preview do cartão
  const rawNumber = card.number.replace(/\D/g, '');
  const padded = (rawNumber + '••••••••••••••••').slice(0, 16);
  const maskedNumber = padded.replace(/(.{4})/g, '$1 ').trim();

  const cardName = card.name || 'NOME DO TITULAR';
  const cardVenc = card.venc || 'MM/AA';

  let bandeira = 'Cartão crédito';
  if (rawNumber.startsWith('4')) bandeira = 'Visa';
  else if (rawNumber.startsWith('5')) bandeira = 'Mastercard';

  const valorAtual = getValorAtual();
  const valorParcela = parcelas > 0 ? valorAtual / parcelas : valorAtual;

  const opcoesParcelas = [1, 2, 3, 4, 5, 6];

  function getLabelParcela(n) {
    const valor = n > 0 ? valorAtual / n : valorAtual;
    return `${n}x de ${formatCurrency(valor)} sem juros`;
  }

  return (
    <div className="checkout-overlay">
      <div className="checkout-modal">
        <button className="checkout-close" onClick={onClose}>
          ✕
        </button>

        {/*  ETAPA 1  */}
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
                {formatCurrency(valorAtual)} / {selectedPeriod}
              </strong>
            </div>

            <div className="checkout-resumo">
              <span>Selecione o período:</span>
              <div className="checkout-periodos">
                <button
                  className={`checkout-periodo ${
                    selectedPeriod === 'mensal' ? 'active' : ''
                  }`}
                  onClick={() => setSelectedPeriod('mensal')}
                >
                  Mensal
                </button>
                <button
                  className={`checkout-periodo ${
                    selectedPeriod === 'trimestral' ? 'active' : ''
                  }`}
                  onClick={() => setSelectedPeriod('trimestral')}
                >
                  Trimestral
                </button>
                <button
                  className={`checkout-periodo ${
                    selectedPeriod === 'anual' ? 'active' : ''
                  }`}
                  onClick={() => setSelectedPeriod('anual')}
                >
                  Anual
                </button>
              </div>
            </div>

            <button className="btn btn--primary full" onClick={handleAvancar}>
              Continuar
            </button>
          </div>
        )}

        {/*  ETAPA 2  */}
        {etapa === 2 && (
          <div className="checkout-step">
            <h2>Forma de Pagamento</h2>
            <p className="checkout-subtitle">
              Selecione o método desejado para prosseguir.
            </p>

            <div className="checkout-metodos">
              <button
                className={`checkout-metodo ${
                  metodo === 'cartao' ? 'active' : ''
                }`}
                onClick={() => setMetodo('cartao')}
              >
                Cartão de Crédito
              </button>

              <button
                className={`checkout-metodo ${
                  metodo === 'pix' ? 'active' : ''
                }`}
                onClick={() => setMetodo('pix')}
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

        {/*  ETAPA 3  */}
        {etapa === 3 && !confirmado && !erro && (
          <div className="checkout-step">
            <h2>Pagamento</h2>

            {/*  Cartão  */}
            {metodo === 'cartao' && (
              <div className="card-wrapper">
                {/* Preview do cartão */}
                <div className="card-preview">
                  <div className="card-preview-top">
                    <span>SkinLoot</span>
                    <span className="card-brand">{bandeira}</span>
                  </div>

                  <div className="card-chip" />

                  <div className="card-number">{maskedNumber}</div>

                  <div className="card-holder-row">
                    <div>
                      <span className="card-label">Titular</span>
                      <span className="card-value">{cardName}</span>
                    </div>
                    <div>
                      <span className="card-label">Validade</span>
                      <span className="card-value">{cardVenc}</span>
                    </div>
                  </div>

                  <div className="card-installments">
                    {parcelas}x de {formatCurrency(valorParcela)}{' '}
                    {parcelas > 1 && 'sem juros'}
                  </div>
                </div>

                {/* Formulário do cartão */}
                <div className="card-form">
                  <label>Número do Cartão</label>
                  <input
                    inputMode="numeric"
                    autoComplete="cc-number"
                    placeholder="0000 0000 0000 0000"
                    value={card.number}
                    onChange={handleNumeroCartaoChange}
                  />

                  <label>Nome impresso no cartão</label>
                  <input
                    placeholder="JOÃO DA SILVA"
                    value={card.name}
                    onChange={(e) => setCard({ ...card, name: e.target.value })}
                  />

                  <div className="card-row">
                    <div>
                      <label>Validade</label>
                      <input
                        inputMode="numeric"
                        autoComplete="cc-exp"
                        placeholder="MM/AA"
                        maxLength={5}
                        value={card.venc}
                        onChange={handleVencChange}
                      />
                    </div>

                    <div>
                      <label>CVV</label>
                      <input
                        inputMode="numeric"
                        autoComplete="cc-csc"
                        placeholder="000"
                        maxLength={4}
                        value={card.cvv}
                        onChange={handleCvvChange}
                      />
                    </div>
                  </div>

                  <label>Parcelas</label>
                  <div className="parcelas-select-wrapper">
                    <button
                      type="button"
                      className="parcelas-select-display"
                      onClick={() => setParcelasAberto((prev) => !prev)}
                    >
                      <span>{getLabelParcela(parcelas)}</span>
                      <span className="parcelas-select-arrow">▼</span>
                    </button>

                    {parcelasAberto && (
                      <div className="parcelas-dropdown">
                        {opcoesParcelas.map((n) => (
                          <button
                            type="button"
                            key={n}
                            className={`parcelas-option ${
                              parcelas === n ? 'active' : ''
                            }`}
                            onClick={() => {
                              setParcelas(n);
                              setParcelasAberto(false);
                            }}
                          >
                            {getLabelParcela(n)}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <button
                    className="btn btn--primary full"
                    disabled={!validarCartao() || processando}
                    onClick={handlePagar}
                  >
                    {processando ? 'Processando...' : 'Pagar'}
                  </button>
                </div>
              </div>
            )}

            {/*  PIX  */}
            {metodo === 'pix' && (
              <div className="pix-box">
                <p>Escaneie o código abaixo:</p>

                {/* QR Code gerado aqui */}
                <div className="pix-qrcode">
                  <img src={qrCodeImage} alt="QR Code" />
                </div>

                <small>{qrCode}</small>

                <div className="timer">
                  <p>
                    Tempo restante: {Math.floor(timer / 60)}:
                    {timer % 60 < 10 ? `0${timer % 60}` : timer % 60}
                  </p>
                </div>

                {/* Botão para copiar o código */}
                <button className="btn btn--secondary" onClick={handleCopyCode}>
                  Copiar código PIX
                </button>

                <button
                  className="btn btn--primary full"
                  onClick={handlePagar}
                  disabled={processando}
                >
                  {processando ? 'Aguardando confirmação...' : 'Paguei'}
                </button>
              </div>
            )}
          </div>
        )}

        {/*  MENSAGEM DE ERRO  */}
        {erro && (
          <div className="checkout-step checkout-error">
            <h2>Tempo expirado</h2>
            <p>O tempo para completar o pagamento expirou. Tente novamente.</p>
            <button className="btn btn--primary full" onClick={onClose}>
              Fechar
            </button>
          </div>
        )}

        {/*  CONFIRMAÇÃO  */}
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
