import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Navbar from "@/components/Navbar";
import hanaLogo from "@/assets/hana-logo.png";
import { useLogin } from "@/features/auth/hooks";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const login = useLogin();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as { from?: { pathname: string } } | null)?.from?.pathname;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!email.trim() || !password) {
      toast.error("Completa todos los campos");
      return;
    }

    login.mutate(
      { email: email.trim().toLowerCase(), password },
      {
        onSuccess: ({ usuario }) => {
          toast.success(`Bienvenida, ${usuario.nombre}`);
          if (usuario.tipo === "admin") navigate("/perfil/admin", { replace: true });
          else if (from && from !== "/login") navigate(from, { replace: true });
          else navigate("/mi-perfil", { replace: true });
        },
      }
    );
  }

  return (
    <div className="min-h-screen bg-gradient-warm relative overflow-hidden">
      {/* Blobs de fondo sutiles */}
      <div className="absolute top-[10%] left-[6%] w-72 h-72 rounded-full bg-primary/6 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[10%] right-[6%] w-64 h-64 rounded-full bg-gold/10 blur-3xl pointer-events-none" />

      <Navbar />

      <div className="flex items-center justify-center min-h-screen pt-16 px-4">
        <div className="w-full max-w-md animate-scale-in">
          <div className="rounded-2xl shadow-soft overflow-hidden">

            {/* Cabecera con gradiente */}
            <div className="bg-gradient-hero px-8 pt-10 pb-9 text-center relative overflow-hidden">
              {/* Orbe decorativo dentro del header */}
              <div className="absolute top-[-30%] right-[-15%] w-48 h-48 rounded-full bg-white/5 blur-2xl pointer-events-none" />
              <div className="absolute bottom-[-20%] left-[-10%] w-36 h-36 rounded-full bg-gold/15 blur-2xl pointer-events-none" />

              <img
                src={hanaLogo}
                alt="Hana"
                className="h-14 mx-auto mb-5 brightness-0 invert opacity-90 relative z-10"
              />

              <h1 className="font-display text-3xl font-bold text-white leading-tight animate-fade-up relative z-10">
                Bienvenida{" "}
                <em className="not-italic text-shimmer">de vuelta</em>
              </h1>
              <p className="text-white/60 text-sm mt-2 relative z-10">
                Tu espacio Hana te espera
              </p>
            </div>

            {/* Cuerpo del formulario */}
            <div className="bg-card px-8 pt-7 pb-8">
              <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                <div className="space-y-2">
                  <Label htmlFor="email">Correo electrónico</Label>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="tu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={login.isPending}
                    required
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Contraseña</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      placeholder="Tu contraseña"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={login.isPending}
                      required
                      className="h-11 pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      tabIndex={-1}
                      aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <Button
                  variant="hero"
                  className="w-full h-11 font-semibold gap-2"
                  type="submit"
                  disabled={login.isPending}
                >
                  {login.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Ingresando...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Iniciar Sesión
                    </>
                  )}
                </Button>
              </form>

              <p className="text-center text-sm text-muted-foreground mt-6">
                ¿No tienes cuenta?{" "}
                <Link
                  to="/registro"
                  className="text-primary font-semibold hover:underline transition-colors"
                >
                  Regístrate aquí
                </Link>
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
