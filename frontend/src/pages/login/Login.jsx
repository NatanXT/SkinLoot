// frontend/src/pages/auth/Login.jsx
import React, { useState } from 'react';
import { useAuth } from '../../services/AuthContext';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import './Auth.css';
import AuthBrand from '../../components/logo/AuthBrand';

// Wrapper da API e storage (tokens)
import api, { storage } from '../../services/api.js';

// E-mail simples
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const INITIAL_FORM = { email: '', senha: '', lembrar: false };

// Flags/credenciais do DEV LOGIN (controle por .env)
// Em desenvolvimento, crie/edite .env.local e defina: VITE_ENABLE_DEV_LOGIN=true
const DEV_ENABLED = import.meta.env.VITE_ENABLE_DEV_LOGIN === 'true';
const DEV_EMAIL = 'natan@email.com';
const DEV_PASSWORD = '123';

// Ícones olho
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

// Ícone do Google (marca multicolor simples em SVG)
const GoogleIcon = (
  <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
    <path
      fill="#EA4335"
      d="M12 10.2v3.9h5.5c-.24 1.4-1.67 4.1-5.5 4.1A6.4 6.4 0 1 1 12 5.6c1.82 0 3.05.78 3.75 1.46l2.55-2.46C16.72 3.1 14.6 2.2 12 2.2 6.93 2.2 2.8 6.33 2.8 11.4S6.93 20.6 12 20.6c6.04 0 8-4.24 8-6.3 0-.42-.04-.7-.09-1.0H12z"
    />
    <path
      fill="#4285F4"
      d="M21.91 12.3c.06.3.09.58.09 1 0 2.06-1.96 6.3-8 6.3-5.07 0-9.2-4.13-9.2-9.2S6.93 1.2 12 1.2c2.6 0 4.72.9 6.3 2.4l-2.55 2.46C14.05 5.38 12.82 4.6 11 4.6A6.4 6.4 0 0 0 4.6 11c0 3.53 2.87 6.4 6.4 6.4 3.83 0 5.26-2.7 5.5-4.1H12v-3.9h9.91z"
      opacity=".2"
    />
    <path
      fill="#FBBC05"
      d="M4.6 11A6.4 6.4 0 0 1 11 4.6c1.82 0 3.05.78 3.75 1.46l2.55-2.46C16.72 3.1 14.6 2.2 12 2.2 6.93 2.2 2.8 6.33 2.8 11.4c0 1.73.45 3.36 1.24 4.76l3.06-2.37A6.37 6.37 0 0 1 4.6 11z"
      opacity=".35"
    />
    <path
      fill="#34A853"
      d="M12 20.6c3.83 0 6.24-2.02 7.13-4.39l-3.03-2.35c-.68 1.99-2.28 3.34-4.1 3.34-2.53 0-4.66-1.7-5.42-3.98l-3.06 2.37C4.62 18.62 7.98 20.6 12 20.6z"
    />
  </svg>
);

