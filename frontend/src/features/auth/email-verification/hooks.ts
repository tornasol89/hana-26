import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { getErrorMessage } from "@/features/auth/utils";
import { emailVerificationApi } from "./api";

/** Verifica el email a partir del token del link */
export function useVerifyEmail() {
  const { refreshUser, user } = useAuth();

  return useMutation({
    mutationFn: (token: string) => emailVerificationApi.verify(token),
    onSuccess: () => {
      // Si la usuaria está logueada, refrescamos su estado local
      if (user) refreshUser({ ...user, emailVerificado: true });
    },
  });
}

/** Reenvía el email de verificación (usuaria logueada) */
export function useResendVerification() {
  return useMutation({
    mutationFn: () => emailVerificationApi.resend(),
    onSuccess: () => {
      toast.success("Te enviamos un nuevo email de verificación");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

/**
 * Reenvío público (sin login) — para usar desde la pantalla de login
 * cuando el backend devuelve EMAIL_NO_VERIFICADO.
 */
export function useResendVerificationPublic() {
  return useMutation({
    mutationFn: (email: string) => emailVerificationApi.resendPublic(email),
    onSuccess: (data) => {
      toast.success(data.mensaje);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}