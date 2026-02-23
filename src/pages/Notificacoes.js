import React, { useState, useEffect } from "react";
import Button from "../components/ui/Button";
import { FaSyncAlt } from "react-icons/fa";
import apiService from "../services/api";
import "../styles/Notificacoes.css";
const Notificacoes = () => {
  const [alertas, setAlertas] = useState([]);
  const [alertaCritico, setAlertaCritico] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchAlertas = async () => {
    setTimeout(() => {
    const listaFake = [
      {
        id: 1,
        tipo: "Temperatura",
        descricao: "Temperatura acima do limite permitido",
        nivel: "critico",
        galpao: "Galpão 1",
        silo: "Silo A",
        data: new Date().toLocaleString(),
        reconhecido: false
      }
    ];

    setAlertas(listaFake);

    const critico = listaFake.find(
      a => a.nivel === "critico" && !a.reconhecido
    );

    setAlertaCritico(critico || null);
    setLoading(false);
  }, 800);
  
    try {
      setLoading(true);

      const response = await apiService.get("/alertas");
      setAlertas(response.data);

      const lista = response.data;

      setAlertas(lista);

      const critico = lista.find(a => a.nivel === "critico" && !a.reconhecido);
      setAlertaCritico(critico || null);

    } catch (error) {
      console.error("Erro ao buscar alertas:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlertas();
  }, []);
  const reconhecerAlerta = async () => {
    try {
      await apiService.patch(`/alertas/${alertaCritico.id}/reconhecer`);

      setAlertaCritico(null);
      fetchAlertas();

    } catch (error) {
      console.error("Erro ao reconhecer alerta:", error);
    }
  };

  return (
    <div className="content">
      <div className="card mb-6">
        <div className="card-header header-flex">

          <div>
            <h1 className="card-title">Alertas</h1>
            <p className="text-gray-600 text-sm">
              Monitoramento de eventos do sistema.
            </p>
          </div>

          <Button
            onClick={fetchAlertas}
            disabled={loading}
            variant="success"
          >
            <div className="button-content">
              <FaSyncAlt className={loading ? "spin" : ""} />
              {loading ? "Atualizando..." : "Atualizar"}
            </div>
          </Button>

        </div>

        {/* Lista de alertas */}
        <div className="card-body">
          {loading && <p>Carregando alertas...</p>}

          {!loading && alertas.length === 0 && (
            <p>Nenhum alerta encontrado.</p>
          )}

          {!loading && alertas.map((alerta) => (
            <div key={alerta.id} className="alert-item">
              <strong>{alerta.tipo}</strong> - {alerta.descricao}
            </div>
          ))}
        </div>
          {alertaCritico && (
          <div className="alerta-critico-card">
            <div>
              <h2 className="titulo-critico">ALERTA CRÍTICO</h2>
              <p>{alertaCritico.descricao}</p>

              <div className="alerta-info">
                <span><strong>Galpão:</strong> {alertaCritico.galpao}</span>
                <span><strong>Silo:</strong> {alertaCritico.silo}</span>
                <span><strong>Data:</strong> {alertaCritico.data}</span>
              </div>
            </div>

            <Button
              variant="success"
              onClick={reconhecerAlerta}
            >
              Reconhecer alerta
            </Button>
          </div>
        )}
      </div>
    </div>
    
  );
};

export default Notificacoes;