import React, { useEffect, useMemo, useState } from "react";
import Button from "../components/ui/Button";
import { FaSyncAlt } from "react-icons/fa";
// import apiService from "../services/api";
import "../styles/Notificacoes.css";

const BASE_URL = "https://api-granjatech.onrender.com"; 

function formatarData(iso) {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso);
  return d.toLocaleString("pt-BR");
}

function normalizeStatus(s) {
  return String(s || "").trim().toLowerCase(); 
}

function makeRow({ shed, tipo, valorMedio, status, timestamp }) {
  const nivel = normalizeStatus(status) === "alerta" ? "critico" : "normal";

  const unidade = tipo === "Temperatura" ? "°C" : "%";
  const descricao = `${tipo} média: ${valorMedio ?? "-"}${unidade}`;

  return {
    id: `${shed.id || shed._id || shed.shed_id}-${tipo}-${timestamp}`,
    tipo,
    galpao: shed.name || shed.shed_name || `Galpão ${shed.id ?? shed.shed_id ?? ""}`,
    descricao,
    data: timestamp,
    nivel,                 
    status: status || "-",
    reconhecido: false,
  };
}

const Notificacoes = () => {
  const [loading, setLoading] = useState(false);
  const [historico, setHistorico] = useState([]);
  const [overviews, setOverviews] = useState([]); 

  const fetchDados = async () => {
    try {
      setLoading(true);

      // 1) Lista de silos
      const shedsResp = await fetch(`${BASE_URL}/api/silos`);
      const sheds = await shedsResp.json();
      console.log('Response from API:', shedsResp);
      console.log('Sheds data:', sheds);

      // 2) Overview de cada silo (em paralelo)
      const overviewPromises = sheds.map(async (shed) => {
        const shedId = shed.silo_id ?? shed._id ?? shed.shed_id;
        if (!shedId) return null;

        const ovResp = await fetch(`${BASE_URL}/api/environment/latest`);
        const overview = await ovResp.json(); // Usar .json() para obter a resposta
        return { shed, overview };
      });

      const results = (await Promise.all(overviewPromises)).filter(Boolean);
      setOverviews(results);

      // 3) Gerar linhas do histórico com base em estatísticas
      const novasLinhas = [];

      for (const item of results) {
        const { shed, overview } = item;
        const stats = overview?.data || null; // A resposta do ambiente tem os dados em "data"
        if (!stats) continue;

        const timestamp =
          overview?.timestamp ||
          overview?.updatedAt ||
          overview?.createdAt ||
          new Date().toISOString();

        // Temperatura
        if (stats.temperature != null) {
          novasLinhas.push(
            makeRow({
              shed,
              tipo: "Temperatura",
              valorMedio: Number(stats.temperature),
              status: stats.status_temperatura,
              timestamp,
            })
          );
        }

        // Umidade
        if (stats.humidity != null) {
          novasLinhas.push(
            makeRow({
              shed,
              tipo: "Umidade",
              valorMedio: Number(stats.humidity),
              status: stats.status_umidade,
              timestamp,
            })
          );
        }
      }

      // 4) Verificação dos silos para quantidade de ração (percentual < 40%)
      sheds.forEach((silo) => {
        const { silo_name, last_20_readings } = silo;

        // Verifica os alertas de quantidade de ração (percentage < 40%)
        if (last_20_readings && last_20_readings.length > 0) {
          last_20_readings.forEach((reading) => {
            if (reading.percentage < 40) {
              novasLinhas.push(
                makeRow({
                  shed: { name: silo_name },
                  tipo: "Ração",
                  valorMedio: Number(reading.level_value),
                  status: "alerta",
                  timestamp: reading.timestamp,
                })
              );
            }
          });
        }
      });

      // 5) Mescla com o histórico existente, sem duplicar
      setHistorico((prev) => {
        const ids = new Set(prev.map((x) => x.id));
        const add = novasLinhas.filter((x) => !ids.has(x.id));

        const combinado = [...add, ...prev];
        combinado.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
        return combinado;
      });

    } catch (e) {
      console.error("Erro ao buscar dados:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDados();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Card crítico: primeiro galpão onde status_temperatura ou status_umidade == "alerta"
  const alertaCritico = useMemo(() => {
    for (const item of overviews) {
      const { shed, overview } = item;
      const stats = overview?.data || null;
      if (!stats) continue;

      const stTemp = normalizeStatus(stats.status_temperatura);
      const stHum = normalizeStatus(stats.status_umidade);

      const motivos = [];
      if (stTemp === "alerta") motivos.push(`Temperatura em alerta (média: ${stats.temperature}°C)`);
      if (stHum === "alerta") motivos.push(`Umidade em alerta (média: ${stats.humidity}%)`);

      if (motivos.length > 0) {
        const timestamp =
          overview?.timestamp ||
          overview?.updatedAt ||
          overview?.createdAt ||
          new Date().toISOString();

        return {
          id: `CRIT-${shed.silo_id || shed._id || shed.shed_id}-${timestamp}`,
          galpao: shed.name || shed.shed_name || `Galpão ${shed.silo_id ?? shed.shed_id ?? ""}`,
          descricao: motivos.join(" | "),
          data: timestamp,
        };
      }
    }
    return null;
  }, [overviews]);

  // Reconhecer alerta
  const reconhecerAlerta = () => {
    if (!alertaCritico) return;

    setHistorico((prev) =>
      prev.map((h) => {
        const mesmoGalpao = h.galpao === alertaCritico.galpao;
        if (mesmoGalpao && h.nivel === "critico" && !h.reconhecido) {
          return { ...h, reconhecido: true, status: "resolvido" };
        }
        return h;
      })
    );
  };

  return (
    <div className="content">
      <div className="card mb-6">
        <div className="card-header header-flex">
          <div>
            <h1 className="card-title">Alertas</h1>
            <p className="text-gray-600 text-sm">Monitoramento de eventos do sistema.</p>
          </div>

          <Button onClick={fetchDados} disabled={loading} variant="success">
            <div className="button-content">
              <FaSyncAlt className={loading ? "spin" : ""} />
              {loading ? "Atualizando..." : "Atualizar"}
            </div>
          </Button>
        </div>

        {/* Card crítico (aparece só se status_* == "alerta") */}
        {alertaCritico && (
          <div className="alerta-critico-card">
            <div className="alerta-critico-left">
              <h2 className="titulo-critico">ALERTA CRÍTICO</h2>
              <p className="sub-critico">{alertaCritico.descricao}</p>

              <div className="alerta-critico-grid">
                <div>
                  <span className="label">Galpão:</span> <strong>{alertaCritico.galpao}</strong>
                </div>
                <div>
                  <span className="label">Data:</span> <strong>{formatarData(alertaCritico.data)}</strong>
                </div>
              </div>
            </div>

            <Button variant="success" onClick={reconhecerAlerta}>
              Reconhecer alerta
            </Button>
          </div>
        )}

        {/* Histórico permanente */}
        <div className="card-body">
          <div className="table-wrapper">
            <table className="alert-table">
              <thead>
                <tr>
                  <th>Tipo</th>
                  <th>Galpão</th>
                  <th>Descrição</th>
                  <th>Data</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {loading && (
                  <tr>
                    <td colSpan="5" className="table-empty">Carregando...</td>
                  </tr>
                )}

                {!loading && historico.length === 0 && (
                  <tr>
                    <td colSpan="5" className="table-empty">Nenhum evento no histórico.</td>
                  </tr>
                )}

                {!loading &&
                  historico.map((a) => (
                    <tr key={a.id}>
                      <td>
                        <span className={`badge ${a.nivel === "critico" ? "badge-red" : "badge-green"}`}>
                          {a.tipo.toUpperCase()}
                        </span>
                      </td>
                      <td>{a.galpao}</td>
                      <td className="descricao-col">{a.descricao}</td>
                      <td>{formatarData(a.data)}</td>
                      <td>
                        <span className={`status ${a.reconhecido ? "status-resolvido" : "status-ativa"}`}>
                          {a.reconhecido ? "Resolvido" : a.status}
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          {/* <p className="text-gray-600 text-sm" style={{ marginTop: 10 }}>
            * Criticidade vem do backend via <code>estatisticas.status_temperatura</code> e <code>estatisticas.status_umidade</code>.
          </p> */}
        </div>
      </div>
    </div>
  );
};

export default Notificacoes;