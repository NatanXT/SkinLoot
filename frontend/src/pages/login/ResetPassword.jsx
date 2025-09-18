import React, { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import './AuthReset.css';
import AuthBrand from '../../components/logo/AuthBrand';

export default function ResetPassword() {
  const [qs] = useSearchParams();
  const token = qs.get('token');

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setMsg('');
    setError('');
    if (password !== confirm) return setError('As senhas não coincidem.');

    try {
      setLoading(true);
      await axios.post('http://localhost:8080/auth/reset-password', {
        token,
        password,
      });
      setMsg('Senha alterada com sucesso! Agora você pode entrar.');
    } catch (err) {
      setError('Token inválido ou expirado.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-root">
      <div className="auth-card">
        <AuthBrand />
        <h1 className="auth-title">Redefinir senha</h1>
        <p className="auth-subtitle">Escolha uma nova senha para sua conta.</p>

        {msg && <div className="api-success-message">{msg}</div>}
        {error && <div className="api-error-message">{error}</div>}

        <form className="auth-form" onSubmit={onSubmit}>
          <div className="field">
            <label htmlFor="password">Nova senha</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
            />
          </div>

          <div className="field">
            <label htmlFor="confirm">Confirmar senha</label>
            <input
              type="password"
              id="confirm"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              minLength={8}
            />
          </div>

          <button
            type="submit"
            className="btn btn--primary btn--full"
            disabled={loading}
          >
            {loading ? 'Salvando...' : 'Salvar nova senha'}
          </button>
        </form>

        <p className="switch">
          <Link className="link" to="/login">
            Voltar ao login
          </Link>
        </p>
      </div>
    </div>
  );
}
