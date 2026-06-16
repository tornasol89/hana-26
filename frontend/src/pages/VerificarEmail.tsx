import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { authApi } from "@/features/auth/api";
import { getErrorMessage } from "@/features/auth/utils";

type Estado = "verificando" | "exito" | "error";

export default function VerificarEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [estado, setEstado] = useState<Estado>("verificando");
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    if (!token) {
      setEstado("error");
      setMensaje("Link inválido: falta el token.");
      return;
    }

    authApi
      .verifyEmail(token)
      .then((res) => {
        setEstado("exito");
        setMensaje(res.mensaje);
      })
      .catch((err) => {
        setEstado("error");
        setMensaje(getErrorMessage(err));
      });
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f5f3ff] via-white to-[#fff1f2] px-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 text-center">
        {estado === "verificando" && (
          <>
            <Loader2 className="h-16 w-16 mx-auto text-primary animate-spin" />
            <h1 className="text-2xl font-bold mt-6 mb-2">Verificando tu email...</h1>
            <p className="text-muted-foreground">Esto toma un segundo.</p>
          </>
        )}

        {estado === "exito" && (
          <>
            <CheckCircle2 className="h-16 w-16 mx-auto text-green-500" />
            <h1 className="text-2xl font-bold mt-6 mb-2">¡Email verificado!</h1>
            <p className="text-muted-foreground mb-6">
              Ya podés iniciar sesión y usar Hana con todas sus funciones.
            </p>
            <Button asChild variant="hero" className="w-full">
              <Link to="/login">Iniciar sesión</Link>
            </Button>
          </>
        )}

        {estado === "error" && (
          <>
            <XCircle className="h-16 w-16 mx-auto text-red-500" />
            <h1 className="text-2xl font-bold mt-6 mb-2">No pudimos verificar</h1>
            <p className="text-muted-foreground mb-6">{mensaje}</p>
            <Button asChild variant="outline" className="w-full">
              <Link to="/login">Volver al login</Link>
            </Button>
          </>
        )}
      </div>
    </div>
  );
}