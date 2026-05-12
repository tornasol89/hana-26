import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  AlertCircle,
  ArrowLeft,
  BadgeCheck,
  CheckCircle2,
  Clock,
  FileText,
  Heart,
  Lock,
  RefreshCw,
  Shield,
  ShieldAlert,
  Sparkles,
  Star,
  Users,
  Wallet,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { SECCIONES_COMPROMISO } from "@/config/content";

// Metadatos visuales para cada sección (índice 0-9)
const SECCION_META = [
  { Icon: Users,       bg: "#ede9fe", color: "#7c3aed" },  // 1. Quiénes somos
  { Icon: Heart,       bg: "#ffe4e6", color: "#be123c" },  // 2. Respeto
  { Icon: FileText,    bg: "#fef3c7", color: "#b45309" },  // 3. Veracidad
  { Icon: Lock,        bg: "#ede9fe", color: "#7c3aed" },  // 4. Seguridad
  { Icon: BadgeCheck,  bg: "#ffe4e6", color: "#be123c" },  // 5. Verificación
  { Icon: Star,        bg: "#fef3c7", color: "#b45309" },  // 6. Evaluaciones
  { Icon: Wallet,      bg: "#ede9fe", color: "#7c3aed" },  // 7. Pagos
  { Icon: Clock,       bg: "#ffe4e6", color: "#be123c" },  // 8. Cancelaciones
  { Icon: AlertCircle, bg: "#fef3c7", color: "#b45309" },  // 9. Uso aceptable
  { Icon: RefreshCw,   bg: "#ede9fe", color: "#7c3aed" },  // 10. Modificaciones
] as const;

