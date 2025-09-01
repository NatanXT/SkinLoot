// Home.jsx
import React, { useEffect, useState } from "react";
import "../home/Home";
import axios from "axios";

// Importação de dados mock
import MockSkins from "../../components/mock/MockSkins";

// Componentes da página
import Header from "../../components/shared/Header";
import Hero from "../../components/home/Hero";
import Categorias from "../../components/home/Categorias";
import Destaque from "../../components/home/Destaque";
import Avaliacoes from "../../components/home/Avaliacoes";
import CarrosselSkins from "../../components/home/CarrosselSkins";
import Footer from "../../components/layout/Footer";
import Sidebar from "../../components/shared/Sidebar";

/**
 * Componente principal da Home, renderiza toda a página inicial.
 * Os dados de skins vêm de um mock (pode ser substituído por API futuramente).
 */
export default function Home() {
  const [skins, setSkins] = useState([]);

  useEffect(() => {
    // Para usar com backend futuramente:
    
    axios.get("http://localhost:8080/api/skins")
      .then((res) => setSkins(res.data))
      .catch((err) => console.error("Erro ao carregar skins:", err));
    
    setSkins(MockSkins);
  }, []);

  return (
    <div className="home-container">
      <Header />
      <Sidebar />
      <Hero />
      <Categorias />
      <Destaque />
      <Avaliacoes />
      <CarrosselSkins skins={skins} />
      <Footer />
    </div>
  );
}
