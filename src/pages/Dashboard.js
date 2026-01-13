import React, { useState, useEffect } from 'react';
import { 
  FaWarehouse, 
  FaThermometerHalf, 
  FaTint, 
  FaSeedling,
  FaExclamationTriangle,
  FaSync,
  FaArrowUp,
  FaArrowDown
} from 'react-icons/fa';
import apiService from '../services/api';
import { formatDate } from '../services/mockData';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadDashboardData = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    
    try {
      const response = await apiService.request('/dashboard');
      setDashboardData(response.data);
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleRefresh = () => {
    loadDashboardData(true);
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'normal': return 'var(--success)';
      case 'atencao': return 'var(--warning)';
      case 'critico': return 'var(--error)';
      default: return 'var(--secondary)';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'normal': return null;
      case 'atencao': return <FaExclamationTriangle className="text-warning" />;
      case 'critico': return <FaExclamationTriangle className="text-error" />;
      default: return null;
    }
  };

  const getNivelRacaoColor = (nivel) => {
    if (nivel >= 70) return 'var(--success)';
    if (nivel >= 40) return 'var(--warning)';
    return 'var(--error)';
  };

  if (loading) {
    return (
      <div className="content">
        <div className="card">
          <div className="flex items-center justify-center p-8">
            <div className="text-gray-600">Carregando dashboard...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="content">
      {/* Header */}
      <div className="card mb-6">
        <div className="card-header">
          <div>
            <h1 className="card-title">
              <FaWarehouse /> Dashboard
            </h1>
            <p className="text-gray-600 text-sm">
              Monitoramento em tempo real dos galpões
            </p>
          </div>
          <button 
            className={`btn btn-secondary ${refreshing ? 'rotating' : ''}`}
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <FaSync /> {refreshing ? 'Atualizando...' : 'Atualizar'}
          </button>
        </div>   
                     
        <div className="galp-grid">
          {dashboardData?.galpoes?.map(galpao => {
            const latestUpdate = formatDate(galpao.ultimaAtualizacao);
            
            return (
              <div key={galpao.id} className="galp-card" style={{ borderLeft: `4px solid ${getStatusColor(galpao.status)}` }}>
                <div className="galp-title">
                  <FaWarehouse className="text-green-600" />
                  <h3>{galpao.nome}</h3>
                  <div className="flex items-center gap-2 ml-auto">
                    {getStatusIcon(galpao.status)}
                    <span 
                      className="text-sm font-medium"
                      style={{ color: getStatusColor(galpao.status) }}
                    >
                      {galpao.status === 'normal' ? 'Normal' : 
                       galpao.status === 'atencao' ? 'Atenção' : 'Crítico'}
                    </span>
                  </div>
                </div>

                <div className="galp-info">
                  {/* Temperatura */}
                  <div className="metric-row">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-600 flex items-center gap-2">
                        <FaThermometerHalf /> Temperatura
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{galpao.temperatura.toFixed(1)}°C</span>
                        {galpao.temperatura > 25 && <FaArrowUp className="text-error" />}
                        {galpao.temperatura < 20 && <FaArrowDown className="text-info" />}
                      </div>
                    </div>
                    <div className="metric-bar">
                      <div 
                        className="bar-fill" 
                        style={{ 
                          width: `${((galpao.temperatura - 15) / 15) * 100}%`,
                          backgroundColor: galpao.temperatura > 25 ? 'var(--error)' : 
                                         galpao.temperatura < 20 ? 'var(--info)' : 'var(--success)'
                        }}
                      ></div>
                    </div>
                  </div>

                  {/* Umidade */}
                  <div className="metric-row">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-600 flex items-center gap-2">
                        <FaTint /> Umidade
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{galpao.umidade.toFixed(0)}%</span>
                        {galpao.umidade > 70 && <FaArrowUp className="text-info" />}
                        {galpao.umidade < 50 && <FaArrowDown className="text-warning" />}
                      </div>
                    </div>
                    <div className="metric-bar">
                      <div 
                        className="bar-fill" 
                        style={{ 
                          width: `${galpao.umidade}%`,
                          backgroundColor: galpao.umidade > 70 ? 'var(--info)' : 
                                         galpao.umidade < 50 ? 'var(--warning)' : 'var(--success)'
                        }}
                      ></div>
                    </div>
                  </div>

                  {/* Nível de Ração */}
                  <div className="metric-row">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-600 flex items-center gap-2">
                        <FaSeedling /> Nível de Ração
                      </span>
                      <span className="font-medium">{galpao.nivelRacao.toFixed(0)}%</span>
                    </div>
                    <div className="metric-bar">
                      <div 
                        className="bar-fill" 
                        style={{ 
                          width: `${galpao.nivelRacao}%`,
                          backgroundColor: getNivelRacaoColor(galpao.nivelRacao)
                        }}
                      ></div>
                    </div>
                  </div>

                  {/* Info Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-border mt-4">
                    <div>
                      <div className="text-sm text-gray-600">Consumo/Dia:</div>
                      <div className="font-medium">{galpao.consumoDia} kg</div>
                    </div>
                    <div className="text-sm text-gray-600">
                      Atualizado: {latestUpdate}
                    </div>
                  </div>

                  {/* Alertas */}
                  {galpao.alertas.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-border">
                      <div className="flex items-start gap-2">
                        <FaExclamationTriangle className="text-error mt-0.5" />
                        <div className="flex flex-wrap gap-1">
                          {galpao.alertas.map((alerta, index) => (
                            <span key={index} className="badge badge-error text-xs">
                              {alerta}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;