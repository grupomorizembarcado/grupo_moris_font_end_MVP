import React from "react";
import { Navigate } from "react-router-dom";
import Header from "./Header";
import Nav from "./Nav";

function PrivateRoutes({ children }) {
  const isAuthenticated = localStorage.getItem("authenticated"); // Verificação da autenticação

  // Se o usuário não estiver autenticado, redireciona para o login
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // Se estiver autenticado, renderiza as rotas privadas dentro do layout
  return (
    <div className="app-container">
      <Header />
      <div className="main-layout">
        <Nav />
        {children}  {/* As páginas privadas serão renderizadas aqui */}
      </div>
    </div>
  );
}

export default PrivateRoutes;
