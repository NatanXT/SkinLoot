// ======================================================
// Login.jsx
// Caminho sugerido: frontend/src/pages/login/Login.jsx
//
// - UI consistente com a Dashboard (usa Auth.css compartilhado)
// - Validação simples (e-mail + senha)
// - Mostrar/ocultar senha com ícone
// - "Lembrar-me", link de recuperação e botão OAuth (Steam placeholder)
// - Acessibilidade básica: aria-invalid, aria-describedby, noValidate
// ======================================================

import React, { useState } from "react"; // garante React no runtime clássico
import { useAuth } from "../../services/AuthContext"; // Importe o hook
import { useNavigate } from "react-router-dom"; // Para redirecionar após o login

import "./Auth.css";

/* ---------- Utilidades & Constantes ---------- */

// Regex simples para validar e-mail no client (no backend valide melhor)
const EMAIL_RE = /^\S+@\S+\.\S+$/;

// Estado inicial do formulário
const INITIAL_FORM = { email: "", senha: "", lembrar: false };

// Ícones inline (evita repetir SVGs no JSX principal)
const Eye = (
  <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
    <path
      fill="currentColor"
      d="M12 7c-5 0-9 5-9 5s4 5 9 5 9-5 9-5-4-5-9-5Zm0 8a3 3 0 1 1 .001-6.001A3 3 0 0 1 12 15Z"
    />
  </svg>
);
const EyeOff = (
  <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
    <path
      fill="currentColor"
      d="M2 5.27 3.28 4 20 20.72 18.73 22l-2.09-2.09C15.42 20.58 13.77 21 12 21 7 21 3 16 3 16s1.64-2.05 4.31-3.67L2 5.27Zm8.73 8.73a3 3 0 0 1-2.73-2.73l-2-2A11.15 11.15 0 0 0 3 16s4 5 9 5c1.77 0 3.42-.42 4.64-1.09l-2-2a3 3 0 0 1-3.91-3.91Zm1.27-6c5 0 9 5 9 5s-.79 1-2.12 2.22l-1.42-1.42C19.08 12.96 20 12 20 12s-4-5-9-5c-.68 0-1.34.08-1.98.22l-1.6-1.6C8.5 4.24 10.2 4 12 4Z"
    />
  </svg>
);

/* ---------- Componente ---------- */

export default function Login() {
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [showPass, setShowPass] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  const { login } = useAuth(); // Pegue a função de login do contexto
  const navigate = useNavigate();

  /* ----- Handlers ----- */

  // Atualiza campos de texto/checkbox de forma genérica
  const onChange = (e) => {
    const { name, type, value, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  // Regras mínimas de validação
  const validate = () => {
    const e = {};
    if (!EMAIL_RE.test(formData.email)) e.email = "Informe um e-mail válido.";
    if (!formData.senha || formData.senha.length < 6)
      e.senha = "Senha precisa ter ao menos 6 caracteres.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = async (ev) => {
    ev.preventDefault();
    setIsLoading(true);
    setApiError("");

    try {
      await login(formData.email, formData.senha);
      navigate("/vitrine");
    } catch (error) {
      // ✅ Lógica de erro robusta
      if (error.response) {
        // O backend respondeu com um erro (4xx, 5xx)
        setApiError(error.response.data.message || "E-mail ou senha incorretos.");
      } else if (error.request) {
        // A requisição foi feita, mas não houve resposta (backend offline)
        setApiError("Não foi possível conectar ao servidor. Tente novamente mais tarde.");
      } else {
        // Um erro ocorreu ao configurar a requisição
        setApiError("Ocorreu um erro inesperado. Tente novamente.");
      }
      console.error("Falha no login:", error);
    } finally {
      setIsLoading(false);
    }
  };

  /* ----- Render ----- */

  return (
    <div className="auth-root">
      <div className="auth-card">
        {/* Marca / Logo */}
        <div className="auth-brand">
          <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden>
            <path
              fill="currentColor"
              d="M12 2 2 7l10 5 10-5-10-5Zm0 7L2 4v13l10 5 10-5V4l-10 5Z"
            />
          </svg>
        <span>SkinLoot</span>
        </div>

        <h1 className="auth-title">Entrar</h1>
        <p className="auth-subtitle">
          Bem-vindo de volta! Acesse sua conta para anunciar e favoritar skins.
        </p>

        <form className="auth-form" onSubmit={onSubmit} noValidate>
          {/* E-mail */}
          <div className="field">
            <label htmlFor="email">E-mail</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="voce@email.com"
              value={formData.email}
              onChange={onChange}
              required
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? "err-email" : undefined}
            />
            {errors.email && (
              <span id="err-email" className="field__error">
                {errors.email}
              </span>
            )}
          </div>

          {/* Senha com botão de mostrar/ocultar */}
          <div className="field">
            <label htmlFor="senha">Senha</label>
            <div className="input-pass">
              <input
                id="senha"
                name="senha"
                type={showPass ? "text" : "password"}
                placeholder="••••••••"
                value={formData.senha}
                onChange={onChange}
                required
                aria-invalid={!!errors.senha}
                aria-describedby={errors.senha ? "err-senha" : undefined}
              />
              <button
                type="button"
                className="toggle"
                onClick={() => setShowPass((v) => !v)}
                aria-label={showPass ? "Ocultar senha" : "Mostrar senha"}
              >
                {showPass ? Eye : EyeOff}
              </button>
            </div>
            {errors.senha && (
              <span id="err-senha" className="field__error">
                {errors.senha}
              </span>
            )}
          </div>

          {/* Lembrar / Esqueci */}
          <div className="form-row">
            <label className="check">
              <input
                type="checkbox"
                name="lembrar"
                checked={formData.lembrar}
                onChange={onChange}
              />
              <span>Lembrar-me</span>
            </label>
            <a className="link" href="#">Esqueci minha senha</a>
          </div>

          {/* CTA principal */}
          <button type="submit" className="btn btn--primary btn--full">
            Entrar
          </button>

          {/* Alternativa OAuth (placeholder Steam) */}
          <div className="oauth">
            <button type="button" className="btn btn--ghost btn--full">
              <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
                <circle cx="12" cy="12" r="9" fill="currentColor" opacity=".15" />
                <path fill="currentColor" d="M8 13.5 5 12l3-1.5L12 7l4 2.5 3 1.5-3 1.5L12 17z" />
              </svg>
              <span>Entrar com Steam</span>
            </button>
          </div>

          {/* Link para cadastro */}
          <p className="switch">
            Não tem conta?{" "}
            <a className="link" href="/cadastro">
              Crie agora
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}
