// Dados mockados baseados no JSON fornecido
export const mockBarns = [
  {
    barn_id: 1,
    barn_name: "Galpão 01",
    silo: {
      id: 1,
      name: "Silo Principal",
      sensor_code: "SILO123ABC",
      last_20_readings: [
        {
          level_value: "377",
          percentage: 188.5,
          timestamp: "2025-11-21T17:35:54.265Z"
        },
        {
          level_value: "373",
          percentage: 186.5,
          timestamp: "2025-11-21T17:35:44.356Z"
        },
        {
          level_value: "373",
          percentage: 186.5,
          timestamp: "2025-11-21T17:35:34.208Z"
        }
      ]
    },
    environment: {
      id: 1,
      name: "Sensor Ambiente Norte",
      sensor_code: "ENV789XYZ",
      last_20_readings: [
        {
          temperature: 22.5,
          humidity: 65,
          timestamp: "2025-11-21T17:35:54.265Z"
        }
      ]
    },
    consulted_at: "2025-11-21T17:37:16.140Z",
    status: "normal"
  },
  {
    barn_id: 2,
    barn_name: "Galpão 02",
    silo: {
      id: 2,
      name: "Silo Secundário",
      sensor_code: "SILO456DEF",
      last_20_readings: [
        {
          level_value: "240",
          percentage: 45,
          timestamp: "2025-11-21T17:35:54.265Z"
        }
      ]
    },
    environment: {
      id: 2,
      name: "Sensor Ambiente Sul",
      sensor_code: "ENV456ABC",
      last_20_readings: [
        {
          temperature: 24.3,
          humidity: 58,
          timestamp: "2025-11-21T17:35:54.265Z"
        }
      ]
    },
    consulted_at: "2025-11-21T17:37:16.140Z",
    status: "atencao"
  }
];

export const mockDashboard = {
  summary: {
    total_galpoes: 6,
    galpoes_normais: 3,
    galpoes_atencao: 2,
    galpoes_criticos: 1,
    temperatura_media: 23.1,
    umidade_media: 63.3
  },
  galpoes: mockBarns.map(barn => {
    const lastSiloReading = barn.silo.last_20_readings[0];
    const lastEnvReading = barn.environment.last_20_readings[0];
    
    return {
      id: barn.barn_id,
      nome: barn.barn_name,
      temperatura: lastEnvReading?.temperature || 0,
      umidade: lastEnvReading?.humidity || 0,
      nivelRacao: lastSiloReading?.percentage || 0,
      consumoDia: Math.floor(Math.random() * 200) + 100,
      status: barn.status || "normal",
      ultimaAtualizacao: barn.consulted_at,
      alertas: barn.status === "critico" 
        ? ["Temperatura alta", "Umidade baixa"] 
        : barn.status === "atencao" 
          ? ["Nível de ração baixo"] 
          : []
    };
  })
};

// Helper para formatar datas
export const formatDate = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  
  if (diffMins < 1) return "Agora mesmo";
  if (diffMins < 60) return `${diffMins} min atrás`;
  if (diffHours < 24) return `${diffHours} horas atrás`;
  
  return date.toLocaleDateString('pt-BR');
};

// Helper para obter dados mais recentes
export const getLatestReading = (readings) => {
  if (!readings || readings.length === 0) return null;
  
  // Ordena por timestamp e pega o mais recente
  return [...readings].sort((a, b) => 
    new Date(b.timestamp) - new Date(a.timestamp)
  )[0];
};