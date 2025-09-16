// // src/pages/home/Home.jsx
// import React, { useEffect, useState } from "react";
// // CSS da Home (ajuste o caminho/nome se necessário)
// import "./Home.css";
// // Dados mock para rodar sem backend (fallback)
// import MockSkins from "../../components/mock/MockSkins";

// /**
//  * Import "à prova de formato":
//  * - Se `services/api` exportar default, usamos `apiModule.default`
//  * - Se exportar nomeado { api }, usamos `apiModule.api`
//  * - Se por algum motivo exportar a própria instância como módulo, usamos `apiModule`
//  */
// import * as apiModule from "../../services/api";
// const http = apiModule.default ?? apiModule.api ?? apiModule;

// // Componentes da página
// import Header from "../../components/shared/Header";
// import Hero from "../../components/home/Hero";
// import Categorias from "../../components/home/Categorias";
// import Destaque from "../../components/home/Destaque";
// import Avaliacoes from "../../components/home/Avaliacoes";
// import CarrosselSkins from "../../components/home/CarrosselSkins";
// import Footer from "../../components/layout/Footer";
// import Sidebar from "../../components/shared/Sidebar";

// /**
//  * Componente principal da Home.
//  * - Tenta carregar skins via API usando a instância `http` (que aponta para `api`).
//  * - Se falhar (ex.: backend offline), faz fallback para o `MockSkins`.
//  */
// export default function Home() {
//   const [skins, setSkins] = useState([]);

//   useEffect(() => {
//     let isMounted = true; // evita setState após unmount

//     (async () => {
//       try {
//         // 🔗 Chamada via instância `http`:
//         //    - baseURL vem do VITE_API_BASE_URL (definido em src/services/api.js)
//         //    - path "/api/skins" pode ser ajustado depois p/ casar com seu Spring
//         const { data } = await http.get("/api/skins");

//         // aceita tanto array puro quanto {results: [...]}
//         const payload = Array.isArray(data) ? data : (data?.results ?? []);
//         if (isMounted) setSkins(payload);
//       } catch (err) {
//         // ⚠️ Se o backend não estiver rodando, usamos o mock para a página não quebrar
//         console.warn("Falha ao carregar skins da API. Usando mock. Detalhes:", err?.message || err);
//         if (isMounted) setSkins(MockSkins);
//       }
//     })();

//     return () => {
//       isMounted = false;
//     };
//   }, []);

//   return (
//     <div className="home-container">
//       <Header />
//       <Sidebar />
//       <Hero />
//       <Categorias />
//       <Destaque />
//       <Avaliacoes />
//       <CarrosselSkins skins={skins} />
//       <Footer />
//     </div>
//   );
// }
