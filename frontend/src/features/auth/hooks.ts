import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { authApi } from "./api";
import { session } from "./session";
import { getErrorMessage } from "./utils";
import { bookingKeys } from "@/features/bookings/hooks";
import type { LoginPayload, RegisterPayload, UpdateProfilePayload, Usuario } from "./types";

/** Login: guarda sesión + actualiza contexto */
export function useLogin() {
  const { refreshUser } = useAuth();

  return useMutation({
    mutationFn: (payload: LoginPayload) => authApi.login(payload),
    onSuccess: ({ token, usuario }) => {
      session.save({ token, usuario });
      refreshUser(usuario);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

/** Register: guarda sesión + actualiza contexto */
export function useRegister() {
  const { refreshUser } = useAuth();

  return useMutation({
    mutationFn: (payload: RegisterPayload) => authApi.register(payload),
    onSuccess: ({ token, usuario }) => {
      session.save({ token, usuario });
      refreshUser(usuario);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

/** Actualizar datos propios */
export function useUpdateProfile() {
  const { refreshUser } = useAuth();

  return useMutation({
    mutationFn: (payload: UpdateProfilePayload) => authApi.updateProfile(payload),
    onSuccess: (usuario) => {
      refreshUser(usuario);
      toast.success("Datos actualizados correctamente");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

/** Subir foto de perfil */
export function useUploadPhoto() {
  const { refreshUser } = useAuth();

  return useMutation({
    mutationFn: (file: File) => authApi.uploadPhoto(file),
    onSuccess: (usuario) => {
      refreshUser(usuario);
      toast.success("Foto de perfil actualizada");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

/** Subir una cara del carnet (frente o dorso) */
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
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

/** Logout: limpia sesión, contexto, cache de bookings y compromiso */
export function useLogout() {
  const { logout } = useAuth();
  const queryClient = useQueryClient();

  return () => {
    // 1. Limpiar contexto (esto ya hace session.clear internamente)
    logout();

    // 2. Limpiar cache de TanStack Query
    //    Primero las bookings explícitamente (UX más rápida si vuelve a loguearse)
    queryClient.removeQueries({ queryKey: bookingKeys.all });
    //    Después todo el resto
    queryClient.clear();

    // 3. Limpiar flags del compromiso (se guardan en sessionStorage en Compromiso.tsx)
    sessionStorage.removeItem("aceptoCompromiso");
    sessionStorage.removeItem("fechaAceptacion");
  };
}