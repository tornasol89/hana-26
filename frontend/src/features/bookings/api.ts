import api from "@/lib/api";
import type { Booking } from "./types";

export interface CreateBookingPayload {
  trabajadora: string;
  servicio: string;
  fecha: string; // ISO datetime
  notas?: string;
}

export const bookingsApi = {
  getMine: async (): Promise<Booking[]> => {
    const { data } = await api.get<Booking[]>("/bookings/mis-reservas");
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
};