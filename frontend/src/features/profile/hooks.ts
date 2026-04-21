import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { authService, getErrorMessage } from "@/lib/auth";
import { useAuth } from "@/contexts/AuthContext";
import type { Usuario } from "@/types/auth";
import { bookingKeys } from "@/features/bookings/hooks";

/** Actualiza datos básicos del usuario (nombre, apellido, región, comuna) */
export function useUpdateProfile() {
  const { refreshUser } = useAuth();

  return useMutation({
    mutationFn: (payload: Partial<Usuario>) => authService.updateProfile(payload),
    onSuccess: (usuarioActualizado) => {
      refreshUser(usuarioActualizado);
      toast.success("Datos actualizados correctamente");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

/** Sube la foto de perfil */
export function useUploadPhoto() {
  const { refreshUser } = useAuth();

  return useMutation({
    mutationFn: (file: File) => authService.uploadPhoto(file),
    onSuccess: (usuarioActualizado) => {
      refreshUser(usuarioActualizado);
      toast.success("Foto de perfil actualizada");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

/** Sube una cara del carnet (frente o dorso) */
export function useUploadCarnet() {
  const { refreshUser } = useAuth();

  return useMutation({
    mutationFn: ({ file, lado }: { file: File; lado: "frente" | "dorso" }) =>
      authService.uploadCarnet(file, lado),
    onSuccess: (usuarioActualizado, variables) => {
      refreshUser(usuarioActualizado);
      toast.success(
        `${variables.lado === "frente" ? "Frente" : "Dorso"} del carnet enviado`
      );
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

/** Cierra sesión y limpia el cache de React Query */
export function useLogout() {
  const { logout } = useAuth();
  const queryClient = useQueryClient();

  return () => {
    logout();
    queryClient.clear();
    // Invalidar queries protegidas por si quedan colgadas
    queryClient.removeQueries({ queryKey: bookingKeys.all });
  };
}