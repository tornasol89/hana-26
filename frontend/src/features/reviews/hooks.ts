import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getErrorMessage } from "@/features/auth/utils";
import { reviewsApi } from "./api";
import type { CreateReviewPayload } from "./api";

export const reviewKeys = {
  all: ["reviews"] as const,
  byUser: (userId: string) => [...reviewKeys.all, "user", userId] as const,
  byBooking: (bookingId: string) => [...reviewKeys.all, "booking", bookingId] as const,
};

export function useUserReviews(userId: string | undefined) {
  return useQuery({
    queryKey: reviewKeys.byUser(userId ?? ""),
    queryFn: () => reviewsApi.getByUserId(userId!),
    enabled: Boolean(userId),
    staleTime: 1000 * 60,
  });
}

export function useHasReviewedBooking(bookingId: string | undefined) {
  return useQuery({
    queryKey: reviewKeys.byBooking(bookingId ?? ""),
    queryFn: () => reviewsApi.hasReviewedBooking(bookingId!),
    enabled: Boolean(bookingId),
  });
}

export function useCreateReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateReviewPayload) => reviewsApi.create(payload),
    onSuccess: (_data, variables) => {
      // Invalida la review de esa reserva (para que useHasReviewedBooking se entere)
      queryClient.invalidateQueries({
        queryKey: reviewKeys.byBooking(variables.reserva),
      });
      // Invalida las reviews recibidas por la destinataria
      queryClient.invalidateQueries({
        queryKey: reviewKeys.byUser(variables.destinataria),
      });
      toast.success("Evaluación enviada. Gracias por contribuir 🙌");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}