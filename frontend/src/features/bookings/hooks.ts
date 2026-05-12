import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getErrorMessage } from "@/features/auth/utils";
import { bookingsApi } from "./api";
import type { CreateBookingPayload } from "./api";

export const bookingKeys = {
  all: ["bookings"] as const,
  mine: (modo?: string) => [...bookingKeys.all, "mine", modo ?? "default"] as const,
};

export function useMyBookings(modo?: "clienta" | "trabajadora") {
  return useQuery({
    queryKey: bookingKeys.mine(modo),
    queryFn: () => bookingsApi.getMine(modo),
    staleTime: 1000 * 30,
  });
}

export function useCreateBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateBookingPayload) => bookingsApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookingKeys.all });
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
      queryClient.invalidateQueries({ queryKey: bookingKeys.all });
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
      queryClient.invalidateQueries({ queryKey: bookingKeys.all });
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
      queryClient.invalidateQueries({ queryKey: bookingKeys.all });
      toast.success("Reserva marcada como completada");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useConfirmarInicio() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => bookingsApi.confirmarInicio(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookingKeys.all });
      toast.success("Inicio del servicio confirmado");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useConfirmarFin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => bookingsApi.confirmarFin(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookingKeys.all });
      toast.success("Fin del servicio confirmado");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useDisputar() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      ...payload
    }: {
      id: string;
      fase: "inicio" | "fin";
      motivo: string;
    }) => bookingsApi.disputar(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookingKeys.all });
      toast.warning("Disputa registrada. Ambas partes pueden explicar su versión.");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}