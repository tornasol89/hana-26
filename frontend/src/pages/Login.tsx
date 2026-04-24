import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Navbar from "@/components/Navbar";
import hanaLogo from "@/assets/hana-logo.png";
import { useAuth } from "@/contexts/AuthContext";
import { getErrorMessage } from "@/features/auth/utils";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Si vino redirigido desde una ruta protegida, volvemos a esa ruta.
  // Si entró directo al /login, lo mandamos a /mi-perfil después del éxito.
  const from = (location.state as { from?: { pathname: string } } | null)?.from?.pathname;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !password) {
      toast.error("Completa todos los campos");
      return;
    }

    setIsSubmitting(true);
    try {
      const usuario = await login({
        email: email.trim().toLowerCase(),
        password,
      });
      toast.success(`Bienvenida, ${usuario.nombre}`);

      // Redirección según rol y origen
      if (usuario.tipo === "admin") {
        navigate("/admin", { replace: true });
      } else if (from && from !== "/login") {
        // Venía redirigido desde una ruta protegida, lo devolvemos ahí
        navigate(from, { replace: true });
      } else {
        // Entró directo al /login → lo mandamos a su cuenta
        navigate("/mi-perfil", { replace: true });
      }
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-warm">
      <Navbar />
      <div className="flex items-center justify-center min-h-screen pt-16 px-4">
        <div className="w-full max-w-md bg-card rounded-2xl shadow-soft p-8 animate-scale-in">
          <div className="text-center mb-8">
            <img src={hanaLogo} alt="Hana" className="h-12 mx-auto mb-4" />
            <h1 className="text-2xl font-bold font-display text-card-foreground">
              Bienvenida de vuelta
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Ingresa a tu cuenta</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isSubmitting}
                required
              />
            </div>

            <Button
              variant="hero"
              className="w-full"
              size="lg"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Ingresando...
                </>
              ) : (
                "Iniciar Sesión"
              )}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            ¿No tienes cuenta?{" "}
            <Link to="/registro" className="text-primary font-medium hover:underline">
              Regístrate aquí
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;