import api from "@/lib/api";
import type { ReviewsResumen, Review } from "./types";

function normalizarResumen(raw: ReviewsResumen): ReviewsResumen {
  return {
    ...raw,
    promedio: typeof raw.promedio === "string" ? parseFloat(raw.promedio) : raw.promedio,
  };
}

export interface CreateReviewPayload {
  reserva: string;
  destinataria: string;
  tipo: "clienta_a_trabajadora" | "trabajadora_a_clienta";
  estrellas: number;
  comentario?: string;
  metricas?: {
    puntualidad?: number;
    confiabilidad?: number;
    calidad?: number;
    comunicacion?: number;
    precio?: number;
  };
}

export const reviewsApi = {
  getByUserId: async (userId: string): Promise<ReviewsResumen> => {
    const { data } = await api.get<ReviewsResumen>(`/reviews/${userId}`);
    return normalizarResumen(data);
  },

  hasReviewedBooking: async (bookingId: string): Promise<{ yaEvaluo: boolean }> => {
    const { data } = await api.get<{ yaEvaluo: boolean }>(`/reviews/reserva/${bookingId}`);
    return data;
  },

  create: async (payload: CreateReviewPayload): Promise<Review> => {
    const { data } = await api.post<Review>("/reviews", payload);
    return data;
  },
};