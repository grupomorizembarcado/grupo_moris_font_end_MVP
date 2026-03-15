import { useState, useEffect, useCallback } from "react";
import { FaArrowLeft, FaEdit, FaTimes, FaTrash,  FaChartLine} from "react-icons/fa";
import { useParams, useNavigate } from "react-router-dom";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer} from "recharts";
import apiService from "../services/api";
import LoadingState from "../components/silos/LoadingState";
import SiloFormModal from "../components/silos/SiloFormModal";

const SiloDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [silo, setSilo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: "",
    sensorCode: "",
    minLevel: "",
    maxLevel: "",
  });   

  const loadSiloDetails = useCallback(async () => {
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
  }, [id]);

  useEffect(() => {
    loadSiloDetails();
  }, [loadSiloDetails]);

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
    await apiService.updateSilo(silo.sensor_code, editFormData);

    await loadSiloDetails();
    setShowEditModal(false);

  } catch (error) {
    console.error("Erro ao atualizar silo:", error);
    alert("Erro ao atualizar silo");
  }
};

  const handleDeleteConfirm = async () => {
  try {
    await apiService.deleteSilo(silo.sensor_code);

    setShowDeleteModal(false);
    navigate("/silos");

  } catch (error) {
    console.error("Erro ao deletar silo:", error);
    alert("Erro ao deletar silo");
  }
};

  if (loading) {
    return <LoadingState />;
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

  return (
    <div className="content">

      {/* Header */}
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
            <button onClick={() => setShowDeleteModal(true)} className="btn saas-btn-outlined-red">
              <FaTrash /> Deletar
            </button>
          </div>
        </div>
      </div>

      <div className="min-h-screen bg-base-100 p-6">
        <div className="max-w-6xl mx-auto">
          
          {/* Info Card */}
          <div className="saas-card">
          <div className="silo-card-layout">

            {/* INFORMAÇÕES */}
            <div className="silo-info">
              <h3 className="silo-sensor">
                Código do Sensor: {silo.sensor_code}
              </h3>

              {latestReading && (
                <div className="silo-reading">
                  <div className="silo-percentage-text">
                    Percentual:
                    <span>
                      {latestReading.percentage.toFixed(2)}%
                    </span>
                  </div>
                  <div className="silo-last-reading">
                    Última leitura:
                    {new Date(latestReading.timestamp).toLocaleString("pt-BR")}
                  </div>
                </div>
              )}

              {silo.min_level !== undefined && silo.max_level !== undefined && (

                <div className="silo-limits">
                  <h4>Limites Configurados</h4>
                  <div className="limits-grid">
                    <div className="limit-box">
                      <span>Mínimo: </span>
                      <strong>{silo.min_level}</strong>
                    </div>
                    <div className="limit-box">
                      <span>Máximo: </span>
                      <strong>{silo.max_level}</strong>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* INDICADOR VISUAL */}
            {latestReading && (
              <div className="silo-visual">
                <div className="silo-tank">
                  <div
                    className="silo-fill"
                    style={{
                      height: `${latestReading.percentage}%`,
                      background: getBarColor(latestReading.percentage)
                    }}
                  />
                </div>
                <div className="silo-percentage">
                  {latestReading.percentage.toFixed(1)}%
                </div>
              </div>
            )}
          </div>
        </div>
          {/* Grafico */}
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

    {/* EDIT MODAL */}
    {showEditModal && (
      <SiloFormModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSubmit={handleEditSave}
        title="Editar Silo"
        subtitle="Atualize as informações do silo"
        icon={<FaEdit />}
        submitText="Salvar Alterações"
        formData={editFormData}
        setFormData={setEditFormData}
      />
    )}

    {/* DELETE MODAL */}
    {showDeleteModal && (
      <div className="saas-modal-overlay">
        <div className="saas-modal">

          {/* HEADER */}
          <div className="saas-modal-header">
            <div className="saas-modal-title">
              <div className="saas-modal-icon" style={{background:"#fee2e2", color:"#dc2626"}}>
                <FaTrash />
              </div>
              <div>
                <h2>Deletar Silo</h2>
                <span>Esta ação é permanente</span>
              </div>
            </div>
            <button
              className="saas-modal-close"
              onClick={() => setShowDeleteModal(false)}
            >
              <FaTimes />
            </button>
          </div>

          {/* BODY */}
          <div className="saas-modal-body" style={{textAlign:"center"}}>
            <p style={{fontSize:"15px"}}>
              Tem certeza que deseja deletar o silo:
            </p>
            <p style={{
              fontWeight:"600",
              fontSize:"18px",
              marginTop:"4px"
            }}>
              {silo.silo_name}
            </p>
            <p style={{
              fontSize:"13px",
              color:"#666",
              marginTop:"10px"
            }}>
              Todos os dados associados a este silo serão removidos permanentemente.
            </p>
          </div>

          {/* FOOTER */}
          <div className="saas-modal-footer">
            <button
              className="saas-btn-primary"
              onClick={() => setShowDeleteModal(false)}
            >
              Cancelar
            </button>
            <button
              className="saas-btn-outlined-red"
              onClick={handleDeleteConfirm}
            >
              <FaTrash />
              Deletar Silo
            </button>
          </div>
        </div>
      </div>
    )}
    </div>
  );
};

export default SiloDetails;