export default function Compromiso() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const destino = searchParams.get("destino");

  const modoAceptacion =
    destino === "registro" || destino === "clienta" || destino === "trabajadora";

  const [leido, setLeido] = useState(false);
  const [aceptado, setAceptado] = useState(false);
  const [progreso, setProgreso] = useState(0);
  const contenidoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  function handleScroll() {
    const el = contenidoRef.current;
    if (!el) return;
    const total = el.scrollHeight - el.clientHeight;
    if (total > 0) setProgreso(Math.min(100, Math.round((el.scrollTop / total) * 100)));
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 40) setLeido(true);
  }

  function handleAceptar() {
    if (!leido) {
      toast.error("Debes leer el documento completo antes de aceptar");
      contenidoRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    if (!aceptado) {
      toast.error("Marca la casilla de aceptación para continuar");
      return;
    }
    sessionStorage.setItem("aceptoCompromiso", "true");
    sessionStorage.setItem("fechaAceptacion", new Date().toISOString());
    toast.success("Compromiso aceptado");
    navigate("/registro");
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* ── Hero ───────────────────────────────────────────────────────── */}
      <div className="relative bg-gradient-to-br from-[#1a0533] via-[#2d0f52] to-[#160c2e] overflow-hidden pt-32 pb-24 px-4">
        {/* Orbes decorativos */}
        <div className="absolute top-0 left-1/4 w-96 h-64 rounded-full bg-primary/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-64 h-48 rounded-full bg-accent/15 blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 right-[10%] w-32 h-32 rounded-full bg-white/5 blur-2xl animate-float pointer-events-none" />

        <div className="container mx-auto max-w-3xl text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 mb-6">
              <Shield className="h-3.5 w-3.5 text-accent" />
              <span className="text-xs font-medium text-white/80 uppercase tracking-widest">
                Documento oficial
              </span>
            </div>

            <h1 className="font-display leading-none mb-5">
              <span className="block text-sm font-semibold uppercase tracking-[0.2em] text-white/40 mb-3">
                Plataforma Hana
              </span>
              <span className="block text-5xl md:text-7xl font-bold italic text-white leading-none">
                Compromiso
              </span>
              <span className="block text-3xl md:text-4xl font-bold mt-1 bg-gradient-to-r from-violet-300 via-fuchsia-100 to-amber-200 bg-clip-text text-transparent">
                Hana
              </span>
            </h1>

            <p className="text-white/55 text-base max-w-md mx-auto mt-4">
              {modoAceptacion
                ? "Antes de crear tu cuenta, lee y acepta este compromiso de comunidad."
                : "Los principios que sostienen nuestra comunidad de mujeres."}
            </p>
          </motion.div>

          {/* Stats decorativos */}
          <motion.div
            className="flex justify-center gap-8 mt-10"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {[
              { num: "10", label: "principios" },
              { num: "100%", label: "mujeres" },
              { num: "0", label: "tolerancia al abuso" },
            ].map(({ num, label }) => (
              <div key={label} className="text-center">
                <p className="font-display text-2xl font-bold text-white">{num}</p>
                <p className="text-white/45 text-xs mt-0.5">{label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* ── Cuerpo ─────────────────────────────────────────────────────── */}
      <div className="container mx-auto px-4 max-w-3xl py-14">

        {/* Aviso lectura obligatoria */}
        {modoAceptacion && !leido && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 px-5 py-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-900 mb-8 shadow-xs"
          >
            <ShieldAlert className="h-4 w-4 shrink-0 text-amber-600" />
            <span>Lee el documento completo desplazándote hasta el final para poder aceptar.</span>
          </motion.div>
        )}

        {/* Barra de progreso (modo aceptación) */}
        {modoAceptacion && !leido && (
          <div className="mb-6">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
              <span>Progreso de lectura</span>
              <span className="font-medium text-primary">{progreso}%</span>
            </div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-hero rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progreso}%` }}
                transition={{ ease: "easeOut", duration: 0.3 }}
              />
            </div>
          </div>
        )}

        {/* Contenido */}
        {modoAceptacion ? (
          <div
            ref={contenidoRef}
            onScroll={handleScroll}
            className={`max-h-[560px] overflow-y-auto rounded-2xl border transition-colors duration-500 ${
              leido ? "border-green-500/40 shadow-[0_0_0_1px_rgba(34,197,94,0.15)]" : "border-border"
            } bg-card/60 backdrop-blur-sm p-6 space-y-3`}
            style={{ scrollbarWidth: "thin" }}
          >
            <SeccionesCompromiso />
          </div>
        ) : (
          <div className="space-y-3">
            <SeccionesCompromiso />
          </div>
        )}

        {/* Leído banner */}
        <AnimatePresence>
          {leido && modoAceptacion && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="flex items-center gap-3 px-5 py-3.5 bg-green-500/10 border border-green-500/30 rounded-xl text-sm text-green-700 font-medium mt-6"
            >
              <CheckCircle2 className="h-5 w-5 shrink-0" />
              Documento leído completo — ahora puedes aceptar los términos.
            </motion.div>
          )}
        </AnimatePresence>

        {/* Acciones */}
        <div className="mt-8">
          {modoAceptacion ? (
            <ModoAceptacion
              leido={leido}
              aceptado={aceptado}
              onAceptadoChange={setAceptado}
              onAceptar={handleAceptar}
              onVolver={() => navigate(-1)}
            />
          ) : (
            <ModoInformativo />
          )}
        </div>

        {/* Firma */}
        <p className="text-center text-xs text-muted-foreground italic mt-12">
          Hana — Hecho por mujeres, para mujeres · Santiago, Chile · {new Date().getFullYear()}
        </p>
      </div>

      <Footer />
    </div>
  );
}

// ─── Secciones con icono y diseño ──────────────────────────────────────────────

function SeccionesCompromiso() {
  return (
    <>
      {SECCIONES_COMPROMISO.map((sec, i) => {
        const meta = SECCION_META[i] ?? SECCION_META[0];
        const { Icon, bg, color } = meta;

        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35, delay: i * 0.04 }}
            className="flex gap-4 p-5 rounded-xl border border-border bg-card hover:border-primary/25 hover:shadow-soft transition-all duration-300 group"
          >
            {/* Icono numerado */}
            <div className="shrink-0 flex flex-col items-center gap-1.5">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
                style={{ backgroundColor: bg }}
              >
                <Icon className="h-5 w-5" style={{ color }} />
              </div>
              <span
                className="text-[10px] font-bold tabular-nums"
                style={{ color }}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
            </div>

            {/* Texto */}
            <div className="flex-1 min-w-0">
              <h2 className="font-semibold text-sm text-card-foreground mb-1.5 leading-snug">
                {sec.titulo}
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {sec.contenido}
              </p>
            </div>
          </motion.div>
        );
      })}
    </>
  );
}

// ─── Modo aceptación ───────────────────────────────────────────────────────────

interface ModoAceptacionProps {
  leido: boolean;
  aceptado: boolean;
  onAceptadoChange: (v: boolean) => void;
  onAceptar: () => void;
  onVolver: () => void;
}

function ModoAceptacion({
  leido,
  aceptado,
  onAceptadoChange,
  onAceptar,
  onVolver,
}: ModoAceptacionProps) {
  return (
    <div className="space-y-5">
      {/* Checkbox */}
      <div
        className={`flex items-start gap-4 p-5 rounded-xl border-2 transition-all duration-300 ${
          !leido
            ? "border-border opacity-50"
            : aceptado
            ? "border-green-500/50 bg-green-500/5 shadow-[0_0_0_1px_rgba(34,197,94,0.1)]"
            : "border-primary/40 bg-purple-light/40"
        }`}
      >
        <Checkbox
          id="acepto"
          checked={aceptado}
          onCheckedChange={(checked) => onAceptadoChange(checked === true)}
          disabled={!leido}
          className="mt-0.5 h-5 w-5"
        />
        <Label
          htmlFor="acepto"
          className={`text-sm leading-relaxed ${
            leido ? "cursor-pointer text-card-foreground" : "cursor-not-allowed text-muted-foreground"
          }`}
        >
          He leído y comprendido el Compromiso Hana en su totalidad, y acepto sus
          términos y condiciones para participar en la plataforma.
        </Label>
      </div>

      {/* Botones */}
      <div className="flex flex-col items-center gap-3">
        <Button
          variant="hero"
          size="lg"
          className="w-full md:w-auto md:min-w-[320px] h-12 text-base gap-2"
          onClick={onAceptar}
          disabled={!leido || !aceptado}
        >
          <Sparkles className="h-4 w-4" />
          Acepto y continuar al registro
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onVolver}
          className="text-muted-foreground gap-1.5"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver
        </Button>
      </div>
    </div>
  );
}

// ─── Modo informativo ──────────────────────────────────────────────────────────

function ModoInformativo() {
  return (
    <div className="text-center space-y-4">
      <p className="text-muted-foreground text-sm">
        ¿Querés ser parte de la comunidad?
      </p>
      <div className="flex flex-wrap gap-3 justify-center">
        <Button asChild variant="hero" size="lg" className="gap-2">
          <Link to="/registro">
            <Sparkles className="h-4 w-4" />
            Crear mi cuenta
          </Link>
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link to="/">Volver al inicio</Link>
        </Button>
      </div>
    </div>
  );
}
