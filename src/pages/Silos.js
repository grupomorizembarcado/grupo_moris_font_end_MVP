import { useState, useEffect } from "react";
import { FaBoxes, FaPlus, FaSave, FaTimes,
  FaExclamationTriangle, FaExclamationCircle, FaCheckCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import LoadingState from "../components/silos/LoadingState";
import ErrorState from "../components/silos/ErrorState";
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
    error && setError(null); // Limpa erros anteriores
    try {
      const data = await apiService.getSilos();
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
    return <LoadingState />;
  }

  if (error) {
    return (
      <ErrorState
        error={error}
        onRetry={loadSilos}
      />
    );
  }

  // if (silos.length === 0) {
  //   return (
  //     <div className="content">
  //       <div className="card mb-6">
  //         <div className="flex items-center justify-between">
  //           <div>
  //             <h3 className="text-lg font-semibold text-gray-700 mb-2">Nenhum silo cadastrado</h3>
  //             <p className="text-gray-500 mb-6">
  //               Comece cadastrando seu primeiro silo para monitorar os níveis de ração.
  //             </p>
  //             <button
  //               className="btn btn-primary"
  //               onClick={() => setShowModal(true)}
  //             >
  //               <FaPlus /> Cadastrar Primeiro Silo
  //             </button>
  //           </div>
  //         </div>
  //       </div>
  //     </div>
      
  //   );
  // }

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

            const getStatusIcon = (value) => {
              if (value <= 20) return <FaExclamationTriangle className="text-error" />;
              if (value <= 50) return <FaExclamationCircle className="text-warning" />;
              return <FaCheckCircle className="text-success" />;
            };

            const nivelColor = getNivelColor(percentage);

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


      {/* Empty State */}
        {silos.length === 0 && (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <FaBoxes size={48} className="mx-auto text-slate-400 mb-4" />
            <p className="text-slate-600 text-lg mb-4">
              Nenhum silo cadastrado
            </p>
            <button
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors font-semibold"
              onClick={() => setShowModal(true)}
            >
              <FaPlus /> Criar Primeiro Silo
            </button>
          </div>
        )}
     
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
              <div className="form-group">
                <label className="form-label">Nível mínimo</label>
                <input
                  type="number"
                  className="form-control"
                  value={formData.minLevel}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      minLevel: e.target.value,
                    })
                  }
                />
              </div>

              <div className="form-group">
                <label className="form-label">Nível máximo</label>
                <input
                  type="number"
                  className="form-control"
                  value={formData.maxLevel}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      maxLevel: e.target.value,
                    })
                  }
                />
              </div>
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