import React, { useState, useEffect } from "react";
import {
  FaBoxes,
  FaPlus,
  FaEdit,
  FaSave,
  FaTimes
} from "react-icons/fa";
import apiService from "../services/api";

const Silos = () => {
  const [silos, setSilos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);


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
      alert("Erro ao criar silo");
    }
  };

  const handleEdit = (silo) => {
    setEditingId(silo.silo_id);
    setFormData({
      name: silo.silo_name,
      sensorCode: silo.sensor_code,
      minLevel: "",
      maxLevel: ""
    });
  };

  const handleSave = async (id) => {
    try {
      await apiService.updateSilo(id, formData);
      await loadSilos();
      setEditingId(null);
      resetForm();
    } catch (error) {
      console.error("Erro ao atualizar silo:", error);
      alert("Erro ao atualizar silo");
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

      {/* Grid */}
      <div className="galp-grid">
        {silos.map((silo) => {
          const latestReading =
            silo.last_20_readings?.[0];

          return (
            <div key={silo.silo_id} className="galp-card">
              <div className="galp-title">
                <FaBoxes className="text-green-600" />
                <h3>
                  {editingId === silo.silo_id ? (
                    <input
                      className="form-control"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                    />
                  ) : (
                    silo.silo_name
                  )}
                </h3>
              </div>

              <div className="galp-info">

                <div className="info-row">
                  <span className="info-label">Código Sensor:</span>
                  {editingId === silo.silo_id ? (
                    <input
                      className="form-control"
                      value={formData.sensorCode}
                      onChange={(e) =>
                        setFormData({ ...formData, sensorCode: e.target.value })
                      }
                    />
                  ) : (
                    <span className="info-value code">
                      {silo.sensor_code}
                    </span>
                  )}
                </div>

                {latestReading && (
                  <>
                    <div className="info-row">
                      <span className="info-label">Percentual:</span>
                      <span className="info-value font-semibold">
                        {latestReading.percentage.toFixed(1)}%
                      </span>
                    </div>

                    <div className="info-row">
                      <span className="info-label">Última leitura:</span>
                      <span className="info-value">
                        {new Date(latestReading.timestamp).toLocaleString()}
                      </span>
                    </div>
                  </>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-4 border-t mt-4">
                  {editingId === silo.silo_id ? (
                    <>
                      <button
                        className="btn btn-primary btn-sm flex-1"
                        onClick={() => handleSave(silo.silo_id)}
                      >
                        <FaSave /> Salvar
                      </button>
                      <button
                        className="btn btn-secondary btn-sm flex-1"
                        onClick={() => setEditingId(null)}
                      >
                        <FaTimes /> Cancelar
                      </button>
                    </>
                  ) : (
                    <button
                      className="btn btn-secondary btn-sm flex-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(silo);
                      }}>
                      <FaEdit /> Editar
                    </button>
                  )}
                </div>
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
                <div className="form-group">
                  <label className="form-label">Nível Mínimo</label>
                  <input
                    type="number"
                    className="form-control"
                    value={formData.minLevel}
                    onChange={(e) =>
                      setFormData({ ...formData, minLevel: e.target.value })
                    }
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Nível Máximo</label>
                  <input
                    type="number"
                    className="form-control"
                    value={formData.maxLevel}
                    onChange={(e) =>
                      setFormData({ ...formData, maxLevel: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
              >
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