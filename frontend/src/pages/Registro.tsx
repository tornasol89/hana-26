import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CheckCircle2, FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Navbar from "@/components/Navbar";
import hanaLogo from "@/assets/hana-logo.png";
import { useAuth } from "@/contexts/AuthContext";
import { getErrorMessage } from "@/features/auth/utils";
import { REGIONES_CHILE } from "@/config/constants";
import type { UserType } from "@/features/auth/types";

const DRAFT_KEY = "registro_draft";

interface RegistroDraft {
  tipo: UserType;
  nombre: string;
  apellido: string;
  email: string;
  rut: string;
  region: string;
  comuna: string;
  // ⚠️ no guardamos password ni confirmarPassword — por seguridad la persona los vuelve a tipear
}

const DRAFT_INICIAL: RegistroDraft = {
  tipo: "clienta",
  nombre: "",
  apellido: "",
  email: "",
  rut: "",
  region: "",
  comuna: "",
};

function leerDraft(): RegistroDraft {
  try {
    const raw = sessionStorage.getItem(DRAFT_KEY);
    if (!raw) return DRAFT_INICIAL;
    const parsed = JSON.parse(raw) as Partial<RegistroDraft>;
    return { ...DRAFT_INICIAL, ...parsed };
  } catch {
    return DRAFT_INICIAL;
  }
}

