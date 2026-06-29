import api from "@/lib/api";
import type { PortfolioItem, CreatePortfolioPayload } from "./types";

export const portfolioApi = {
  getMisItems: async (): Promise<PortfolioItem[]> => {
    const { data } = await api.get<PortfolioItem[]>("/portfolio/mis-items");
    return data;
  },

  getByWorker: async (workerProfileId: string): Promise<PortfolioItem[]> => {
    const { data } = await api.get<PortfolioItem[]>(`/portfolio/worker/${workerProfileId}`);
    return data;
  },

  getParaRespaldar: async (): Promise<PortfolioItem[]> => {
    const { data } = await api.get<PortfolioItem[]>("/portfolio/para-respaldar");
    return data;
  },

  create: async (payload: CreatePortfolioPayload): Promise<PortfolioItem> => {
    const form = new FormData();
    form.append("foto", payload.foto);
    form.append("titulo", payload.titulo);
    if (payload.descripcion) form.append("descripcion", payload.descripcion);
    if (payload.reservaId) form.append("reservaId", payload.reservaId);
    const { data } = await api.post<PortfolioItem>("/portfolio", form);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/portfolio/${id}`);
  },

  respaldar: async (id: string): Promise<PortfolioItem> => {
    const { data } = await api.post<PortfolioItem>(`/portfolio/${id}/respaldar`);
    return data;
  },
};
