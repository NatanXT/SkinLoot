import { useMemo, useState } from "react";
import "../../pages/login/Auth.css";

export default function Cadastro() {
  const [formData, setFormData] = useState({
    nome: "", email: "", senha: "", confirmarSenha: "", aceitar: false,
  });
  const [showPass, setShowPass] = useState({ s1: false, s2: false });
  const [errors, setErrors] = useState({});

  const onChange = (e) => {
    const { name, type, value, checked } = e.target;
    setFormData((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
  };

  const strength = useMemo(() => {
    const s = formData.senha || "";
    let score = 0;
    if (s.length >= 8) score++;
    if (/[A-Z]/.test(s)) score++;
    if (/[a-z]/.test(s)) score++;
    if (/\d/.test(s)) score++;
    if (/[^A-Za-z0-9]/.test(s)) score++;
    return Math.min(score, 4); // 0..4
  }, [formData.senha]);

  const validate = () => {
    const e = {};
    if (!formData.nome.trim()) e.nome = "Informe seu nome.";
    if (!formData.email.match(/^\S+@\S+\.\S+$/)) e.email = "Informe um e-mail válido.";
    if ((formData.senha || "").length < 8) e.senha = "Use ao menos 8 caracteres.";
    if (formData.senha !== formData.confirmarSenha) e.confirmarSenha = "As senhas não coincidem.";
    if (!formData.aceitar) e.aceitar = "Você precisa aceitar os termos.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    // chamada ao backend (Spring Boot) aqui
    console.log("Cadastro enviado:", formData);
    alert("Cadastro realizado com sucesso!");
  };

  return (
    <div className="auth-root">
      <div className="auth-card">
        <div className="auth-brand">
          <svg width="22" height="22" viewBox="0 0 24 24"><path fill="currentColor" d="M12 2 2 7l10 5 10-5-10-5Zm0 7L2 4v13l10 5 10-5V4l-10 5Z"/></svg>
          <span>SkinLoot</span>
        </div>

        <h1 className="auth-title">Criar conta</h1>
        <p className="auth-subtitle">Cadastre-se para anunciar, favoritar e falar com vendedores.</p>

        <form className="auth-form" onSubmit={onSubmit} noValidate>
          <div className="field">
            <label htmlFor="nome">Nome</label>
            <input id="nome" name="nome" type="text" placeholder="Seu nome" value={formData.nome} onChange={onChange} required />
            {errors.nome && <span className="field__error">{errors.nome}</span>}
          </div>

          <div className="field">
            <label htmlFor="email">E-mail</label>
            <input id="email" name="email" type="email" placeholder="voce@email.com" value={formData.email} onChange={onChange} required />
            {errors.email && <span className="field__error">{errors.email}</span>}
          </div>

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
                onClick={() => setShowPass((p) => ({ ...p, s1: !p.s1 }))}
                aria-label={showPass.s1 ? "Ocultar senha" : "Mostrar senha"}
              >
                <svg width="18" height="18" viewBox="0 0 24 24"><path fill="currentColor" d="M12 7c-5 0-9 5-9 5s4 5 9 5 9-5 9-5-4-5-9-5Zm0 8a3 3 0 1 1 .001-6.001A3 3 0 0 1 12 15Z"/></svg>
              </button>
            </div>
            {errors.senha && <span className="field__error">{errors.senha}</span>}

            {/* medidor de força */}
            <div className="pass-strength" aria-hidden>
              <div className={`bar ${strength >= 1 ? "on" : ""}`}></div>
              <div className={`bar ${strength >= 2 ? "on" : ""}`}></div>
              <div className={`bar ${strength >= 3 ? "on" : ""}`}></div>
              <div className={`bar ${strength >= 4 ? "on" : ""}`}></div>
            </div>
          </div>

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
                onClick={() => setShowPass((p) => ({ ...p, s2: !p.s2 }))}
                aria-label={showPass.s2 ? "Ocultar senha" : "Mostrar senha"}
              >
                <svg width="18" height="18" viewBox="0 0 24 24"><path fill="currentColor" d="M12 7c-5 0-9 5-9 5s4 5 9 5 9-5 9-5-4-5-9-5Zm0 8a3 3 0 1 1 .001-6.001A3 3 0 0 1 12 15Z"/></svg>
              </button>
            </div>
            {errors.confirmarSenha && <span className="field__error">{errors.confirmarSenha}</span>}
          </div>

          <label className="check" style={{ marginTop: 6 }}>
            <input type="checkbox" name="aceitar" checked={formData.aceitar} onChange={onChange} />
            <span>Li e aceito os <a className="link" href="#">termos de uso</a></span>
          </label>
          {errors.aceitar && <span className="field__error">{errors.aceitar}</span>}

          <button type="submit" className="btn btn--primary btn--full">Criar conta</button>

          <p className="switch">
            Já tem conta? <a className="link" href="/login">Entrar</a>
          </p>
        </form>
      </div>
    </div>
  );
}
