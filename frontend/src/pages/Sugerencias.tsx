import { useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Lightbulb,
  Megaphone,
  Send,
  Sparkles,
  Star,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import api from "@/lib/api";

type Tipo = "sugerencia" | "reclamo";

const CATEGORIAS = {
  sugerencia: [
    "Mejora de la plataforma",
    "Nueva funcionalidad",
    "Experiencia de usuario",
    "Nuevas categorías de servicio",
    "Comunicación y marketing",
    "Otra sugerencia",
  ],
  reclamo: [
    "Problema con una trabajadora",
    "Problema con una clienta",
    "Error técnico de la plataforma",
    "Proceso de verificación",
    "Privacidad y datos",
    "Otro reclamo",
  ],
};

const TIPO_CONFIG = {
  sugerencia: {
    Icon: Lightbulb,
    label: "Sugerencia",
    desc: "Comparte una idea o mejora",
    bg: "#fffbeb",
    iconBg: "#fef3c7",
    border: "#fde68a",
    activeBorder: "#b45309",
    color: "#b45309",
  },
  reclamo: {
    Icon: AlertTriangle,
    label: "Reclamo",
    desc: "Reporta un problema",
    bg: "#fff1f2",
    iconBg: "#ffe4e6",
    border: "#fda4af",
    activeBorder: "#be123c",
    color: "#be123c",
  },
};

interface FormState {
  nombre: string;
  email: string;
  categoria: string;
  mensaje: string;
  valoracion: number;
}

const EMPTY: FormState = { nombre: "", email: "", categoria: "", mensaje: "", valoracion: 0 };

export default function Sugerencias() {
  const [tipo, setTipo] = useState<Tipo>("sugerencia");
  const [form, setForm] = useState<FormState>(EMPTY);
  const [enviado, setEnviado] = useState(false);
  const [loading, setLoading] = useState(false);

  function set(field: keyof FormState, value: string | number) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function handleTipo(t: Tipo) {
    setTipo(t);
    setForm((f) => ({ ...f, categoria: "" }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.nombre.trim() || !form.email.trim() || !form.mensaje.trim()) {
      toast.error("Completa los campos obligatorios");
      return;
    }
    setLoading(true);
    try {
      await api.post("/sugerencias", {
        tipo,
        nombre: form.nombre.trim(),
        email: form.email.trim(),
        categoria: form.categoria,
        mensaje: form.mensaje.trim(),
        valoracion: tipo === "sugerencia" && form.valoracion > 0 ? form.valoracion : undefined,
      });
      setEnviado(true);
    } catch {
      toast.error("No se pudo enviar el mensaje. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  }

  const cfg = TIPO_CONFIG[tipo];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* ── Hero ── */}
      <div className="relative bg-gradient-to-br from-[#1a0533] via-[#2d0f52] to-[#160c2e] overflow-hidden pt-24 pb-16 px-4">
        <div className="absolute top-0 left-1/4 w-96 h-64 rounded-full bg-primary/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-64 h-48 rounded-full bg-accent/15 blur-3xl pointer-events-none" />
        <div className="absolute top-[40%] left-[8%] w-28 h-28 rounded-full bg-white/5 blur-2xl animate-float pointer-events-none" />

        <div className="container mx-auto max-w-3xl text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 mb-5">
              <Megaphone className="h-3.5 w-3.5 text-accent" />
              <span className="text-xs font-medium text-white/80 uppercase tracking-widest">
                Tu voz importa
              </span>
            </div>
            <h1 className="font-display leading-none mb-3">
              <span className="block text-xs font-semibold uppercase tracking-[0.2em] text-white/40 mb-2">
                Escríbenos
              </span>
              <span className="block text-[2rem] sm:text-[3.5rem] md:text-[5.5rem] lg:text-[7rem] font-black italic text-white leading-none">
                Sugerencias
              </span>
              <span className="block text-xl md:text-2xl font-bold mt-2 bg-gradient-to-r from-violet-300 via-fuchsia-100 to-amber-200 bg-clip-text text-transparent">
                y Reclamos
              </span>
            </h1>
            <p className="text-white/55 text-sm max-w-md mx-auto mt-3">
              Cada mensaje nos ayuda a mejorar.
              Tu experiencia es nuestra prioridad.
            </p>
          </motion.div>

          {/* Stats */}
          <motion.div
            className="flex justify-center gap-8 mt-8"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {[
              { num: "24h", label: "tiempo de respuesta" },
              { num: "100%", label: "confidencial" },
              { num: "0", label: "burocracia" },
            ].map(({ num, label }) => (
              <div key={label} className="text-center">
                <p className="font-display text-2xl font-bold text-white">{num}</p>
                <p className="text-white/45 text-xs mt-0.5">{label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* ── Cuerpo ── */}
      <div className="container mx-auto px-4 max-w-2xl py-16">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-soft">
            {/* Header tarjeta */}
            <div className="bg-gradient-hero px-8 py-7 relative overflow-hidden">
              <div className="absolute top-[-30%] right-[-10%] w-40 h-40 rounded-full bg-white/5 blur-2xl pointer-events-none" />
              <h2 className="font-display text-2xl font-bold text-white relative z-10">
                Déjanos tu mensaje
              </h2>
              <p className="text-white/60 text-sm mt-1 relative z-10">
                Todos los mensajes son leídos y respondidos por nuestro equipo
              </p>
            </div>

            <div className="p-8">
              <AnimatePresence mode="wait">
                {enviado ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center text-center py-8 gap-4"
                  >
                    <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center">
                      <CheckCircle2 className="h-8 w-8 text-green-500" />
                    </div>
                    <div>
                      <h3 className="font-display text-xl font-bold text-card-foreground">
                        ¡Gracias por tu mensaje!
                      </h3>
                      <p className="text-muted-foreground text-sm mt-1 max-w-xs mx-auto">
                        {tipo === "sugerencia"
                          ? "Tu sugerencia fue recibida. Nuestro equipo la revisará y considerará para mejorar Hana."
                          : "Tu reclamo fue registrado. Te contactaremos en menos de 24 horas con una respuesta."}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => { setEnviado(false); setForm(EMPTY); }}
                      className="mt-2"
                    >
                      Enviar otro mensaje
                    </Button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    {/* Selector tipo */}
                    <div className="grid grid-cols-2 gap-3 mb-7">
                      {(["sugerencia", "reclamo"] as Tipo[]).map((t) => {
                        const c = TIPO_CONFIG[t];
                        const active = tipo === t;
                        return (
                          <button
                            key={t}
                            type="button"
                            onClick={() => handleTipo(t)}
                            className="p-4 rounded-xl border-2 text-left transition-all duration-200"
                            style={{
                              backgroundColor: active ? c.bg : "transparent",
                              borderColor: active ? c.activeBorder : "#e2e8f0",
                            }}
                          >
                            <div
                              className="w-9 h-9 rounded-lg flex items-center justify-center mb-2"
                              style={{ backgroundColor: active ? c.iconBg : "#f1f5f9" }}
                            >
                              <c.Icon
                                className="h-4 w-4"
                                style={{ color: active ? c.color : "#94a3b8" }}
                              />
                            </div>
                            <p
                              className="font-semibold text-sm"
                              style={{ color: active ? c.color : "#475569" }}
                            >
                              {c.label}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">{c.desc}</p>
                          </button>
                        );
                      })}
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                      {/* Nombre + email */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="nombre">
                            Nombre <span className="text-destructive">*</span>
                          </Label>
                          <Input
                            id="nombre"
                            placeholder="Tu nombre"
                            value={form.nombre}
                            onChange={(e) => set("nombre", e.target.value)}
                            disabled={loading}
                            className="h-11"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">
                            Correo <span className="text-destructive">*</span>
                          </Label>
                          <Input
                            id="email"
                            type="email"
                            placeholder="tu@email.com"
                            value={form.email}
                            onChange={(e) => set("email", e.target.value)}
                            disabled={loading}
                            className="h-11"
                          />
                        </div>
                      </div>

                      {/* Categoría */}
                      <div className="space-y-2">
                        <Label htmlFor="categoria">Categoría</Label>
                        <select
                          id="categoria"
                          value={form.categoria}
                          onChange={(e) => set("categoria", e.target.value)}
                          disabled={loading}
                          className="w-full h-11 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-colors"
                        >
                          <option value="">Selecciona una categoría</option>
                          {CATEGORIAS[tipo].map((c) => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>

                      {/* Valoración (solo sugerencias) */}
                      {tipo === "sugerencia" && (
                        <div className="space-y-2">
                          <Label>¿Cómo calificarías tu experiencia actual?</Label>
                          <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((n) => (
                              <button
                                key={n}
                                type="button"
                                onClick={() => set("valoracion", n)}
                                className="transition-transform hover:scale-110"
                              >
                                <Star
                                  className="h-7 w-7 transition-colors"
                                  fill={form.valoracion >= n ? "#d97706" : "none"}
                                  stroke={form.valoracion >= n ? "#d97706" : "#cbd5e1"}
                                />
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Mensaje */}
                      <div className="space-y-2">
                        <Label htmlFor="mensaje">
                          {tipo === "sugerencia" ? "Tu sugerencia" : "Describe el problema"}{" "}
                          <span className="text-destructive">*</span>
                        </Label>
                        <Textarea
                          id="mensaje"
                          placeholder={
                            tipo === "sugerencia"
                              ? "Cuéntanos tu idea o sugerencia con el mayor detalle posible..."
                              : "Describe el problema que experimentaste, cuándo ocurrió y qué resultado esperabas..."
                          }
                          value={form.mensaje}
                          onChange={(e) => set("mensaje", e.target.value)}
                          disabled={loading}
                          rows={5}
                          className="resize-none"
                        />
                      </div>

                      {/* Nota confidencialidad */}
                      <p className="text-xs text-muted-foreground">
                        Tu mensaje es estrictamente confidencial y solo será leído por el equipo Hana.
                      </p>

                      <Button
                        variant="hero"
                        type="submit"
                        disabled={loading}
                        className="w-full h-11 gap-2 font-semibold"
                      >
                        {loading ? (
                          <>
                            <Sparkles className="h-4 w-4 animate-pulse" />
                            Enviando...
                          </>
                        ) : (
                          <>
                            <Send className="h-4 w-4" />
                            Enviar {tipo === "sugerencia" ? "sugerencia" : "reclamo"}
                          </>
                        )}
                      </Button>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
}
