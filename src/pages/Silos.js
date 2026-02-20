import { useState, useEffect } from "react";
import {
  FaBoxes,
  FaPlus,
  FaSave,
  FaTimes,
  FaExclamationTriangle,
  FaInbox,
  FaExclamationCircle,
  FaCheckCircle
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import apiService from "../services/api";

const Silos = () => {
  const [silos, setSilos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    sensorCode: "",
    minLevel: "",
    maxLevel: ""
  });

  const loadSilos = async () => {
    setLoading(true);
    try {
      const data = await apiService.fetchSilos();
      setSilos(data);
    } catch (error) {
      setError("Não foi possível carregar os silos. Tente novamente mais tarde.");
      console.error("Erro ao carregar silos:", error);
    } finally {
      setLoading(false);  
    }
  };

  useEffect(() => {
    loadSilos();
  }, []);

  const handleCreate = async () => {
    try {
      await apiService.createSilo(formData);
      await loadSilos();
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error("Erro ao criar silo:", error);
      alert("Erro ao criar silo. Tente novamente mais tarde.");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      sensorCode: "",
      minLevel: "",
      maxLevel: ""
    });
  };

  if (loading) {
    return (
      <div className="content">
        <div className="card p-8 text-center">
          Carregando silos...
        </div>
      </div>
    );
  }

  if (error) {
    return (
       <div className="card p-8 text-center border-error border-2">
         <div className="flex flex-col items-center gap-4">
           <FaExclamationTriangle className="text-error text-4xl" />
           <div>
             <h3 className="text-lg font-semibold text-error mb-2">Erro ao carregar dados</h3>
             <p className="text-gray-600">{error}</p>
           </div>
           <button 
             className="btn btn-primary mt-4"
             onClick={loadSilos}
           >
             Tentar novamente
           </button>
         </div>
       </div>
     );
    }

  if (silos.length === 0) {
    return (
      <div className="card p-12 text-center">
        <div className="flex flex-col items-center gap-4">
          <FaInbox className="text-gray-400 text-5xl" />
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Nenhum silo cadastrado</h3>
            <p className="text-gray-500 mb-6">
              Comece cadastrando seu primeiro silo para monitorar os níveis de ração.
            </p>
            <button
              className="btn btn-primary"
              onClick={() => setShowModal(true)}
            >
              <FaPlus /> Cadastrar Primeiro Silo
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="content">
      {/* Header */}
      <div className="card mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="card-title">
              <FaBoxes /> Silos
            </h1>
            <p className="text-gray-600 text-sm">
              Gerenciamento e monitoramento dos silos
            </p>
          </div>
          <button
            className="btn btn-primary"
            onClick={() => setShowModal(true)}
          >
            <FaPlus /> Novo Silo
          </button>
        </div>
      </div>

      {/* Silo Grid */}
      <div className="galp-grid">
        {[...silos]
          .sort((a, b) => a.silo_name.localeCompare(b.silo_name)) // Ordenação alfabética
          .map((silo) => {
            const latestReading = silo.last_20_readings?.[0];
            const percentage = latestReading?.percentage ?? 0;

            const getNivelColor = (value) => {
              if (value <= 20) return 'var(--error)';      // crítico (baixo nível)
              if (value <= 50) return 'var(--warning)';    // atenção
              return 'var(--success)';                     // normal
            };

            const getNivelStatus = (value) => {
              if (value <= 20) return 'Crítico';
              if (value <= 50) return 'Atenção';
              return 'Normal';
            };

            const getStatusIcon = (value) => {
              if (value <= 20) return <FaExclamationTriangle className="text-error" />;
              if (value <= 50) return <FaExclamationCircle className="text-warning" />;
              return <FaCheckCircle className="text-success" />;
            };

            const nivelColor = getNivelColor(percentage);
            const nivelStatus = getNivelStatus(percentage);

            return (
              <div
                key={silo.silo_id}
                onClick={() => navigate(`/silos/${silo.silo_id}`)}
                className="galp-card cursor-pointer transition hover:scale-[1.02]"
                style={{ borderLeft: `4px solid ${nivelColor}` }}
              >
                {/* Header */}
                <div className="galp-title">
                  <div className="flex items-center gap-2 ml-auto" style={{ color: nivelColor }}>
                    {getStatusIcon(percentage)}
                  </div>
                  <h3>{silo.silo_name}</h3>
                </div>

                <div className="galp-info">
                  {latestReading ? (
                    <>
                      {/* Nível do Silo */}
                      <div className="metric-row">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-gray-600 flex items-center gap-2">
                            <FaBoxes /> Nível do Silo
                          </span>
                          <span className="font-medium">
                            {percentage.toFixed(2)}%
                          </span>
                        </div>

                        {/* Barra de progresso */}
                        <div className="metric-bar">
                          <div
                            className="bar-fill"
                            style={{
                              width: `${percentage}%`,
                              backgroundColor: nivelColor
                            }}
                          ></div>
                        </div>
                      </div>

                      {/* Última leitura */}
                      <div className="flex items-center justify-between pt-4 border-t border-border mt-4">
                        <div>
                          <div className="text-sm text-gray-600">Última leitura:</div>
                          <div className="font-medium">
                            {new Date(latestReading.timestamp).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <p className="text-gray-500 text-sm">Sem leituras</p>
                  )}
                  {/* Alerta para nível crítico */}
                  {percentage <= 20 && (
                    <div className="mt-4 pt-4 border-t border-border">
                      <div className="flex items-start gap-2">
                        <FaExclamationTriangle className="text-error mt-0.5" />
                        <div className="flex flex-wrap gap-1">
                          <span className="badge badge-error text-xs">
                            Nível crítico - Reabastecer urgente
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
      </div>

      {/* Modal Criar */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2 className="card-title">
                <FaPlus /> Novo Silo
              </h2>
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
              >
                <FaTimes />
              </button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Nome *</label>
                <input
                  className="form-control"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>

              <div className="form-group">
                <label className="form-label">Código do Sensor *</label>
                <input
                  className="form-control"
                  value={formData.sensorCode}
                  onChange={(e) =>
                    setFormData({ ...formData, sensorCode: e.target.value })
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <input
                  type="number"
                  className="form-control"
                  placeholder="Min"
                  value={formData.minLevel}
                  onChange={(e) =>
                    setFormData({ ...formData, minLevel: e.target.value })
                  }
                />
                <input
                  type="number"
                  className="form-control"
                  placeholder="Max"
                  value={formData.maxLevel}
                  onChange={(e) =>
                    setFormData({ ...formData, maxLevel: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>
                Cancelar
              </button>
              <button
                className="btn btn-primary"
                onClick={handleCreate}
                disabled={!formData.name || !formData.sensorCode}
              >
                <FaSave /> Criar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Silos;