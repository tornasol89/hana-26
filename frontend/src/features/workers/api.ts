import api from "@/lib/api";
import type {
  WorkerProfile,
  WorkerDetail,
  WorkerFilters,
  WorkerProfileInput,
  HorarioSemanal,
  Disponibilidad,
} from "./types";

export const workersApi = {
  list: async (filters: WorkerFilters = {}): Promise<WorkerProfile[]> => {
    const params: Record<string, string> = {};
    if (filters.categoria) params.categoria = filters.categoria;
    if (filters.subcategoria) params.subcategoria = filters.subcategoria;
    if (filters.region) params.region = filters.region;
    const { data } = await api.get<WorkerProfile[]>("/workers", { params });
    return data;
 
  },

  getById: async (id: string): Promise<WorkerDetail> => {
    const { data } = await api.get<WorkerDetail>(`/workers/${id}`);
    return data;
  },

  getMyProfile: async (): Promise<WorkerProfile | null> => {
    try {
      const { data } = await api.get<WorkerProfile>("/workers/mi-perfil");
      return data;
    } catch (err: unknown) {
      if (
        err &&
        typeof err === "object" &&
        "response" in err &&
        (err as { response?: { status?: number } }).response?.status === 404
      ) {
        return null;
      }
      throw err;
    }
  },

  createMyProfile: async (payload: WorkerProfileInput): Promise<WorkerProfile> => {
    const { data } = await api.post<WorkerProfile>("/workers", payload);
    return data;
  },

  updateMyProfile: async (payload: Partial<WorkerProfileInput>): Promise<WorkerProfile> => {
    const { data } = await api.put<WorkerProfile>("/workers/mi-perfil", payload);
    return data;
  },

  agregarCertificado: async (formData: FormData): Promise<WorkerProfile> => {
    const { data } = await api.post<WorkerProfile>("/workers/mi-perfil/certificados", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },

  eliminarCertificado: async (certId: string): Promise<WorkerProfile> => {
    const { data } = await api.delete<WorkerProfile>(`/workers/mi-perfil/certificados/${certId}`);
    return data;
  },

  getDisponibilidad: async (): Promise<Disponibilidad> => {
    const { data } = await api.get<Disponibilidad>("/workers/mi-disponibilidad");
    return data;
  },

  updateDisponibilidad: async (payload: Partial<Disponibilidad>): Promise<Disponibilidad> => {
    const { data } = await api.put<Disponibilidad>("/workers/mi-disponibilidad", payload);
    return data;
  },
};