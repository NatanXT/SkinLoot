import React from "react";
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, RouterProvider } from 'react-router-dom';
import { AuthProvider } from './services/AuthContext.jsx';
import router from './router'; 
import './index.css'

createRoot(document.getElementById('root')).render(
<StrictMode>
    <AuthProvider>
      {/* 3. Use RouterProvider e passe o router como prop */}
      <RouterProvider router={router} />
    </AuthProvider>
  </StrictMode>
)
