import { mockBarns, mockDashboard } from './mockData';

// Simulação de API
const API_BASE_URL = 'https://api.grupomoriz.com/v1';

class ApiService {
  constructor() {
    this.simulateDelay = 500; // ms
  }

  // Método genérico para requisições
  async request(endpoint, options = {}) {
    // Simulação de delay de rede
    await new Promise(resolve => setTimeout(resolve, this.simulateDelay));
    
    // Em produção, substituir por fetch real
    switch(endpoint) {
      case '/dashboard':
        return this.getDashboardData();
      case '/galpoes':
        return this.getGalpoes();
      default:
        throw new Error(`Endpoint ${endpoint} não encontrado`);
    }
  }

  // Dashboard
  async getDashboardData() {
    return {
      success: true,
      data: mockDashboard,
      timestamp: new Date().toISOString()
    };
  }

  // Galpões
  async getGalpoes() {
    return {
      success: true,
      data: mockBarns,
      timestamp: new Date().toISOString()
    };
  }

  // Criar novo galpão
  async createGalpao(data) {
    // Simula criação no backend
    const newGalpao = {
      barn_id: Math.max(...mockBarns.map(b => b.barn_id)) + 1,
      ...data,
      consulted_at: new Date().toISOString()
    };
    
    // Em produção, seria POST para API
    mockBarns.push(newGalpao);
    
    return {
      success: true,
      data: newGalpao,
      message: 'Galpão criado com sucesso!'
    };
  }

  // Atualizar galpão
  async updateGalpao(id, data) {
    const index = mockBarns.findIndex(b => b.barn_id === id);
    
    if (index === -1) {
      throw new Error('Galpão não encontrado');
    }
    
    // Atualiza os dados
    mockBarns[index] = {
      ...mockBarns[index],
      ...data,
      consulted_at: new Date().toISOString()
    };
    
    return {
      success: true,
      data: mockBarns[index],
      message: 'Galpão atualizado com sucesso!'
    };
  }

  // Deletar galpão
  async deleteGalpao(id) {
    const index = mockBarns.findIndex(b => b.barn_id === id);
    
    if (index === -1) {
      throw new Error('Galpão não encontrado');
    }
    
    mockBarns.splice(index, 1);
    
    return {
      success: true,
      message: 'Galpão deletado com sucesso!'
    };
  }
}

export default new ApiService();