// ==========================================================
// ToastContext.jsx
// ----------------------------------------------------------
// Contexto global para exibir notificações do tipo "toast".
// Inclui provider, hook e container automático de exibição.
// ==========================================================

import { createContext, useContext, useState, useCallback } from 'react';
import './ToastContext.css';

const ToastContext = createContext();

/**
 * Provider global para o sistema de notificações.
 * Envolve a aplicação e exibe mensagens automaticamente.
 */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  /**
   * Adiciona um novo toast (info, success ou error).
   * @param {string} msg - Mensagem exibida no toast
   * @param {'info'|'success'|'error'} tipo - Tipo de notificação
   */
  const addToast = useCallback((msg, tipo = 'info') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, msg, tipo }]);

    // Remove automaticamente após 3 segundos
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}

      {/* Container de toasts visíveis */}
      <div className="toast-container">
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast--${t.tipo}`}>
            {t.msg}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

/**
 * Hook para uso simplificado dentro de componentes.
 * Exemplo: const { addToast } = useToast();
 */
export const useToast = () => useContext(ToastContext);
