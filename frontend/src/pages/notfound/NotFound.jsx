import React from 'react';
import { Link } from 'react-router-dom';
import './NotFound.css';

export default function NotFound() {
  return (
    <div className="notfound-root">
      <div className="notfound-container">
        <h1>404</h1>
        <p>Página não encontrada</p>
        <Link to="/" className="notfound-button">
          Voltar para Home
        </Link>
      </div>
    </div>
  );
}
