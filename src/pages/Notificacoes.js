import React, { useState, useEffect } from "react";
import Button from "../components/ui/Button";
import { FaSyncAlt } from "react-icons/fa";
import "../styles/Notificacoes.css";

/* =========================
   LIMITES DO SISTEMA
========================= */
const LIMITES = {
  temperaturaAlta: 35,
  umidadeAlta: 80,
  racaoBaixa: 20,
};

/* =========================
   FUNÇÃO CRÍTICA
========================= */
function isCritico(alerta) {
  const tipo = alerta.tipo.toLowerCase();

  if (tipo.includes("temperatura") && alerta.valor >= LIMITES.temperaturaAlta) return true;
  if (tipo.includes("umidade") && alerta.valor >= LIMITES.umidadeAlta) return true;
  if (tipo.includes("ração") && alerta.nivelRacao <= LIMITES.racaoBaixa) return true;

  return false;
}

function formatarData(data) {
  return new Date(data).toLocaleString("pt-BR");
}

const Notificacoes = () => {
  const [alertas, setAlertas] = useState([]);
  const [alertaCritico, setAlertaCritico] = useState(null);
  const [loading, setLoading] = useState(false);

  /* =========================
     DADOS FALSOS
  ========================= */
  const fetchAlertas = () => {
    setLoading(true);

    setTimeout(() => {
      const listaFake = [
        {
          id: 1,
          tipo: "Temperatura",
          descricao: "Temperatura acima do limite (38°C)",
          valor: 38,
          galpao: "Galpão 1",
          silo: "Silo A",
          data: new Date(),
          reconhecido: false,
        },
        {
          id: 2,
          tipo: "Umidade",
          descricao: "Umidade elevada (85%)",
          valor: 85,
          galpao: "Galpão 2",
          silo: "Silo B",
          data: new Date(),
          reconhecido: false,
        },
        {
          id: 3,
          tipo: "Ração",
          descricao: "Nível de ração baixo (15%)",
          nivelRacao: 15,
          galpao: "Galpão 3",
          silo: "Silo C",
          data: new Date(),
          reconhecido: false,
        },
        {
          id: 4,
          tipo: "Temperatura",
          descricao: "Temperatura normal (28°C)",
          valor: 28,
          galpao: "Galpão 1",
          silo: "Silo A",
          data: new Date(),
          reconhecido: false,
        },
      ];

      setAlertas(listaFake);

      const critico = listaFake.find((a) => isCritico(a) && !a.reconhecido);
      setAlertaCritico(critico || null);

      setLoading(false);
    }, 800);
  };

  useEffect(() => {
    fetchAlertas();
  }, []);

  /* =========================
     RECONHECER ALERTA
  ========================= */
  const reconhecerAlerta = (id) => {
    setAlertas((prev) => {
      const atualizados = prev.map((a) =>
        a.id === id ? { ...a, reconhecido: true } : a
      );

      const proximoCritico = atualizados.find(
        (a) => isCritico(a) && !a.reconhecido
      );

      setAlertaCritico(proximoCritico || null);

      return atualizados;
    });
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

          <Button onClick={fetchAlertas} disabled={loading} variant="success">
            <div className="button-content">
              <FaSyncAlt className={loading ? "spin" : ""} />
              {loading ? "Atualizando..." : "Atualizar"}
            </div>
          </Button>
        </div>

        {/* =========================
            CARD ALERTA CRÍTICO
        ========================= */}
        {alertaCritico && (
          <div className="alerta-critico-card">
            <div>
              <h2 className="titulo-critico">ALERTA CRÍTICO</h2>
              <p>{alertaCritico.descricao}</p>

              <div className="alerta-critico-grid">
                <div><strong>Galpão:</strong> {alertaCritico.galpao}</div>
                <div><strong>Silo:</strong> {alertaCritico.silo}</div>
                <div><strong>Data:</strong> {formatarData(alertaCritico.data)}</div>
              </div>
            </div>

            <Button
              variant="success"
              onClick={() => reconhecerAlerta(alertaCritico.id)}
            >
              Reconhecer alerta
            </Button>
          </div>
        )}

        {/* =========================
            HISTÓRICO (SEMPRE)
        ========================= */}
        <div className="card-body">
          <div className="table-wrapper">
            <table className="alert-table">
              <thead>
                <tr>
                  <th>Tipo</th>
                  <th>Galpão</th>
                  <th>Silo</th>
                  <th>Descrição</th>
                  <th>Data</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>

              <tbody>
                {alertas.map((alerta) => (
                  <tr key={alerta.id}>
                    <td>
                      <span className={`badge ${isCritico(alerta) ? "badge-red" : "badge-green"}`}>
                        {alerta.tipo}
                      </span>
                    </td>
                    <td>{alerta.galpao}</td>
                    <td>{alerta.silo}</td>
                    <td>{alerta.descricao}</td>
                    <td>{formatarData(alerta.data)}</td>
                    <td>
                      {alerta.reconhecido ? (
                        <span className="status-resolvido">Resolvido</span>
                      ) : (
                        <span className="status-ativa">Ativa</span>
                      )}
                    </td>
                    <td>
                      {!alerta.reconhecido && isCritico(alerta) && (
                        <button
                          className="link-action green"
                          onClick={() => reconhecerAlerta(alerta.id)}
                        >
                          Reconhecer
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>

            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Notificacoes;