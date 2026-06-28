import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Navbar from "@/components/Navbar";
import hanaLogo from "@/assets/hana-logo.png";
import { useLogin } from "@/features/auth/hooks";
import { useAuth } from "@/contexts/AuthContext";

const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Ingresa tu correo electrónico")
    .email("Correo electrónico inválido"),
  password: z.string().min(1, "Ingresa tu contraseña"),
});

type LoginForm = z.infer<typeof loginSchema>;

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);

  const login = useLogin();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();

  const from = (location.state as { from?: { pathname: string } } | null)?.from?.pathname;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.tipo === "admin") navigate("/perfil/admin", { replace: true });
      else navigate(from && from !== "/login" ? from : "/mi-perfil", { replace: true });
    }
  }, [isAuthenticated, user, navigate, from]);

  function onSubmit(data: LoginForm) {
    login.mutate(
      { email: data.email.trim().toLowerCase(), password: data.password },
      {
        onSuccess: ({ usuario }) => {
          toast.success(`Bienvenida, ${usuario.nombre}`);
        },
      }
    );
  }

  return (
    <div className="min-h-screen bg-gradient-warm relative overflow-hidden">
      <div className="absolute top-[10%] left-[6%] w-72 h-72 rounded-full bg-primary/6 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[10%] right-[6%] w-64 h-64 rounded-full bg-gold/10 blur-3xl pointer-events-none" />

      <Navbar />

      <div className="flex items-center justify-center min-h-screen pt-16 px-4">
        <div className="w-full max-w-md animate-scale-in">
          <div className="rounded-2xl shadow-soft overflow-hidden">

            <div className="bg-gradient-hero px-8 pt-10 pb-9 text-center relative overflow-hidden">
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

            <div className="bg-card px-8 pt-7 pb-8">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
                <div className="space-y-1.5">
                  <Label htmlFor="email">Correo electrónico</Label>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="tu@email.com"
                    disabled={login.isPending}
                    className={`h-11 ${errors.email ? "border-destructive focus-visible:ring-destructive/30" : ""}`}
                    {...register("email")}
                  />
                  {errors.email && (
                    <p className="text-xs text-destructive mt-1">{errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="password">Contraseña</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      placeholder="Tu contraseña"
                      disabled={login.isPending}
                      className={`h-11 pr-12 ${errors.password ? "border-destructive focus-visible:ring-destructive/30" : ""}`}
                      {...register("password")}
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
                  {errors.password && (
                    <p className="text-xs text-destructive mt-1">{errors.password.message}</p>
                  )}
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
