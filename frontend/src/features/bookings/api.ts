import api from "@/lib/api";
import type { Booking } from "./types";

export const bookingsApi = {
  getMine: async (): Promise<Booking[]> => {
    const { data } = await api.get<Booking[]>("/bookings/mis-reservas");
    return data;
  },
};