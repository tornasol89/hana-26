import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getErrorMessage } from "@/features/auth/utils";
import { bookingsApi } from "./api";
import type { CreateBookingPayload } from "./api";

export const bookingKeys = {
  all: ["bookings"] as const,
  mine: () => [...bookingKeys.all, "mine"] as const,
};

export function useMyBookings() {
  return useQuery({
    queryKey: bookingKeys.mine(),
    queryFn: bookingsApi.getMine,
    staleTime: 1000 * 30,
  });
}

export function useCreateBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateBookingPayload) => bookingsApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookingKeys.mine() });
      toast.success("Reserva enviada. La profesional la revisará pronto.");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useAcceptBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => bookingsApi.accept(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookingKeys.mine() });
      toast.success("Reserva aceptada");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useRejectBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => bookingsApi.reject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookingKeys.mine() });
      toast.success("Reserva rechazada");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useCompleteBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => bookingsApi.complete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookingKeys.mine() });
      toast.success("Reserva marcada como completada");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}