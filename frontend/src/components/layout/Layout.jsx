import React from "react";
import Sidebar from "../shared/Sidebar";
import Header from "../shared/Header";
import Footer from "./Footer";
import "./Layout.css";

export default function Layout({ children }) {
  return (
    <div className="layout-container">
      <Sidebar />
      <div className="main-section">
        <Header />
        <main className="content">{children}</main>
        <Footer />
      </div>
    </div>
  );
}
