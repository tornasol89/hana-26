import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { authApi } from "@/features/auth/api";
import { getErrorMessage } from "@/features/auth/utils";
import type { Usuario } from "@/features/auth/types";
import { bookingKeys } from "@/features/bookings/hooks";

export function useUpdateProfile() {
  const { refreshUser } = useAuth();
  return useMutation({
    mutationFn: (payload: Partial<Usuario>) => authApi.updateProfile(payload),
    onSuccess: (usuario) => {
      refreshUser(usuario);
      toast.success("Datos actualizados correctamente");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useUploadPhoto() {
  const { refreshUser } = useAuth();
  return useMutation({
    mutationFn: (file: File) => authApi.uploadPhoto(file),
    onSuccess: (usuario) => {
      refreshUser(usuario);
      toast.success("Foto de perfil actualizada");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useUploadCarnet() {
  const { refreshUser } = useAuth();
  return useMutation({
    mutationFn: ({ file, lado }: { file: File; lado: "frente" | "dorso" }) =>
      authApi.uploadCarnet(file, lado),
    onSuccess: (usuario, variables) => {
      refreshUser(usuario);
      toast.success(
        `${variables.lado === "frente" ? "Frente" : "Dorso"} del carnet enviado`
      );
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useLogout() {
  const { logout } = useAuth();
  const queryClient = useQueryClient();

  return () => {
    logout();
    queryClient.removeQueries({ queryKey: bookingKeys.all });
    queryClient.clear();
  };
}