import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getErrorMessage } from "@/features/auth/utils";
import { adminApi } from "./api";
import type { EstadoVerificacion } from "./types";

export const adminKeys = {
  all: ["admin"] as const,
  stats: () => [...adminKeys.all, "stats"] as const,
  usuarias: () => [...adminKeys.all, "usuarias"] as const,
};

export function useAdminStats() {
  return useQuery({
    queryKey: adminKeys.stats(),
    queryFn: adminApi.getStats,
    staleTime: 1000 * 60,
  });
}

export function useAdminUsuarias() {
  return useQuery({
    queryKey: adminKeys.usuarias(),
    queryFn: () => adminApi.listUsuarias(),
    staleTime: 1000 * 30,
  });
}

interface VerificarPayload {
  id: string;
  decision: Extract<EstadoVerificacion, "aprobado" | "rechazado">;
}

export function useVerificarUsuaria() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, decision }: VerificarPayload) => adminApi.verificar(id, decision),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: adminKeys.usuarias() });
      queryClient.invalidateQueries({ queryKey: adminKeys.stats() });
      toast.success(
        variables.decision === "aprobado"
          ? "Verificación aprobada"
          : "Verificación rechazada"
      );
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useDesactivarUsuaria() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminApi.desactivar(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.usuarias() });
      queryClient.invalidateQueries({ queryKey: adminKeys.stats() });
      toast.success("Cuenta desactivada");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}