import api from "@/lib/api";
import type { Message } from "./types";

export const messagesApi = {
  getByBooking: async (bookingId: string): Promise<Message[]> => {
    const { data } = await api.get<Message[]>(`/messages/${bookingId}`);
    return data;
  },

  send: async (bookingId: string, texto: string): Promise<Message> => {
    const { data } = await api.post<Message>(`/messages/${bookingId}`, { texto });
    return data;
  },

  markRead: async (bookingId: string): Promise<void> => {
    await api.put(`/messages/${bookingId}/leer`);
  },
};