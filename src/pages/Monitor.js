// src/pages/Monitor.js

import React, { useEffect, useState } from "react";
import "../styles/Monitor.css";

function Monitor() {
  const [state, setState] = useState("NORMAL");

  const dadosMock = {
    temperatura: 28.7,
    umidade: 37,
    nivelRacao: 18,
  };

  useEffect(() => {
    // Simulação de alerta
    if (dadosMock.nivelRacao < 20) {
      setState("CRITICO");
    }
    // document.documentElement.requestFullscreen();
  }, []);

  if (state === "CRITICO") {
    return (
      <div className="monitor-critico">
        <h1>⚠ ALERTA CRÍTICO</h1>
        <h2>Nível de ração baixo</h2>
        <p>Silo: {dadosMock.nivelRacao}%</p>
        <button onClick={() => setState("NORMAL")}>
          RECONHECER ALERTA
        </button>
      </div>
    );
  }

  return (
    <div className="monitor-normal">
      <h1>Monitoramento - Galpão 01</h1>
      <div className="dados">
        <h2>Temperatura: {dadosMock.temperatura}°C</h2>
        <h2>Umidade: {dadosMock.umidade}%</h2>
        <h2>Silo: {dadosMock.nivelRacao}%</h2>
      </div>
    </div>
  );
}

export default Monitor;
