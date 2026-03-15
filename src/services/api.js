import axios from "axios";
import { mockBarns, mockDashboard } from "./mockData";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || "https://api-granjatech.onrender.com/api",
  headers: {
    "Content-Type": "application/json",
  },
});

class ApiService {
  constructor() {
    this.simulateDelay = 500;
  }

  // ============================
  // MÉTODO GENÉRICO (MOCK)
  // ============================
  async request(endpoint) {
    await new Promise((resolve) => setTimeout(resolve, this.simulateDelay));

    switch (endpoint) {
      case "/dashboard":
        return this.getDashboardData();
      case "/galpoes":
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
      timestamp: new Date().toISOString(),
    };
  }

  // ============================
  // GALPÕES (MOCK)
  // ============================
  async getGalpoes() {
    return {
      success: true,
      data: mockBarns,
      timestamp: new Date().toISOString(),
    };
  }

  async createGalpao(data) {
    const newGalpao = {
      barn_id: Math.max(...mockBarns.map((b) => b.barn_id)) + 1,
      ...data,
      consulted_at: new Date().toISOString(),
    };

    mockBarns.push(newGalpao);

    return {
      success: true,
      data: newGalpao,
      message: "Galpão criado com sucesso!",
    };
  }

  async updateGalpao(id, data) {
    const index = mockBarns.findIndex((b) => b.barn_id === id);

    if (index === -1) {
      throw new Error("Galpão não encontrado");
    }

    mockBarns[index] = {
      ...mockBarns[index],
      ...data,
      consulted_at: new Date().toISOString(),
    };

    return {
      success: true,
      data: mockBarns[index],
      message: "Galpão atualizado com sucesso!",
    };
  }

  async deleteGalpao(id) {
    const index = mockBarns.findIndex((b) => b.barn_id === id);

    if (index === -1) {
      throw new Error("Galpão não encontrado");
    }

    mockBarns.splice(index, 1);

    return {
      success: true,
      message: "Galpão deletado com sucesso!",
    };
  }

  // ======================================
  // SILOS (API REAL)
  // ======================================

  async getSilos() {
    try {
      const response = await api.get("/silos");
      console.log("Resposta da API:", response.data);
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar silos:", error);
      throw error;
    }
  }

  async createSilo(data) {
    try {
      const response = await api.post("/silo", data);
      return response.data;
    } catch (error) {
      console.error("Erro ao criar silo:", error);
      throw error;
    }
  }

  async updateSilo(sensorCode, data) {
    try {
      const response = await api.put(`/silo/${sensorCode}`, data);
      return response.data;
    } catch (error) {
      console.error("Erro ao atualizar silo:", error);
      throw error;
    }
  }

  async deleteSilo(sensorCode) {
    try {
      const response = await api.delete(`/silo/${sensorCode}`);
      return response.data;
    } catch (error) {
      console.error("Erro ao deletar silo:", error);
      throw error;
    }
  }
}

const apiService = new ApiService();

export default apiService;