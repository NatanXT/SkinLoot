// Cadastro.jsx
import { useMemo, useState } from 'react';
import { useAuth } from '../../services/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import '../../pages/login/Auth.css';
import AuthBrand from '../../components/logo/AuthBrand';

/* -------------------- Regex & Constantes -------------------- */

// Nome: apenas letras (com acento), espaços e hífen
const NAME_RE = /^[A-Za-zÀ-ÖØ-öø-ÿ\s-]+$/;
const NAME_BLOCK_RE = /[^A-Za-zÀ-ÖØ-öø-ÿ\s-]/g;

// E-mail
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// Senha (Unicode-aware)
const PWD_LEN_MIN = 8;
const PWD_LEN_MAX = 16;
const RE_UPPER = /\p{Lu}/u; // pelo menos 1 maiúscula (qualquer idioma)
const RE_LOWER = /\p{Ll}/u; // pelo menos 1 minúscula
const RE_DIGIT = /\p{Nd}/u; // pelo menos 1 número
const RE_SPECIAL = /[^\p{L}\p{Nd}\s]/u; // pelo menos 1 especial (ignora espaço)

// Força visual
function getPasswordStrength(pwd = '') {
  let score = 0;
  if (RE_UPPER.test(pwd)) score++;
  if (RE_LOWER.test(pwd)) score++;
  if (RE_DIGIT.test(pwd)) score++;
  if (RE_SPECIAL.test(pwd)) score++;
  return Math.min(score, 4);
}

const INITIAL_FORM = {
  nome: '',
  email: '',
  senha: '',
  confirmarSenha: '',
  aceitar: false,
  genero: 'MASCULINO',
};

