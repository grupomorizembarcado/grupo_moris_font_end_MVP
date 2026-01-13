import React, { useState, useEffect } from 'react';
import { 
  FaWarehouse, 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaSave, 
  FaTimes,
  FaSeedling,
  FaThermometerHalf
} from 'react-icons/fa';
import apiService from '../services/api';
import { getLatestReading, formatDate } from '../services/mockData';

const Galpoes = () => {
  const [galpoes, setGalpoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    barn_name: '',
    silo_name: '',
    silo_sensor_code: '',
    env_name: '',
    env_sensor_code: ''
  });

  const loadGalpoes = async () => {
    setLoading(true);
    try {
      const response = await apiService.request('/galpoes');
      setGalpoes(response.data);
    } catch (error) {
      console.error('Erro ao carregar galpões:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGalpoes();
  }, []);

  const handleCreate = async () => {
    try {
      await apiService.createGalpao({
        barn_name: formData.barn_name,
        silo: {
          name: formData.silo_name,
          sensor_code: formData.silo_sensor_code,
          last_20_readings: []
        },
        environment: {
          name: formData.env_name,
          sensor_code: formData.env_sensor_code,
          last_20_readings: []
        }
      });
      
      await loadGalpoes();
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error('Erro ao criar galpão:', error);
      alert('Erro ao criar galpão');
    }
  };

  const handleEdit = (galpao) => {
    setEditingId(galpao.barn_id);
    setFormData({
      barn_name: galpao.barn_name,
      silo_name: galpao.silo?.name || '',
      silo_sensor_code: galpao.silo?.sensor_code || '',
      env_name: galpao.environment?.name || '',
      env_sensor_code: galpao.environment?.sensor_code || ''
    });
  };

  const handleSave = async (id) => {
    try {
      await apiService.updateGalpao(id, {
        barn_name: formData.barn_name,
        silo: {
          name: formData.silo_name,
          sensor_code: formData.silo_sensor_code
        },
        environment: {
          name: formData.env_name,
          sensor_code: formData.env_sensor_code
        }
      });
      
      await loadGalpoes();
      setEditingId(null);
      resetForm();
    } catch (error) {
      console.error('Erro ao atualizar galpão:', error);
      alert('Erro ao atualizar galpão');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este galpão?')) {
      try {
        await apiService.deleteGalpao(id);
        await loadGalpoes();
      } catch (error) {
        console.error('Erro ao deletar galpão:', error);
        alert('Erro ao deletar galpão');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      barn_name: '',
      silo_name: '',
      silo_sensor_code: '',
      env_name: '',
      env_sensor_code: ''
    });
  };

  if (loading) {
    return (
      <div className="content">
        <div className="card">
          <div className="flex items-center justify-center p-8">
            <div className="text-gray-600">Carregando galpões...</div>
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
              <FaWarehouse /> Galpões
            </h1>
            <p className="text-gray-600 text-sm">
              Gerenciamento de galpões e sensores
            </p>
          </div>
          <button 
            className="btn btn-primary"
            onClick={() => setShowModal(true)}
          >
            <FaPlus /> Novo Galpão
          </button>
        </div>
      </div>

      {/* Galpões Grid */}
      <div className="galp-grid">
        {galpoes.map(galpao => {
          const latestSilo = getLatestReading(galpao.silo?.last_20_readings);
          const latestEnv = getLatestReading(galpao.environment?.last_20_readings);
          
          return (
            <div key={galpao.barn_id} className="galp-card">
              <div className="galp-title">
                <FaWarehouse className="text-green-600" />
                <h3>
                  {editingId === galpao.barn_id ? (
                    <input
                      type="text"
                      className="form-control"
                      value={formData.barn_name}
                      onChange={(e) => setFormData({...formData, barn_name: e.target.value})}
                    />
                  ) : (
                    galpao.barn_name
                  )}
                </h3>
              </div>

              <div className="galp-info">
                {/* Silo Info */}
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <FaSeedling className="text-green-600" />
                    <h4 className="font-medium">Silo</h4>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Nome:</span>
                    {editingId === galpao.barn_id ? (
                      <input
                        type="text"
                        className="form-control"
                        value={formData.silo_name}
                        onChange={(e) => setFormData({...formData, silo_name: e.target.value})}
                      />
                    ) : (
                      <span className="info-value">{galpao.silo?.name}</span>
                    )}
                  </div>
                  <div className="info-row">
                    <span className="info-label">Código:</span>
                    {editingId === galpao.barn_id ? (
                      <input
                        type="text"
                        className="form-control"
                        value={formData.silo_sensor_code}
                        onChange={(e) => setFormData({...formData, silo_sensor_code: e.target.value})}
                      />
                    ) : (
                      <span className="info-value code">{galpao.silo?.sensor_code}</span>
                    )}
                  </div>
                  {latestSilo && (
                    <div className="info-row">
                      <span className="info-label">Nível atual:</span>
                      <span className="info-value font-semibold">
                        {latestSilo.percentage.toFixed(1)}%
                      </span>
                    </div>
                  )}
                </div>

                {/* Environment Sensor Info */}
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <FaThermometerHalf className="text-green-600" />
                    <h4 className="font-medium">Sensor Ambiente</h4>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Nome:</span>
                    {editingId === galpao.barn_id ? (
                      <input
                        type="text"
                        className="form-control"
                        value={formData.env_name}
                        onChange={(e) => setFormData({...formData, env_name: e.target.value})}
                      />
                    ) : (
                      <span className="info-value">{galpao.environment?.name}</span>
                    )}
                  </div>
                  <div className="info-row">
                    <span className="info-label">Código:</span>
                    {editingId === galpao.barn_id ? (
                      <input
                        type="text"
                        className="form-control"
                        value={formData.env_sensor_code}
                        onChange={(e) => setFormData({...formData, env_sensor_code: e.target.value})}
                      />
                    ) : (
                      <span className="info-value code">{galpao.environment?.sensor_code}</span>
                    )}
                  </div>
                  {latestEnv && (
                    <>
                      <div className="info-row">
                        <span className="info-label">Temperatura:</span>
                        <span className="info-value">
                          {latestEnv.temperature}°C
                        </span>
                      </div>
                      <div className="info-row">
                        <span className="info-label">Umidade:</span>
                        <span className="info-value">
                          {latestEnv.humidity}%
                        </span>
                      </div>
                    </>
                  )}
                </div>

                {/* Metadata */}
                <div className="pt-4 border-t border-border">
                  <div className="info-row">
                    <span className="info-label">ID:</span>
                    <span className="info-value">#{galpao.barn_id}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Última consulta:</span>
                    <span className="info-value">{formatDate(galpao.consulted_at)}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-4 border-t border-border mt-4">
                  {editingId === galpao.barn_id ? (
                    <>
                      <button 
                        className="btn btn-primary btn-sm flex-1"
                        onClick={() => handleSave(galpao.barn_id)}
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
                    <>
                      <button 
                        className="btn btn-secondary btn-sm flex-1"
                        onClick={() => handleEdit(galpao)}
                      >
                        <FaEdit /> Editar
                      </button>
                      <button 
                        className="btn btn-secondary btn-sm flex-1"
                        onClick={() => handleDelete(galpao.barn_id)}
                      >
                        <FaTrash /> Excluir
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2 className="card-title">
                <FaPlus /> Novo Galpão
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
                <label className="form-label">Nome do Galpão *</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.barn_name}
                  onChange={(e) => setFormData({...formData, barn_name: e.target.value})}
                  placeholder="Ex: Galpão 01"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="form-group">
                  <label className="form-label">Nome do Silo *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.silo_name}
                    onChange={(e) => setFormData({...formData, silo_name: e.target.value})}
                    placeholder="Ex: Silo Principal"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Código do Sensor do Silo</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.silo_sensor_code}
                    onChange={(e) => setFormData({...formData, silo_sensor_code: e.target.value})}
                    placeholder="Ex: SILO123ABC"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">Nome do Sensor Ambiente</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.env_name}
                    onChange={(e) => setFormData({...formData, env_name: e.target.value})}
                    placeholder="Ex: Sensor Ambiente Norte"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Código do Sensor Ambiente</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.env_sensor_code}
                    onChange={(e) => setFormData({...formData, env_sensor_code: e.target.value})}
                    placeholder="Ex: ENV789XYZ"
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
                disabled={!formData.barn_name || !formData.silo_name}
              >
                <FaSave /> Criar Galpão
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Galpoes;