import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getErrorMessage } from "@/features/auth/utils";
import { messagesApi } from "./api";
import type { Message } from "./types";

export const messageKeys = {
  all: ["messages"] as const,
  byBooking: (bookingId: string) => [...messageKeys.all, "booking", bookingId] as const,
};

/**
 * Hook con polling cada 5s mientras el chat está abierto.
 * Cuando enabled=false (chat cerrado), corta el polling.
 */
export function useMessages(bookingId: string | undefined, enabled: boolean) {
  return useQuery({
    queryKey: messageKeys.byBooking(bookingId ?? ""),
    queryFn: () => messagesApi.getByBooking(bookingId!),
    enabled: Boolean(bookingId) && enabled,
    refetchInterval: enabled ? 5000 : false,
    staleTime: 0,
  });
}

export function useSendMessage(bookingId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (texto: string) => messagesApi.send(bookingId, texto),
    onSuccess: (newMessage) => {
      // Optimismo: agregamos el mensaje al cache para que aparezca al instante
      queryClient.setQueryData<Message[]>(messageKeys.byBooking(bookingId), (old) =>
        old ? [...old, newMessage] : [newMessage]
      );
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

/**
 * Marca los mensajes de la reserva como leídos. Lo llamamos cuando se abre el chat
 * y cada vez que el polling trae mensajes nuevos.
 */
export function useMarkRead(bookingId: string | undefined, enabled: boolean) {
  useEffect(() => {
    if (!bookingId || !enabled) return;
    messagesApi.markRead(bookingId).catch(() => {
      // Silencioso: si falla no es crítico
    });
  }, [bookingId, enabled]);
}