const Registro = () => {
  const [draft] = useState<RegistroDraft>(leerDraft);

  const [tipo, setTipo] = useState<UserType>(draft.tipo);
  const [nombre, setNombre] = useState(draft.nombre);
  const [apellido, setApellido] = useState(draft.apellido);
  const [email, setEmail] = useState(draft.email);
  const [password, setPassword] = useState("");
  const [confirmarPassword, setConfirmarPassword] = useState("");
  const [rut, setRut] = useState(draft.rut);
  const [region, setRegion] = useState(draft.region);
  const [comuna, setComuna] = useState(draft.comuna);
  const [aceptoCompromiso, setAceptoCompromiso] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  // Al montar, chequeamos si la persona pasó por /compromiso y aceptó (sessionStorage)
  useEffect(() => {
    const aceptado = sessionStorage.getItem("aceptoCompromiso") === "true";
    setAceptoCompromiso(aceptado);
  }, []);

  function guardarDraft() {
    const data: RegistroDraft = {
      tipo,
      nombre,
      apellido,
      email,
      rut,
      region,
      comuna,
    };
    sessionStorage.setItem(DRAFT_KEY, JSON.stringify(data));
  }

  function handleIrACompromiso() {
    guardarDraft();
    navigate("/compromiso?destino=registro");
  }

  function limpiarTodo() {
    sessionStorage.removeItem(DRAFT_KEY);
    sessionStorage.removeItem("aceptoCompromiso");
    sessionStorage.removeItem("fechaAceptacion");
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nombre.trim() || !apellido.trim()) {
      toast.error("Completa tu nombre y apellido");
      return;
    }
    if (password.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres");
      return;
    }
    if (password !== confirmarPassword) {
      toast.error("Las contraseñas no coinciden");
      return;
    }
    if (!region || !comuna.trim()) {
      toast.error("Selecciona tu región y comuna");
      return;
    }
    if (!aceptoCompromiso) {
      toast.error("Debes leer y aceptar el Compromiso Hana");
      return;
    }

    setIsSubmitting(true);
    try {
      const usuario = await register({
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        email: email.trim().toLowerCase(),
        password,
        tipo,
        rut: rut.trim(),
        region,
        comuna: comuna.trim(),
        aceptoCompromiso: true,
      });

      limpiarTodo();

      toast.success(`¡Bienvenida a Hana, ${usuario.nombre}!`);

      if (usuario.tipo === "admin") {
        navigate("/admin", { replace: true });
      } else {
        navigate("/mi-perfil", { replace: true });
      }
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helpers de UI para feedback en vivo
  const passwordsCoinciden = password === confirmarPassword && password.length >= 6;
  const passwordsNoCoinciden =
    confirmarPassword.length > 0 && password !== confirmarPassword;

  return (
    <div className="min-h-screen bg-gradient-warm">
      <Navbar />
      <div className="flex items-center justify-center min-h-screen pt-20 pb-8 px-4">
        <div className="w-full max-w-md bg-card rounded-2xl shadow-soft p-8 animate-scale-in">
          <div className="text-center mb-8">
            <img src={hanaLogo} alt="Hana" className="h-12 mx-auto mb-4" />
            <h1 className="text-2xl font-bold font-display text-card-foreground">
              Crea tu cuenta
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Únete a la comunidad Hana
            </p>
          </div>

          {/* Tipo de cuenta */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button
              type="button"
              onClick={() => setTipo("clienta")}
              disabled={isSubmitting}
              className={`p-4 rounded-xl border-2 text-center transition-all ${
                tipo === "clienta"
                  ? "border-primary bg-purple-light"
                  : "border-border hover:border-primary/30"
              }`}
            >
              <p className="font-semibold text-sm text-card-foreground">Soy Clienta</p>
              <p className="text-xs text-muted-foreground mt-1">Busco servicios</p>
            </button>
            <button
              type="button"
              onClick={() => setTipo("trabajadora")}
              disabled={isSubmitting}
              className={`p-4 rounded-xl border-2 text-center transition-all ${
                tipo === "trabajadora"
                  ? "border-primary bg-purple-light"
                  : "border-border hover:border-primary/30"
              }`}
            >
              <p className="font-semibold text-sm text-card-foreground">
                Soy Trabajadora
              </p>
              <p className="text-xs text-muted-foreground mt-1">Ofrezco servicios</p>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Nombre + Apellido (grid de 2 columnas, único bloque que comparte fila) */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre</Label>
                <Input
                  id="nombre"
                  placeholder="Tu nombre"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  disabled={isSubmitting}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="apellido">Apellido</Label>
                <Input
                  id="apellido"
                  placeholder="Tu apellido"
                  value={apellido}
                  onChange={(e) => setApellido(e.target.value)}
                  disabled={isSubmitting}
                  required
                />
              </div>
            </div>

            {/* Email */}
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

            {/* RUT */}
            <div className="space-y-2">
              <Label htmlFor="rut">RUT</Label>
              <Input
                id="rut"
                placeholder="12.345.678-9"
                value={rut}
                onChange={(e) => setRut(e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            {/* Región */}
            <div className="space-y-2">
              <Label htmlFor="region">Región</Label>
              <Select value={region} onValueChange={setRegion} disabled={isSubmitting}>
                <SelectTrigger id="region">
                  <SelectValue placeholder="Selecciona tu región" />
                </SelectTrigger>
                <SelectContent>
                  {REGIONES_CHILE.map((r) => (
                    <SelectItem key={r} value={r}>
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Comuna */}
            <div className="space-y-2">
              <Label htmlFor="comuna">Comuna</Label>
              <Input
                id="comuna"
                placeholder="Tu comuna"
                value={comuna}
                onChange={(e) => setComuna(e.target.value)}
                disabled={isSubmitting}
                required
              />
            </div>

            {/* Contraseña */}
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isSubmitting}
                minLength={6}
                required
              />
            </div>

            {/* Confirmar contraseña */}
            <div className="space-y-2">
              <Label htmlFor="confirmar-password">Confirmar contraseña</Label>
              <Input
                id="confirmar-password"
                type="password"
                autoComplete="new-password"
                placeholder="Vuelve a escribir tu contraseña"
                value={confirmarPassword}
                onChange={(e) => setConfirmarPassword(e.target.value)}
                disabled={isSubmitting}
                minLength={6}
                required
              />
              {passwordsNoCoinciden && (
                <p className="text-xs text-destructive">
                  Las contraseñas no coinciden
                </p>
              )}
              {passwordsCoinciden && (
                <p className="text-xs text-green-600">Las contraseñas coinciden</p>
              )}
            </div>

            {/* Compromiso — bloque de aceptación */}
            <div className="pt-2">
              {aceptoCompromiso ? (
                <div className="flex items-start gap-3 p-4 rounded-xl border border-green-500/40 bg-green-500/5">
                  <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-card-foreground">
                      Compromiso Hana aceptado
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Ya leíste y aceptaste los términos.{" "}
                      <button
                        type="button"
                        onClick={handleIrACompromiso}
                        className="text-primary hover:underline"
                      >
                        Volver a leer
                      </button>
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-3 p-4 rounded-xl border border-amber-500/40 bg-amber-500/5">
                  <div className="flex items-start gap-3">
                    <FileText className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-card-foreground">
                        Lee el Compromiso Hana
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Para crear tu cuenta necesitás leer y aceptar nuestro
                        compromiso de comunidad.
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleIrACompromiso}
                    className="self-start"
                  >
                    Leer y aceptar el Compromiso
                  </Button>
                </div>
              )}
            </div>

            {/* Botón submit */}
            <Button
              variant="hero"
              className="w-full"
              size="lg"
              type="submit"
              disabled={isSubmitting || !aceptoCompromiso}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creando cuenta...
                </>
              ) : (
                `Crear Cuenta como ${tipo === "clienta" ? "Clienta" : "Trabajadora"}`
              )}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            ¿Ya tienes cuenta?{" "}
            <Link to="/login" className="text-primary font-medium hover:underline">
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Registro;