export default function Cadastro() {
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [showPass, setShowPass] = useState({ s1: false, s2: false });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const strength = useMemo(
    () => getPasswordStrength(formData.senha),
    [formData.senha],
  );

  const onChange = (e) => {
    const { name, type } = e.target;
    let { value, checked } = e.target;

    if (type === 'checkbox') {
      setFormData((prev) => ({ ...prev, [name]: checked }));
      return;
    }
    if (name === 'nome') value = value.replace(NAME_BLOCK_RE, '');
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const toggleShow = (key) =>
    setShowPass((prev) => ({ ...prev, [key]: !prev[key] }));

  const validate = () => {
    const e = {};
    const nome = (formData.nome || '').trim();
    const email = (formData.email || '').trim();
    const pwd = formData.senha || '';

    if (nome.length < 2) e.nome = 'Informe seu nome (mín. 2 letras).';
    else if (!NAME_RE.test(nome))
      e.nome = 'Use apenas letras, espaços ou hífen (sem números e símbolos).';

    if (!EMAIL_RE.test(email)) e.email = 'Informe um e-mail válido.';

    const pwdErrors = [];
    if (pwd.length < PWD_LEN_MIN || pwd.length > PWD_LEN_MAX)
      pwdErrors.push(`Use entre ${PWD_LEN_MIN} e ${PWD_LEN_MAX} caracteres.`);
    if (!RE_UPPER.test(pwd))
      pwdErrors.push('Inclua ao menos 1 letra maiúscula.');
    if (!RE_LOWER.test(pwd))
      pwdErrors.push('Inclua ao menos 1 letra minúscula.');
    if (!RE_DIGIT.test(pwd)) pwdErrors.push('Inclua ao menos 1 número.');
    if (!RE_SPECIAL.test(pwd))
      pwdErrors.push('Inclua ao menos 1 caractere especial.');

    if (pwdErrors.length) e.senha = pwdErrors.join(' ');
    if (formData.senha !== formData.confirmarSenha)
      e.confirmarSenha = 'As senhas não coincidem.';
    if (!formData.aceitar) e.aceitar = 'Você precisa aceitar os termos.';

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = async (ev) => {
    ev.preventDefault();
    setApiError('');
    if (!validate()) return;

    setIsLoading(true);
    try {
      await register(
        formData.nome.trim(),
        formData.email.trim(),
        formData.senha,
        formData.genero,
      );
      navigate('/dashboard', { replace: true });
    } catch (error) {
      if (error.response)
        setApiError(
          error.response.data?.message || 'Não foi possível criar a conta.',
        );
      else if (error.request)
        setApiError(
          'Não foi possível conectar ao servidor. Tente novamente mais tarde.',
        );
      else setApiError('Ocorreu um erro inesperado. Tente novamente.');
      console.error('Falha no cadastro:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-root">
      <div className="auth-card">
        {/* 🔗 Logo → "/" */}
        <AuthBrand />
        <h1 className="auth-title">Criar conta</h1>
        <p className="auth-subtitle">
          Cadastre-se para anunciar, favoritar e falar com vendedores.
        </p>

        <form className="auth-form" onSubmit={onSubmit} noValidate>
          {apiError && <div className="api-error-message">{apiError}</div>}

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
              aria-invalid={!!errors.nome}
              onPaste={(e) => {
                const txt = (e.clipboardData || window.clipboardData).getData(
                  'text',
                );
                if (!NAME_RE.test(txt)) e.preventDefault();
              }}
            />
            {errors.nome && <span className="field__error">{errors.nome}</span>}
          </div>

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
            <label htmlFor="genero">Gênero</label>
            <select
              id="genero"
              name="genero"
              value={formData.genero}
              onChange={onChange}
            >
              <option value="MASCULINO">Masculino</option>
              <option value="FEMININO">Feminino</option>
              <option value="OUTRO">Outro</option>
            </select>
          </div>

          <div className="field">
            <label htmlFor="senha">Senha</label>
            <div className="input-pass">
              <input
                id="senha"
                name="senha"
                type={showPass.s1 ? 'text' : 'password'}
                placeholder="8–16 (maiús, minús, número, especial)"
                value={formData.senha}
                onChange={onChange}
                required
                aria-invalid={!!errors.senha}
                minLength={PWD_LEN_MIN}
                maxLength={PWD_LEN_MAX}
                autoCapitalize="off"
                autoCorrect="off"
                spellCheck={false}
                inputMode="text"
                autoComplete="new-password"
              />
              <button
                type="button"
                className="toggle"
                onClick={() => toggleShow('s1')}
                aria-label={showPass.s1 ? 'Ocultar senha' : 'Mostrar senha'}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
                  <path
                    fill="currentColor"
                    d="M12 7c-5 0-9 5-9 5s4 5 9 5 9-5 9-5-4-5-9-5Zm0 8a3 3 0 1 1 .001-6.001A3 3 0 0 1 12 15Z"
                  />
                </svg>
              </button>
            </div>
            {errors.senha && (
              <span className="field__error">{errors.senha}</span>
            )}

            <div className="pass-strength" aria-hidden>
              <div className={`bar ${strength >= 1 ? 'on' : ''}`} />
              <div className={`bar ${strength >= 2 ? 'on' : ''}`} />
              <div className={`bar ${strength >= 3 ? 'on' : ''}`} />
              <div className={`bar ${strength >= 4 ? 'on' : ''}`} />
            </div>
          </div>

          <div className="field">
            <label htmlFor="confirmarSenha">Confirmar senha</label>
            <div className="input-pass">
              <input
                id="confirmarSenha"
                name="confirmarSenha"
                type={showPass.s2 ? 'text' : 'password'}
                placeholder="Repita sua senha"
                value={formData.confirmarSenha}
                onChange={onChange}
                required
                aria-invalid={!!errors.confirmarSenha}
                minLength={PWD_LEN_MIN}
                maxLength={PWD_LEN_MAX}
                autoCapitalize="off"
                autoCorrect="off"
                spellCheck={false}
                inputMode="text"
                autoComplete="new-password"
              />
              <button
                type="button"
                className="toggle"
                onClick={() => toggleShow('s2')}
                aria-label={showPass.s2 ? 'Ocultar senha' : 'Mostrar senha'}
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

          <label className="check" style={{ marginTop: 6 }}>
            <input
              type="checkbox"
              name="aceitar"
              checked={formData.aceitar}
              onChange={onChange}
            />
            <span>
              Li e aceito os{' '}
              <a className="link" href="#">
                termos de uso
              </a>
            </span>
          </label>
          {errors.aceitar && (
            <span className="field__error">{errors.aceitar}</span>
          )}

          <button
            type="submit"
            className="btn btn--primary btn--full"
            disabled={isLoading}
          >
            {isLoading ? 'Criando conta...' : 'Criar conta'}
          </button>

          <p className="switch">
            Já tem conta?{' '}
            <a className="link" href="/login">
              Entrar
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}
