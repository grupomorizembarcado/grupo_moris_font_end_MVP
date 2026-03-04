import { useState, useEffect } from "react";
import {
  FaArrowLeft,
  FaEdit,
  FaTrash,
  FaChartLine,
} from "react-icons/fa";
import { useParams, useNavigate } from "react-router-dom";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import apiService from "../services/api";

const SiloDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [silo, setSilo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEdit, setShowEdit] = useState(false);
  const [formData, setFormData] = useState({ name: "", sensorCode: "" });
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: "",
    sensorCode: "",
    minLevel: "",
    maxLevel: "",
  });

   useEffect(() => {
    loadSiloDetails();
  }, [id]);

  const loadSiloDetails = async () => {
    setLoading(true);
    try {
      const silos = await apiService.getSilos();
      const foundSilo = silos.find(
        (s) => s.silo_id === parseInt(id || "0")
      );
      if (foundSilo) {
        setSilo(foundSilo);
        setEditFormData({
          name: foundSilo.silo_name,
          sensorCode: foundSilo.sensor_code,
          minLevel: foundSilo.min_level?.toString() || "",
          maxLevel: foundSilo.max_level?.toString() || "",
        });
      }
    } catch (error) {
      console.error("Erro ao carregar detalhes do silo:", error);
    } finally {
      setLoading(false);
    }
  };

  // Padrão de cores do dashboard
  const getStatusColor = (percentage) => {
    if (percentage <= 20) return "bg-red-100 border-red-300 text-red-800";
    if (percentage <= 50) return "bg-yellow-100 border-yellow-300 text-yellow-800";
    return "bg-green-100 border-green-300 text-green-800";
  };

  const getStatusLabel = (percentage) => {
    if (percentage <= 20) return "Crítico";
    if (percentage <= 50) return "Atenção";
    return "Cheio";
  };

  const getBarColor = (percentage) => {
    if (percentage <= 20) return "var(--error)";
    if (percentage <= 50) return "var(--warning)";
    return "var(--success)";
  };

  const chartData =
    silo?.last_20_readings
      ?.slice(0, 10)
      .reverse()
      .map((reading) => ({
        timestamp: new Date(reading.timestamp).toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        percentage: reading.percentage,
        value: reading.sensor_value,
      })) || [];

  const handleEditSave = async () => {
    try {
      await apiService.updateSilo(silo.silo_id, editFormData);
      await loadSiloDetails();
      setShowEditModal(false);
    } catch (error) {
      console.error("Erro ao atualizar silo:", error);
      alert("Erro ao atualizar silo");
    }
  };

  const handleDelete = async () => {
    if (window.confirm(`Tem certeza que deseja deletar o silo "${silo?.silo_name}"?`)) {
      try {
        await apiService.deleteSilo(silo.silo_id);
        navigate(-1);
      } catch (error) {
        console.error("Erro ao deletar silo:", error);
        alert("Erro ao deletar silo");
      }
    }
  };

  if (loading) {
    return (
      <div className="content">
        <div className="card p-8 text-center">
          <p>Carregando detalhes do silo...</p>
        </div>
      </div>
    );
  }

  if (!silo) {
    return (
      <div className="content">
        <div className="min-h-screen bg-base-100 p-6">
          <button onClick={() => navigate(-1)} className="btn btn-ghost mb-6">
            <FaArrowLeft /> Voltar
          </button>
          <div className="card text-center p-8">
            <p>Silo não encontrado</p>
          </div>
        </div>
      </div>
    );
  }

  const latestReading = silo.last_20_readings?.[0];
  const statusColor = latestReading
    ? getStatusColor(latestReading.percentage)
    : "bg-gray-100 border-gray-300 text-gray-800";
  const statusLabel = latestReading
    ? getStatusLabel(latestReading.percentage)
    : "N/A";

  return (
    <div className="content">
      <div className="card mb-6">
        <div className="flex items-center justify-between">
          <button onClick={() => navigate(-1)}
            className="btn btn-ghost flex items-center gap-2">
            <FaArrowLeft /> Voltar
          </button>
          <div>
            <h1 className="text-4xl font-bold mb-2">{silo.silo_name}</h1>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setShowEditModal(true)} className="btn btn-primary">
              <FaEdit /> Editar
            </button>
            <button onClick={handleDelete} className="btn btn-error">
              <FaTrash /> Deletar
            </button>
          </div>
        </div>
      </div>

      <div className="min-h-screen bg-base-100 p-6">
        <div className="max-w-6xl mx-auto">
          
          {/* Info Card */}
          <div className="card bg-base-200 shadow-xl p-8 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

              {/* Info */}
              <div>
                <h3 className="text-base-content/70 mb-6">
                  Código do Sensor: {silo.sensor_code}
                </h3>

                {latestReading && (
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Percentual:</span>
                      <span className="text-3xl font-bold text-primary">
                        {latestReading.percentage.toFixed(2)}%
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span>Última Leitura:</span>
                      <span>
                        {new Date(latestReading.timestamp).toLocaleString("pt-BR")}
                      </span>
                    </div>
                  </div>
                )}
                {silo.min_level !== undefined && silo.max_level !== undefined && (
                <div className="mt-6 pt-6 border-t border-slate-200">
                  <h3 className="font-semibold text-slate-800 mb-3">
                    Limites Configurados
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Mínimo:</span>
                      <span className="font-medium text-slate-800">
                        {silo.min_level}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Máximo:</span>
                      <span className="font-medium text-slate-800">
                        {silo.max_level}
                      </span>
                    </div>
                  </div>
                </div>
              )}
              </div>
            </div>
          </div>

          {/* Chart */}
          {chartData.length > 0 && (
            <div className="card bg-base-200 shadow-xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <FaChartLine className="text-primary" size={24} />
                <h2 className="text-2xl font-bold">
                  Histórico de Leituras
                </h2>
              </div>

              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="timestamp" />
                  <YAxis label={{ value: "Percentual (%)", angle: -90, position: "insideLeft" }} />
                  <Tooltip formatter={(value) => [`${value.toFixed(2)}%`, "Percentual"]} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="percentage"
                    stroke="var(--info)"
                    strokeWidth={3}
                    dot={{ r: 5 }}
                    name="Percentual (%)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SiloDetails;