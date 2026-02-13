import { mockBarns, mockDashboard } from './mockData';

const SILO_API_BASE_URL = 'https://api-granjatech.onrender.com/api';

class ApiService {
  constructor() {
    this.simulateDelay = 500; // ms
  }

  // ============================
  // MÉTODO GENÉRICO (MOCK)
  // ============================
  async request(endpoint, options = {}) {
    await new Promise(resolve => setTimeout(resolve, this.simulateDelay));

    switch (endpoint) {
      case '/dashboard':
        return this.getDashboardData();
      case '/galpoes':
        return this.getGalpoes();
      default:
        throw new Error(`Endpoint ${endpoint} não encontrado`);
    }
  }

  // ============================
  // DASHBOARD (MOCK)
  // ============================
  async getDashboardData() {
    return {
      success: true,
      data: mockDashboard,
      timestamp: new Date().toISOString()
    };
  }

  // ============================
  // GALPÕES (MOCK)
  // ============================
  async getGalpoes() {
    return {
      success: true,
      data: mockBarns,
      timestamp: new Date().toISOString()
    };
  }

  async createGalpao(data) {
    const newGalpao = {
      barn_id: Math.max(...mockBarns.map(b => b.barn_id)) + 1,
      ...data,
      consulted_at: new Date().toISOString()
    };

    mockBarns.push(newGalpao);

    return {
      success: true,
      data: newGalpao,
      message: 'Galpão criado com sucesso!'
    };
  }

  async updateGalpao(id, data) {
    const index = mockBarns.findIndex(b => b.barn_id === id);

    if (index === -1) {
      throw new Error('Galpão não encontrado');
    }

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

  // ======================================
  // ================= SILOS (API REAL)
  // ======================================

  async fetchSilos() {
    const response = await fetch(`${SILO_API_BASE_URL}/silos`);

    console.log("Status:", response.status);

    const data = await response.json();
    console.log("Resposta da API:", data);

    if (!response.ok) {
      throw new Error(`Erro ${response.status}`);
    }

    return data;
  }

  async getSilos() {
    const response = await fetch(`${SILO_API_BASE_URL}/silos`);

    if (!response.ok) {
      throw new Error('Erro ao buscar silos');
    }

    return await response.json();
  }

  async createSilo(data) {
    const response = await fetch(`${SILO_API_BASE_URL}/silo`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error('Erro ao criar silo');
    }

    return await response.json();
  }

  async updateSilo(id, data) {
    const response = await fetch(`${SILO_API_BASE_URL}/silo/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error('Erro ao atualizar silo');
    }

    return await response.json();
  }
}

export default new ApiService();