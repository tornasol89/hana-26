import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { MailCheck, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { authApi } from "@/features/auth/api";
import { getErrorMessage } from "@/features/auth/utils";

export default function RegistroEmailEnviado() {
  const location = useLocation();
  // El email llega por state desde el flujo de registro:
  // navigate("/registro/email-enviado", { state: { email } })
  const email = (location.state as { email?: string } | null)?.email ?? null;

  const [enviando, setEnviando] = useState(false);

  const handleReenviar = async () => {
    if (!email || enviando) return;
    setEnviando(true);
    try {
      const res = await authApi.resendVerificationPublic(email);
      toast.success(res.mensaje);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f5f3ff] via-white to-[#fff1f2] px-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 text-center">
        <MailCheck className="h-16 w-16 mx-auto text-primary" />
        <h1 className="text-2xl font-bold mt-6 mb-2">Revisá tu email</h1>
        <p className="text-muted-foreground mb-6">
          Te enviamos un link de verificación
          {email ? (
            <>
              {" "}a <strong>{email}</strong>
            </>
          ) : null}
          . Hacé clic en él para activar tu cuenta. El link vence en 24 horas.
        </p>

        {email && (
          <Button
            variant="outline"
            className="w-full mb-3 gap-2"
            onClick={handleReenviar}
            disabled={enviando}
          >
            {enviando ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Reenviando...
              </>
            ) : (
              "Reenviar email"
            )}
          </Button>
        )}

        <Button asChild variant="hero" className="w-full">
          <Link to="/login">Ir al login</Link>
        </Button>

        <p className="text-xs text-muted-foreground mt-6">
          ¿No llegó? Revisá spam, o reenvialo. Si seguís con problemas,{" "}
          <Link to="/contacto" className="underline">contactanos</Link>.
        </p>
      </div>
    </div>
  );
}