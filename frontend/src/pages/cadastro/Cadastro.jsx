// ======================================================
// Cadastro.jsx
// Caminho sugerido: frontend/src/pages/cadastro/Cadastro.jsx
//
// - UI consistente com a dashboard (usa Auth.css compartilhado)
// - Validação client-side simples (nome, e-mail, senha, termos)
// - Medidor de força de senha (0..4)
// - Mostrar/ocultar senha (dois campos)
// - Form sem submit nativo do HTML5 (noValidate) para exibir erros próprios
// ======================================================

import { useMemo, useState } from "react";
import { useAuth } from "../../services/AuthContext";
import { useNavigate } from "react-router-dom";

// Ajuste este import conforme sua estrutura.
// Ex.: se Cadastro.jsx estiver em /pages/cadastro, use "../login/Auth.css"
import "../../pages/login/Auth.css";

/* ---------- Constantes & utilitários ---------- */

// Regex simples e suficiente para validar e-mail no client.
// (No backend faça validação mais robusta)
const EMAIL_RE = /^\S+@\S+\.\S+$/;

/** Retorna um score de força de senha entre 0 e 4 */
function getPasswordStrength(pwd = "") {
  let score = 0;
  if (pwd.length >= 8) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[a-z]/.test(pwd)) score++;
  if (/\d/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  return Math.min(score, 4);
}

/** Estado inicial do formulário */
const INITIAL_FORM = {
  nome: "",
  email: "",
  senha: "",
  confirmarSenha: "",
  aceitar: false,
  genero: "MASCULINO", // Valor padrão
};

export default function Cadastro() {
  /* ---------- State ---------- */
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [showPass, setShowPass] = useState({ s1: false, s2: false });
  const [errors, setErrors] = useState({});
  const [isLoading,setIsLoading] = useState(false);
  const [apiError,setApiError] = useState("");

  /* ---------- Derivados ---------- */
  const strength = useMemo(() => getPasswordStrength(formData.senha), [formData.senha]);

  /* ---------- Handlers ---------- */

  /** Atualiza campos de texto/checkbox de forma genérica */
  const onChange = (e) => {
    const { name, type, value, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  /** Alterna visibilidade dos campos de senha */
  const toggleShow = (key) => {
    setShowPass((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  /** Validação simples de campos obrigatórios */
  const validate = () => {
    const e = {};
    if (!formData.nome.trim()) e.nome = "Informe seu nome.";
    if (!EMAIL_RE.test(formData.email)) e.email = "Informe um e-mail válido.";
    if ((formData.senha || "").length < 8) e.senha = "Use ao menos 8 caracteres.";
    if (formData.senha !== formData.confirmarSenha)
      e.confirmarSenha = "As senhas não coincidem.";
    if (!formData.aceitar) e.aceitar = "Você precisa aceitar os termos.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  /** Envio (substitua pelo POST ao seu backend) */
  const onSubmit = (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    // TODO: integrar com sua API (ex.: fetch/axios para Spring Boot)
    console.log("Cadastro enviado:", formData);
    alert("Cadastro realizado com sucesso!");
    // Opcional: resetar formulário
    // setFormData(INITIAL_FORM);
  };

  /* ---------- Render ---------- */
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

        <h1 className="auth-title">Criar conta</h1>
        <p className="auth-subtitle">
          Cadastre-se para anunciar, favoritar e falar com vendedores.
        </p>

        <form className="auth-form" onSubmit={onSubmit} noValidate>
          {/* Nome */}
          <div className="field">
            <label htmlFor="nome">Nome</label>
            <input
              id="nome"
              name="nome"
              type="text"
              placeholder="Seu nome"
              value={formData.nome}
              onChange={onChange}
              required
            />
            {errors.nome && <span className="field__error">{errors.nome}</span>}
          </div>

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
            />
            {errors.email && <span className="field__error">{errors.email}</span>}
          </div>

          {/* Senha (com toggle + força) */}
          <div className="field">
            <label htmlFor="senha">Senha</label>
            <div className="input-pass">
              <input
                id="senha"
                name="senha"
                type={showPass.s1 ? "text" : "password"}
                placeholder="Mínimo 8 caracteres"
                value={formData.senha}
                onChange={onChange}
                required
                aria-invalid={!!errors.senha}
              />
              <button
                type="button"
                className="toggle"
                onClick={() => toggleShow("s1")}
                aria-label={showPass.s1 ? "Ocultar senha" : "Mostrar senha"}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
                  <path
                    fill="currentColor"
                    d="M12 7c-5 0-9 5-9 5s4 5 9 5 9-5 9-5-4-5-9-5Zm0 8a3 3 0 1 1 .001-6.001A3 3 0 0 1 12 15Z"
                  />
                </svg>
              </button>
            </div>
            {errors.senha && <span className="field__error">{errors.senha}</span>}

            {/* Medidor de força (apenas visual) */}
            <div className="pass-strength" aria-hidden>
              <div className={`bar ${strength >= 1 ? "on" : ""}`} />
              <div className={`bar ${strength >= 2 ? "on" : ""}`} />
              <div className={`bar ${strength >= 3 ? "on" : ""}`} />
              <div className={`bar ${strength >= 4 ? "on" : ""}`} />
            </div>
          </div>

          {/* Confirmar senha (com toggle) */}
          <div className="field">
            <label htmlFor="confirmarSenha">Confirmar senha</label>
            <div className="input-pass">
              <input
                id="confirmarSenha"
                name="confirmarSenha"
                type={showPass.s2 ? "text" : "password"}
                placeholder="Repita sua senha"
                value={formData.confirmarSenha}
                onChange={onChange}
                required
                aria-invalid={!!errors.confirmarSenha}
              />
              <button
                type="button"
                className="toggle"
                onClick={() => toggleShow("s2")}
                aria-label={showPass.s2 ? "Ocultar senha" : "Mostrar senha"}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
                  <path
                    fill="currentColor"
                    d="M12 7c-5 0-9 5-9 5s4 5 9 5 9-5 9-5-4-5-9-5Zm0 8a3 3 0 1 1 .001-6.001A3 3 0 0 1 12 15Z"
                  />
                </svg>
              </button>
            </div>
            {errors.confirmarSenha && (
              <span className="field__error">{errors.confirmarSenha}</span>
            )}
          </div>

          {/* Aceite de termos */}
          <label className="check" style={{ marginTop: 6 }}>
            <input
              type="checkbox"
              name="aceitar"
              checked={formData.aceitar}
              onChange={onChange}
            />
            <span>
              Li e aceito os{" "}
              <a className="link" href="#">
                termos de uso
              </a>
            </span>
          </label>
          {errors.aceitar && <span className="field__error">{errors.aceitar}</span>}

          {/* CTA principal */}
          <button type="submit" className="btn btn--primary btn--full">
            Criar conta
          </button>

          {/* Alternância para login */}
          <p className="switch">
            Já tem conta?{" "}
            <a className="link" href="/login">
              Entrar
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}
