import { useEffect, useState } from "react";
import Button from "../components/ui/Button";
import { FaSyncAlt } from "react-icons/fa";
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

function makeRow({ shed, tipo, valorMedio, status, timestamp, descricaoCustomizada }) {
  const nivel = normalizeStatus(status) === "alerta" ? "critico" : "normal";

  const unidade = tipo === "Temperatura" ? "°C" : "%";
  const descricao = descricaoCustomizada || `${tipo} média: ${valorMedio ?? "-"}${unidade}`;

  return {
    id: `${shed.id || shed._id || shed.shed_id || shed.silo_id || shed.unit_id}-${tipo}-${timestamp}`, tipo,
    galpao:
      shed.name ||
      shed.shed_name ||
      shed.silo_name ||
      shed.unit_name ||
      `Unidade ${shed.id ?? shed.shed_id ?? shed.silo_id ?? shed.unit_id ?? ""}`,
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
      const shedsResp = await fetch(`${BASE_URL}/api/silo/reading`);
      const shedsData = await shedsResp.json();
      const sheds = Array.isArray(shedsData) ? shedsData : [shedsData]; console.log('Response from API:', shedsResp);
      // console.log('Sheds data:', sheds);

      const envResp = await fetch(`${BASE_URL}/api/environmentalMetrics`);
      const envData = await envResp.json();
      const units = Array.isArray(envData) ? envData : [envData];

      // setOverviews(envData)
      setOverviews(units);
      // 3) Gerar linhas do histórico com base em estatísticas
      const novasLinhas = [];

      for (const unit of units) {
        const readings = Array.isArray(unit?.last_20_readings) ? unit.last_20_readings : [];

        readings.forEach((reading) => {
          const timestamp = reading?.timestamp || new Date().toISOString();

          if (reading?.temperature != null) {
            const temperatureValue = Number(reading.temperature);

            // faixa ideal
            if (temperatureValue >= 25 && temperatureValue <= 27) {
              return;
            }

            const statusTemperatura = "alerta";

            let descricaoTemp = `Temperatura fora do ideal: ${temperatureValue}°C`;

            if (temperatureValue > 27) {
              descricaoTemp = `Temperatura alta: ${temperatureValue}°C`;
            }

            if (temperatureValue < 25) {
              descricaoTemp = `Temperatura baixa: ${temperatureValue}°C`;
            }

            novasLinhas.push(
              makeRow({
                shed: unit,
                tipo: "Temperatura",
                valorMedio: temperatureValue,
                status: statusTemperatura,
                timestamp,
                descricaoCustomizada: descricaoTemp,
              })
            );
          }

          // Umidade: alerta >70 ou <50
          if (reading?.humidity != null) {
            const humidityValue = Number(reading.humidity);
            const statusUmidade =
              humidityValue > 70 || humidityValue < 50 ? "alerta" : "normal";

            let descricaoUmidade = `Umidade média: ${humidityValue}%`;

            if (humidityValue > 70) {
              descricaoUmidade = `Alta umidade: ${humidityValue}%`;
            } else if (humidityValue < 50) {
              descricaoUmidade = `Baixa umidade: ${humidityValue}%`;
            }

            novasLinhas.push(
              makeRow({
                shed: unit,
                tipo: "Umidade",
                valorMedio: humidityValue,
                status: statusUmidade,
                timestamp,
                descricaoCustomizada: descricaoUmidade,
              })
            );
          }
        });
      }
      sheds.forEach((reading) => {
        const percentage = Number(reading?.level_percentage);

        if (percentage < 40) {
          novasLinhas.push(
            makeRow({
              shed: {
                silo_id: reading?.siloId,
                silo_name: `Silo ${reading?.siloId ?? ""}`,
              },
              tipo: "Ração",
              valorMedio: percentage,
              status: "alerta",
              timestamp: reading?.timestamp,
              descricaoCustomizada: `Nível de ração baixo: ${percentage}%`,
            })
          );
        }
      });
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
        {/* {alertaCritico && (
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
        )} */}

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
        </div>
      </div>
    </div>
  );
};

export default Notificacoes;