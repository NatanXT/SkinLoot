import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import AuthBrand from '../../components/logo/AuthBrand';
import './AuthReset.css';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setMsg('');
    setError('');
    if (!email) return setError('Informe seu e-mail');

    try {
      setLoading(true);
      await axios.post('http://localhost:8080/auth/forgot-password', { email });
      setMsg('Se este e-mail estiver cadastrado, enviaremos instruções.');
    } catch (err) {
      setError('Não foi possível enviar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-root">
      <div className="auth-card">
        <AuthBrand />
        <h1 className="auth-title">Recuperar senha</h1>
        <p className="auth-subtitle">
          Informe seu e-mail para receber o link de redefinição.
        </p>

        {msg && <div className="api-success-message">{msg}</div>}
        {error && <div className="api-error-message">{error}</div>}

        <form className="auth-form" onSubmit={onSubmit}>
          <div className="field">
            <label htmlFor="email">E-mail</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="voce@email.com"
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn--primary btn--full"
            disabled={loading}
          >
            {loading ? 'Enviando...' : 'Enviar link'}
          </button>
        </form>

        <p className="switch">
          Lembrou?{' '}
          <Link className="link" to="/login">
            Voltar ao login
          </Link>
        </p>
      </div>
    </div>
  );
}
