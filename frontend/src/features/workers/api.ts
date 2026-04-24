import api from "@/lib/api";
import type {
  WorkerProfile,
  WorkerDetail,
  WorkerFilters,
  WorkerProfileInput,
} from "./types";

export const workersApi = {
  list: async (filters: WorkerFilters = {}): Promise<WorkerProfile[]> => {
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

  getById: async (id: string): Promise<WorkerDetail> => {
    const { data } = await api.get<WorkerDetail>(`/workers/${id}`);
    return data;
  },

  getMyProfile: async (): Promise<WorkerProfile> => {
    const { data } = await api.get<WorkerProfile>("/workers/mi-perfil");
    return data;
  },

  createMyProfile: async (payload: WorkerProfileInput): Promise<WorkerProfile> => {
    const { data } = await api.post<WorkerProfile>("/workers", payload);
    return data;
  },

  updateMyProfile: async (payload: Partial<WorkerProfileInput>): Promise<WorkerProfile> => {
    const { data } = await api.put<WorkerProfile>("/workers/mi-perfil", payload);
    return data;
  },
};