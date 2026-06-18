import api from "@/lib/api";
import type {
  AdminStats,
  EstadoVerificacion,
  UsuariaAdmin,
  UsuariasFilters,
} from "./types";

export const adminApi = {
  getStats: async (): Promise<AdminStats> => {
    const { data } = await api.get<AdminStats>("/admin/stats");
    return data;
  },

  listUsuarias: async (filters: UsuariasFilters = {}): Promise<UsuariaAdmin[]> => {
    const params: Record<string, string> = {};
    if (filters.tipo) params.tipo = filters.tipo;
    if (filters.verificacion) params.verificacion = filters.verificacion;
    if (filters.activa !== undefined) params.activa = String(filters.activa);
    if (filters.q) params.q = filters.q;
    const { data } = await api.get<UsuariaAdmin[]>("/admin/usuarias", { params });
    return data;
  },

  verificar: async (
    id: string,
    decision: Extract<EstadoVerificacion, "aprobado" | "rechazado">
  ): Promise<void> => {
    await api.patch(`/admin/usuarias/${id}/verificar`, { decision });
  },

  desactivar: async (id: string): Promise<void> => {
    await api.delete(`/admin/usuarias/${id}`);
  },
};