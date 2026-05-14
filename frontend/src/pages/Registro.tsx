import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  CheckCircle2,
  Eye,
  EyeOff,
  FileText,
  Loader2,
  Search,
  Sparkles,
} from "lucide-react";
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
import { useRegister } from "@/features/auth/hooks";
import { REGIONES_CHILE, COMUNAS_POR_REGION } from "@/config/constants";
import type { UserType } from "@/features/auth/types";
import {
  capitalizarNombre,
  validarRut,
  formatearRutVisual,
  validarFechaNacimiento,
  EDAD_MINIMA,
} from "@/lib/validators";

const DRAFT_KEY = "registro_draft";

interface RegistroDraft {
  tipo: UserType;
  nombre: string;
  apellido: string;
  email: string;
  rut: string;
  fechaNacimiento: string;
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
  fechaNacimiento: "",
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

/**
 * Fecha máxima permitida: exactamente EDAD_MINIMA años atrás desde hoy.
 */
function getFechaMaxima(): string {
  const hoy = new Date();
  const max = new Date(
    hoy.getFullYear() - EDAD_MINIMA,
    hoy.getMonth(),
    hoy.getDate(),
  );
  return max.toISOString().split("T")[0];
}

/**
 * Fecha mínima razonable: hace 120 años.
 */
function getFechaMinima(): string {
  const hoy = new Date();
  const min = new Date(hoy.getFullYear() - 120, hoy.getMonth(), hoy.getDate());
  return min.toISOString().split("T")[0];
}

const TIPOS: {
  value: UserType;
  label: string;
  desc: string;
  Icon: React.ElementType;
}[] = [
  { value: "clienta", label: "Soy Clienta", desc: "Busco servicios", Icon: Search },
  {
    value: "trabajadora",
    label: "Soy Trabajadora",
    desc: "Ofrezco servicios",
    Icon: Sparkles,
  },
];

const Registro = () => {
  const [draft] = useState<RegistroDraft>(leerDraft);

  const [tipo, setTipo] = useState<UserType>(draft.tipo);
  const [nombre, setNombre] = useState(draft.nombre);
  const [apellido, setApellido] = useState(draft.apellido);
  const [email, setEmail] = useState(draft.email);
  const [password, setPassword] = useState("");
  const [confirmarPassword, setConfirmarPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmar, setShowConfirmar] = useState(false);
  const [rut, setRut] = useState(draft.rut);
  const [fechaNacimiento, setFechaNacimiento] = useState(draft.fechaNacimiento);
  const [region, setRegion] = useState(draft.region);
  const [comuna, setComuna] = useState(draft.comuna);
  const [aceptoCompromiso, setAceptoCompromiso] = useState(false);

  const register = useRegister();
  const navigate = useNavigate();

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
      fechaNacimiento,
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

  // Capitalizar nombre/apellido al perder foco
  function handleNombreBlur() {
    if (nombre) setNombre(capitalizarNombre(nombre));
  }
  function handleApellidoBlur() {
    if (apellido) setApellido(capitalizarNombre(apellido));
  }

  // Formatear RUT visualmente al perder foco
  function handleRutBlur() {
    if (rut) {
      const formateado = formatearRutVisual(rut);
      if (formateado) setRut(formateado);
    }
  }

  function handleSubmit(e: React.FormEvent) {
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

    // Validación de fecha de nacimiento + edad mínima
    const resFecha = validarFechaNacimiento(fechaNacimiento);
    if (!resFecha.valida) {
      toast.error(resFecha.mensaje ?? "Fecha de nacimiento inválida");
      return;
    }

    // Validación de RUT si fue ingresado (opcional)
    if (rut.trim() && !validarRut(rut)) {
      toast.error(
        "RUT inválido. Verifica el número y el dígito verificador.",
      );
      return;
    }

    if (!aceptoCompromiso) {
      toast.error("Debes leer y aceptar el Compromiso Hana");
      return;
    }

    register.mutate(
      {
        nombre: capitalizarNombre(nombre.trim()),
        apellido: capitalizarNombre(apellido.trim()),
        email: email.trim().toLowerCase(),
        password,
        tipo,
        rut: rut.trim(),
        fechaNacimiento,
        region,
        comuna: comuna.trim(),
        aceptoCompromiso: true,
      },
      {
        onSuccess: ({ usuario }) => {
          limpiarTodo();
          toast.success(`¡Bienvenida a Hana, ${usuario.nombre}!`);
          if (usuario.tipo === "admin")
            navigate("/perfil/admin", { replace: true });
          else navigate("/mi-perfil", { replace: true });
        },
      },
    );
  }

  const passwordsCoinciden =
    password === confirmarPassword && password.length >= 6;
  const passwordsNoCoinciden =
    confirmarPassword.length > 0 && password !== confirmarPassword;

  // Validación de RUT en vivo (solo si tiene contenido)
  const rutValido = rut.trim() ? validarRut(rut) : null;

  const isSubmitting = register.isPending;

  return (
    <div className="min-h-screen bg-gradient-warm relative overflow-hidden">
      {/* Blobs decorativos de fondo */}
      <div className="absolute top-[6%] right-[4%] w-72 h-72 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[8%] left-[4%] w-64 h-64 rounded-full bg-gold/10 blur-3xl pointer-events-none" />

      <Navbar />

      <div className="flex items-center justify-center min-h-screen pt-20 pb-8 px-4">
        <div className="w-full max-w-md animate-scale-in">
          <div className="rounded-2xl shadow-soft overflow-hidden">
            {/* Cabecera con gradiente */}
            <div className="bg-gradient-hero px-8 pt-10 pb-9 text-center relative overflow-hidden">
              <div className="absolute top-[-30%] right-[-15%] w-48 h-48 rounded-full bg-white/5 blur-2xl pointer-events-none" />
              <div className="absolute bottom-[-20%] left-[-10%] w-36 h-36 rounded-full bg-gold/15 blur-2xl pointer-events-none" />

              <img
                src={hanaLogo}
                alt="Hana"
                className="h-14 mx-auto mb-5 brightness-0 invert opacity-90 relative z-10"
              />
              <h1 className="font-display text-3xl font-bold text-white leading-tight animate-fade-up relative z-10">
                Únete a <em className="not-italic text-shimmer">Hana</em>
              </h1>
              <p className="text-white/60 text-sm mt-2 relative z-10">
                Forma parte de nuestra comunidad
              </p>
            </div>

            <div className="bg-card px-8 pt-6 pb-8">
              {/* Selector de tipo */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                {TIPOS.map(({ value, label, desc, Icon }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setTipo(value)}
                    disabled={isSubmitting}
                    className={`p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                      tipo === value
                        ? "border-primary bg-purple-light shadow-soft"
                        : "border-border hover:border-primary/40 hover:bg-purple-light/40"
                    }`}
                  >
                    <Icon
                      className={`h-4 w-4 mb-2 ${
                        tipo === value
                          ? "text-primary"
                          : "text-muted-foreground"
                      }`}
                    />
                    <p className="font-semibold text-sm text-card-foreground">
                      {label}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {desc}
                    </p>
                  </button>
                ))}
              </div>

              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                {/* Nombre + Apellido */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="nombre">Nombre</Label>
                    <Input
                      id="nombre"
                      placeholder="Tu nombre"
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      onBlur={handleNombreBlur}
                      disabled={isSubmitting}
                      required
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="apellido">Apellido</Label>
                    <Input
                      id="apellido"
                      placeholder="Tu apellido"
                      value={apellido}
                      onChange={(e) => setApellido(e.target.value)}
                      onBlur={handleApellidoBlur}
                      disabled={isSubmitting}
                      required
                      className="h-11"
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
                    className="h-11"
                  />
                </div>

                {/* RUT */}
                <div className="space-y-2">
                  <Label htmlFor="rut">
                    RUT{" "}
                    <span className="text-muted-foreground text-xs">
                      (opcional)
                    </span>
                  </Label>
                  <Input
                    id="rut"
                    placeholder="12.345.678-9"
                    value={rut}
                    onChange={(e) => setRut(e.target.value)}
                    onBlur={handleRutBlur}
                    disabled={isSubmitting}
                    aria-invalid={rutValido === false}
                    className={`h-11 ${
                      rutValido === false
                        ? "border-destructive focus-visible:ring-destructive"
                        : rutValido === true
                          ? "border-green-500 focus-visible:ring-green-500"
                          : ""
                    }`}
                  />
                  {rutValido === false && (
                    <p className="text-xs text-destructive">
                      RUT inválido. Verifica el número y el dígito verificador.
                    </p>
                  )}
                  {rutValido === true && (
                    <p className="text-xs text-success">RUT válido ✓</p>
                  )}
                </div>

                {/* Fecha de nacimiento */}
                <div className="space-y-2">
                  <Label htmlFor="fechaNacimiento">Fecha de nacimiento</Label>
                  <Input
                    id="fechaNacimiento"
                    type="date"
                    value={fechaNacimiento}
                    onChange={(e) => setFechaNacimiento(e.target.value)}
                    disabled={isSubmitting}
                    min={getFechaMinima()}
                    max={getFechaMaxima()}
                    required
                    className="h-11"
                  />
                  <p className="text-xs text-muted-foreground">
                    Debes tener al menos {EDAD_MINIMA} años para registrarte.
                  </p>
                </div>

                {/* Región */}
                <div className="space-y-2">
                  <Label htmlFor="region">Región</Label>
                  <Select
                    value={region}
                    onValueChange={(v) => {
                      setRegion(v);
                      setComuna("");
                    }}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger id="region" className="h-11">
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
                  <Label htmlFor="comuna">
                    Comuna
                    {!region && (
                      <span className="text-xs text-muted-foreground ml-1">
                        (selecciona primero tu región)
                      </span>
                    )}
                  </Label>
                  <Select
                    value={comuna}
                    onValueChange={setComuna}
                    disabled={isSubmitting || !region}
                  >
                    <SelectTrigger id="comuna" className="h-11">
                      <SelectValue
                        placeholder={
                          region
                            ? "Selecciona tu comuna"
                            : "Primero selecciona una región"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {(COMUNAS_POR_REGION[region] ?? []).map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Contraseña */}
                <div className="space-y-2">
                  <Label htmlFor="password">Contraseña</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      placeholder="Mínimo 6 caracteres"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isSubmitting}
                      minLength={6}
                      required
                      className="h-11 pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      tabIndex={-1}
                      aria-label={
                        showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Confirmar contraseña */}
                <div className="space-y-2">
                  <Label htmlFor="confirmar-password">Confirmar contraseña</Label>
                  <div className="relative">
                    <Input
                      id="confirmar-password"
                      type={showConfirmar ? "text" : "password"}
                      autoComplete="new-password"
                      placeholder="Vuelve a escribir tu contraseña"
                      value={confirmarPassword}
                      onChange={(e) => setConfirmarPassword(e.target.value)}
                      disabled={isSubmitting}
                      minLength={6}
                      required
                      className="h-11 pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmar(!showConfirmar)}
                      tabIndex={-1}
                      aria-label={
                        showConfirmar ? "Ocultar contraseña" : "Mostrar contraseña"
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showConfirmar ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {passwordsNoCoinciden && (
                    <p className="text-xs text-destructive">
                      Las contraseñas no coinciden
                    </p>
                  )}
                  {passwordsCoinciden && (
                    <p className="text-xs text-success">
                      Las contraseñas coinciden
                    </p>
                  )}
                </div>

                {/* Compromiso */}
                <div className="pt-1">
                  {aceptoCompromiso ? (
                    <div className="flex items-start gap-3 p-4 rounded-xl border border-green-500/40 bg-green-500/5">
                      <CheckCircle2 className="h-5 w-5 text-success shrink-0 mt-0.5" />
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
                            Para crear tu cuenta necesitas leer y aceptar nuestro
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
                  className="w-full h-11 font-semibold gap-2"
                  type="submit"
                  disabled={isSubmitting || !aceptoCompromiso}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Creando cuenta...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      {`Unirme como ${tipo === "clienta" ? "Clienta" : "Trabajadora"}`}
                    </>
                  )}
                </Button>
              </form>

              <p className="text-center text-sm text-muted-foreground mt-6">
                ¿Ya tienes cuenta?{" "}
                <Link
                  to="/login"
                  className="text-primary font-semibold hover:underline transition-colors"
                >
                  Inicia sesión
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Registro;