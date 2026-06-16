import { Mail, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useResendVerification } from "../hooks";

/**
 * Banner que se muestra solo si el email no está verificado.
 * Si está verificado, no renderiza nada.
 */
export function BannerNoVerificado() {
  const { user } = useAuth();
  const resend = useResendVerification();

  if (!user || user.emailVerificado) return null;

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
      <Mail className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
      <div className="flex-1">
        <p className="font-medium text-amber-900 text-sm">
          Tu email todavía no está verificado
        </p>
        <p className="text-amber-800 text-sm mt-1">
          Te enviamos un link a <strong>{user.email}</strong>. Revisá tu inbox y spam.
        </p>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={() => resend.mutate()}
        disabled={resend.isPending}
        className="shrink-0"
      >
        {resend.isPending ? (
          <>
            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
            Enviando...
          </>
        ) : (
          "Reenviar"
        )}
      </Button>
    </div>
  );
}