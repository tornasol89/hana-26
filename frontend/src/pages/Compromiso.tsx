import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2, ChevronDown, FileText, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { SECCIONES_COMPROMISO } from "@/config/content";

export default function Compromiso() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const destino = searchParams.get("destino");

  // Modo "aceptación" solo si viene desde el flujo de registro.
  // Si entra directo a /compromiso, es modo "informativo": solo el documento.
  const modoAceptacion =
    destino === "registro" || destino === "clienta" || destino === "trabajadora";

  const [leido, setLeido] = useState(false);
  const [aceptado, setAceptado] = useState(false);
  const contenidoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  function handleScroll() {
    const el = contenidoRef.current;
    if (!el) return;
    const margen = 40;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - margen) {
      setLeido(true);
    }
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
    <div className="min-h-screen bg-gradient-warm">
      <Navbar />

      <div className="pt-20 pb-12 container mx-auto px-4 max-w-3xl">
        {/* ─── Encabezado ─── */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-semibold uppercase tracking-wider mb-4">
            <FileText className="h-3.5 w-3.5" />
            Documento oficial
          </div>
          <h1 className="text-4xl md:text-5xl font-bold font-display text-card-foreground mb-3">
            Compromiso Hana
          </h1>

          {modoAceptacion ? (
            <p className="text-muted-foreground max-w-lg mx-auto">
              Antes de crear tu cuenta, lee y acepta este compromiso.
            </p>
          ) : (
            <p className="text-muted-foreground max-w-lg mx-auto">
              Estos son los términos y compromisos que sostienen nuestra comunidad.
            </p>
          )}
        </div>

        {/* ─── Aviso de lectura obligatoria (solo en modo aceptación) ─── */}
        {modoAceptacion && (
          <div className="flex items-center gap-2 px-4 py-2.5 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-900 mb-6">
            <ShieldAlert className="h-4 w-4 shrink-0" />
            <span>Debes leer el documento completo para poder aceptar</span>
          </div>
        )}

        {/* ─── Contenido del documento ─── */}
        {modoAceptacion ? (
          // Modo aceptación: scroll lock + detección de lectura
          <Card className={`mb-6 transition-colors ${leido ? "border-green-500/50" : ""}`}>
            <CardContent
              ref={contenidoRef}
              onScroll={handleScroll}
              className="max-h-[480px] overflow-y-auto p-6"
            >
              <ContenidoCompromiso />
            </CardContent>
          </Card>
        ) : (
          // Modo informativo: el documento fluye naturalmente
          <Card className="mb-8">
            <CardContent className="p-6 md:p-8">
              <ContenidoCompromiso />
            </CardContent>
          </Card>
        )}

        {/* ─── Acciones según modo ─── */}
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

      <Footer />
    </div>
  );
}

// ─── Documento ─────────────────────────────────────────────────

function ContenidoCompromiso() {
  return (
    <div className="space-y-6">
      {SECCIONES_COMPROMISO.map((sec, i) => (
        <section key={i}>
          <h2 className="text-base font-semibold text-primary mb-2">{sec.titulo}</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {sec.contenido}
          </p>
        </section>
      ))}

      <div className="pt-4 border-t border-border text-center">
        <p className="text-xs text-muted-foreground italic">
          Hana — Hecho por mujeres, para mujeres · Santiago, Chile ·{" "}
          {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}

// ─── Modo aceptación (viene desde /registro) ────────────────────

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
    <>
      {/* Indicador de lectura */}
      {leido ? (
        <div className="flex items-center gap-2 text-green-700 font-medium text-sm mb-5">
          <CheckCircle2 className="h-4 w-4" />
          Documento leído completo
        </div>
      ) : (
        <div className="flex items-center gap-2 text-muted-foreground text-sm mb-5">
          <ChevronDown className="h-4 w-4" />
          Desplázate hasta el final del documento para continuar
        </div>
      )}

      {/* Checkbox */}
      <div
        className={`flex items-start gap-3 p-4 rounded-xl border transition-all mb-6 ${
          !leido
            ? "border-border opacity-60"
            : aceptado
            ? "border-green-500/40 bg-green-500/5"
            : "border-primary/30 bg-card"
        }`}
      >
        <Checkbox
          id="acepto"
          checked={aceptado}
          onCheckedChange={(checked) => onAceptadoChange(checked === true)}
          disabled={!leido}
          className="mt-0.5"
        />
        <Label
          htmlFor="acepto"
          className={`text-sm leading-relaxed ${
            leido ? "cursor-pointer" : "cursor-not-allowed"
          }`}
        >
          He leído y comprendido el Compromiso Hana en su totalidad, y acepto sus
          términos y condiciones para participar en la plataforma.
        </Label>
      </div>

      {/* Acciones */}
      <div className="flex flex-col items-center gap-3">
        <Button
          variant="hero"
          size="lg"
          className="w-full md:w-auto md:min-w-[320px]"
          onClick={onAceptar}
          disabled={!leido || !aceptado}
        >
          Acepto y continuar al registro
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onVolver}
          className="text-muted-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver
        </Button>
      </div>
    </>
  );
}

// ─── Modo informativo (entró directo a /compromiso) ─────────────

function ModoInformativo() {
  return (
    <div className="text-center space-y-3">
      <p className="text-sm text-muted-foreground">
        ¿Querés ser parte de la comunidad?
      </p>
      <div className="flex flex-wrap gap-3 justify-center">
        <Button asChild variant="hero" size="lg">
          <Link to="/registro">Crear mi cuenta</Link>
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link to="/">Volver al inicio</Link>
        </Button>
      </div>
    </div>
  );
}