export default function Login() {
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [showPass, setShowPass] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  // seu AuthContext
  const { login, setUser } = useAuth();
  const navigate = useNavigate();
  const [qs] = useSearchParams();

  const onChange = (e) => {
    const { name, type, value, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const validate = () => {
    const e = {};
    if (!EMAIL_RE.test(formData.email)) e.email = 'Informe um e-mail válido.';
    if (!formData.senha || formData.senha.length < 8)
      e.senha = 'Senha precisa ter ao menos 8 caracteres.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // Handler do OAuth Google: redireciona para o backend
  const handleGoogleLogin = () => {
    // Tenta usar a baseURL do Axios; se não houver, usa localhost:8080
    const base =
      api?.defaults?.baseURL ||
      import.meta.env.VITE_API_URL ||
      'http://localhost:8080';
    const redirect = `${base.replace(/\/+$/, '')}/auth/google`;
    window.location.href = redirect;
  };

  const onSubmit = async (ev) => {
    ev.preventDefault();
    setApiError('');

    // DEV LOGIN (somente dentro do onSubmit)
    if (
      DEV_ENABLED &&
      formData.email.trim() === DEV_EMAIL &&
      formData.senha === DEV_PASSWORD
    ) {
      try {
        setIsLoading(true);

        // Onde salvar os tokens mock (localStorage x sessionStorage)
        storage.remember = !!formData.lembrar;
        storage.access = 'dev-access-token';
        storage.refresh = 'dev-refresh-token';

        // Semear/atualizar o usuário no backend DEV
        const devUserSeed = {
          email: DEV_EMAIL,
          nome: 'Natan (DEV)',
          plano: 'plus',
        };

        const seeded = {
          id: 'dev-user-id',
          ...devUserSeed,
          criadoEm: new Date().toISOString(),
        };
        if (typeof setUser === 'function') setUser(seeded);
        localStorage.setItem('auth_user', JSON.stringify(seeded));

        const backTo = qs.get('from') || '/';
        navigate(backTo, { replace: true });
        return;
      } catch (err) {
        console.error('Falha no DEV LOGIN:', err);
        setApiError('Falha ao efetuar login de desenvolvimento.');
      } finally {
        setIsLoading(false);
      }
    }

    // Fluxo NORMAL
    if (!validate()) return;

    setIsLoading(true);
    try {
      await login(formData.email.trim(), formData.senha, formData.lembrar);
      const backTo = qs.get('from') || '/';
      navigate(backTo, { replace: true });
    } catch (error) {
      if (error.response)
        setApiError(
          error.response.data?.message || 'E-mail ou senha incorretos.',
        );
      else if (error.request)
        setApiError(
          'Não foi possível conectar ao servidor. Tente novamente mais tarde.',
        );
      else setApiError('Ocorreu um erro inesperado. Tente novamente.');
      console.error('Falha no login:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-root">
      <div className="auth-card">
        <AuthBrand />
        <h1 className="auth-title">Entrar</h1>
        <p className="auth-subtitle">
          Bem-vindo de volta! Acesse sua conta para anunciar e favoritar skins.
        </p>

        {DEV_ENABLED && (
          <div
            style={{
              marginBottom: 12,
              padding: '8px 10px',
              borderRadius: 8,
              background: '#102a12',
              color: '#8eff9b',
              fontSize: 14,
              border: '1px solid #1d5e24',
            }}
          >
            DEV LOGIN ativo — use <strong>{DEV_EMAIL}</strong> /{' '}
            <strong>{DEV_PASSWORD}</strong>
          </div>
        )}

        <form className="auth-form" onSubmit={onSubmit} noValidate>
          {apiError && <div className="api-error-message">{apiError}</div>}

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
            />
            {errors.email && (
              <span className="field__error">{errors.email}</span>
            )}
          </div>

          <div className="field">
            <label htmlFor="senha">Senha</label>
            <div className="input-pass">
              <input
                id="senha"
                name="senha"
                type={showPass ? 'text' : 'password'}
                placeholder="••••••••"
                value={formData.senha}
                onChange={onChange}
                required
                aria-invalid={!!errors.senha}
                minLength={8}
                maxLength={16}
              />
              <button
                type="button"
                className="toggle"
                onClick={() => setShowPass((v) => !v)}
                aria-label={showPass ? 'Ocultar senha' : 'Mostrar senha'}
              >
                {showPass ? Eye : EyeOff}
              </button>
            </div>
            {errors.senha && (
              <span className="field__error">{errors.senha}</span>
            )}
          </div>

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
            <Link className="link" to={'/forgot-password'}>
              Esqueci minha senha
            </Link>
          </div>

          <button
            type="submit"
            className="btn btn--primary btn--full"
            disabled={isLoading}
          >
            {isLoading ? 'Entrando...' : 'Entrar'}
          </button>

          {/* OAuth Google
          <div className="oauth">
            <button
              type="button"
              className="btn btn--ghost btn--full"
              onClick={handleGoogleLogin}
              aria-label="Entrar com Google"
            >
              {GoogleIcon}
              <span>Entrar com Google</span>
            </button>
          </div> */}

          <p className="switch">
            Não tem conta?{' '}
            <a className="link" href="/cadastro">
              Crie agora
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}
