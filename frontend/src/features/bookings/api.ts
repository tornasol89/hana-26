import api from "@/lib/api";
import type { Booking } from "./types";

export interface CreateBookingPayload {
  trabajadora: string;
  servicio: string;
  fecha: string; // ISO datetime
  notas?: string;
  regionServicio: string;
  comunaServicio: string;
  direccionServicio?: string;
}

export const bookingsApi = {
  getMine: async (modo?: "clienta" | "trabajadora"): Promise<Booking[]> => {
    const params = modo ? { modo } : {};
    const { data } = await api.get<Booking[]>("/bookings/mis-reservas", { params });
    return data;
  },

  create: async (payload: CreateBookingPayload): Promise<Booking> => {
    const { data } = await api.post<Booking>("/bookings", payload);
    return data;
  },

  accept: async (id: string): Promise<Booking> => {
    const { data } = await api.put<Booking>(`/bookings/${id}/aceptar`);
    return data;
  },

  reject: async (id: string): Promise<Booking> => {
    const { data } = await api.put<Booking>(`/bookings/${id}/rechazar`);
    return data;
  },

  complete: async (id: string): Promise<Booking> => {
    const { data } = await api.put<Booking>(`/bookings/${id}/completar`);
    return data;
  },

  confirmarInicio: async (id: string): Promise<Booking> => {
    const { data } = await api.put<Booking>(`/bookings/${id}/confirmar-inicio`);
    return data;
  },

  confirmarFin: async (id: string): Promise<Booking> => {
    const { data } = await api.put<Booking>(`/bookings/${id}/confirmar-fin`);
    return data;
  },

  disputar: async (
    id: string,
    payload: { fase: "inicio" | "fin"; motivo: string }
  ): Promise<Booking> => {
    const { data } = await api.put<Booking>(`/bookings/${id}/disputar`, payload);
    return data;
  },
};