import React from 'react';
import Sidebar from '../shared/Sidebar';
import Header from '../shared/Header';
import { Outlet } from 'react-router-dom'; // 1. Importe o Outlet

import Footer from './Footer';
import './Layout.css';

export default function Layout({ children }) {
  return (
    <div className="layout-container">
      <Sidebar />
      <div className="main-section">
        <Header />
        <main className="content">{children}</main>
        <Outlet />
      </div>
    </div>
  );
}
