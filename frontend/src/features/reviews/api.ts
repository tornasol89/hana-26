import api from "@/lib/api";
import type { ReviewsResumen } from "./types";

/**
 * El backend puede devolver `promedio` como string ("4.5") cuando hay reviews,
 * o como number (0) cuando no. Normalizamos a number siempre.
 */
function normalizarResumen(raw: ReviewsResumen): ReviewsResumen {
  return {
    ...raw,
    promedio: typeof raw.promedio === "string" ? parseFloat(raw.promedio) : raw.promedio,
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
};