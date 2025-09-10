// AuthBrand.jsx
import { Link } from "react-router-dom";
import './AuthBrand.css';

export default function AuthBrand() {
  return (
    <Link to="/" className="auth-brand" aria-label="Ir para a página inicial">
      <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden>
        <path fill="currentColor" d="M12 2 2 7l10 5 10-5-10-5Zm0 7L2 4v13l10 5 10-5V4l-10 5Z"/>
      </svg>
      <span>SkinLoot</span>
    </Link>
  );
}
