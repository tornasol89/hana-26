import { Link, useSearchParams } from "react-router-dom";
import { Mail, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function RegistroEmailEnviado() {
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email") ?? "tu email";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f5f3ff] via-white to-[#fff1f2] px-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 text-center">
        <div className="relative inline-block mb-2">
          <Mail className="h-16 w-16 text-primary" />
          <CheckCircle2 className="h-7 w-7 text-green-500 absolute -bottom-1 -right-1 bg-white rounded-full" />
        </div>
        <h1 className="text-2xl font-bold mt-4 mb-2">Revisá tu inbox</h1>
        <p className="text-muted-foreground mb-2">
          Te mandamos un link de verificación a:
        </p>
        <p className="font-medium text-foreground mb-6 break-all">{email}</p>
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-6 text-left">
          <p className="text-sm text-amber-900">
            <strong>Importante:</strong> hasta que no confirmes tu email, no vas a poder
            entrar a tu cuenta. Si no lo encontrás, revisá la carpeta de spam.
          </p>
        </div>
        <Button asChild variant="outline" className="w-full">
          <Link to="/login">Volver al login</Link>
        </Button>
      </div>
    </div>
  );
}