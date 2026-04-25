import api from "./api";
import type {
  WorkerProfile,
  WorkerDetail,
  WorkerFilters,
} from "@/types/worker";

export const workersService = {
  async list(filters: WorkerFilters = {}): Promise<WorkerProfile[]> {
    // Filtramos filtros vacíos/"Todas" para no mandar basura al backend
    const params: Record<string, string> = {};
    if (filters.categoria && filters.categoria !== "Todas") {
      params.categoria = filters.categoria;
    }
    if (filters.subcategoria) params.subcategoria = filters.subcategoria;
    if (filters.region && filters.region !== "Todas") {
      params.region = filters.region;
    }

    const { data } = await api.get<WorkerProfile[]>("/workers", { params });
    return data;
  },

  async getById(id: string): Promise<WorkerDetail> {
    const { data } = await api.get<WorkerDetail>(`/workers/${id}`);
    return data;
  },

  async getMyProfile(): Promise<WorkerProfile> {
    const { data } = await api.get<WorkerProfile>("/workers/mi-perfil");
    return data;
  },
};