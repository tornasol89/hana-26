import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Mail,
  MapPin,
  Clock,
  Instagram,
  Linkedin,
  Sparkles,
  CheckCircle2,
  Send,
  MessageCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const ASUNTOS = [
  "Consulta general",
  "Problema con mi cuenta",
  "Información sobre servicios",
  "Quiero ser trabajadora",
  "Alianzas y partnerships",
  "Prensa y medios",
  "Otro",
];

const INFO_CARDS = [
  {
    icon: Mail,
    title: "Correo electrónico",
    value: "hola@hana.cl",
    sub: "Respondemos en menos de 24 horas",
    bg: "#f5f3ff",
    color: "#7c3aed",
  },
  {
    icon: Clock,
    title: "Horario de atención",
    value: "Lun – Vie · 9:00 – 18:00",
    sub: "Hora de Santiago, Chile",
    bg: "#fffbeb",
    color: "#b45309",
  },
  {
    icon: MapPin,
    title: "Ubicación",
    value: "Santiago, Chile",
    sub: "Plataforma 100% digital",
    bg: "#fff1f2",
    color: "#be123c",
  },
];

interface FormState {
  nombre: string;
  email: string;
  asunto: string;
  mensaje: string;
}

const EMPTY: FormState = { nombre: "", email: "", asunto: "", mensaje: "" };

export default function Contacto() {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [enviado, setEnviado] = useState(false);
  const [loading, setLoading] = useState(false);

  function set(field: keyof FormState, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.nombre.trim() || !form.email.trim() || !form.mensaje.trim()) {
      toast.error("Completa los campos obligatorios");
      return;
    }
    setLoading(true);
    // TODO: conectar con endpoint backend POST /api/contacto
    await new Promise((r) => setTimeout(r, 900));
    setLoading(false);
    setEnviado(true);
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* ── Hero ── */}
      <div className="relative bg-gradient-to-br from-[#1a0533] via-[#2d0f52] to-[#160c2e] overflow-hidden pt-32 pb-20 px-4">
        <div className="absolute top-0 left-1/4 w-96 h-64 rounded-full bg-primary/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-64 h-48 rounded-full bg-accent/15 blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 right-[8%] w-32 h-32 rounded-full bg-white/5 blur-2xl animate-float pointer-events-none" />

        <div className="container mx-auto max-w-3xl text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 mb-6">
              <MessageCircle className="h-3.5 w-3.5 text-accent" />
              <span className="text-xs font-medium text-white/80 uppercase tracking-widest">
                Estamos aquí para ti
              </span>
            </div>
            <h1 className="font-display leading-none mb-4">
              <span className="block text-5xl md:text-6xl font-bold italic text-white">
                Contáctenos
              </span>
              <span className="block text-2xl font-bold mt-2 bg-gradient-to-r from-violet-300 via-fuchsia-100 to-amber-200 bg-clip-text text-transparent">
                Hana
              </span>
            </h1>
            <p className="text-white/55 text-base max-w-md mx-auto mt-3">
              Tienes dudas, necesitas ayuda o simplemente quieres saludar.
              Estamos felices de escucharte.
            </p>
          </motion.div>
        </div>
      </div>

      {/* ── Cuerpo ── */}
      <div className="container mx-auto px-4 max-w-5xl py-16">

        {/* Info cards */}
        <div className="grid sm:grid-cols-3 gap-4 mb-14">
          {INFO_CARDS.map((c, i) => (
            <motion.div
              key={c.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="flex items-start gap-4 p-5 rounded-2xl border-2 transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
              style={{ backgroundColor: c.bg, borderColor: c.color + "40" }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: c.color + "20" }}
              >
                <c.icon className="h-5 w-5" style={{ color: c.color }} />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide mb-0.5" style={{ color: c.color }}>
                  {c.title}
                </p>
                <p className="text-sm font-semibold text-card-foreground">{c.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{c.sub}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Formulario */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="max-w-2xl mx-auto"
        >
          <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-soft">
            {/* Header tarjeta */}
            <div className="bg-gradient-hero px-8 py-7 relative overflow-hidden">
              <div className="absolute top-[-30%] right-[-10%] w-40 h-40 rounded-full bg-white/5 blur-2xl pointer-events-none" />
              <h2 className="font-display text-2xl font-bold text-white relative z-10">
                Envíanos un mensaje
              </h2>
              <p className="text-white/60 text-sm mt-1 relative z-10">
                Responderemos a la brevedad posible
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
                        ¡Mensaje enviado!
                      </h3>
                      <p className="text-muted-foreground text-sm mt-1">
                        Gracias por escribirnos. Te responderemos en menos de 24 horas.
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
                  <motion.form
                    key="form"
                    onSubmit={handleSubmit}
                    className="space-y-5"
                    noValidate
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
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

                    <div className="space-y-2">
                      <Label htmlFor="asunto">Asunto</Label>
                      <select
                        id="asunto"
                        value={form.asunto}
                        onChange={(e) => set("asunto", e.target.value)}
                        disabled={loading}
                        className="w-full h-11 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-0 transition-colors"
                      >
                        <option value="">Selecciona un asunto</option>
                        {ASUNTOS.map((a) => (
                          <option key={a} value={a}>{a}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="mensaje">
                        Mensaje <span className="text-destructive">*</span>
                      </Label>
                      <Textarea
                        id="mensaje"
                        placeholder="Cuéntanos en qué podemos ayudarte..."
                        value={form.mensaje}
                        onChange={(e) => set("mensaje", e.target.value)}
                        disabled={loading}
                        rows={5}
                        className="resize-none"
                      />
                    </div>

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
                          Enviar mensaje
                        </>
                      )}
                    </Button>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Redes sociales */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <p className="text-sm text-muted-foreground">También puedes encontrarnos en</p>
            <div className="flex gap-2">
              {[
                { icon: Instagram, label: "Instagram", href: "#" },
                { icon: Linkedin, label: "LinkedIn", href: "#" },
              ].map((s) => (
                <motion.a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  whileHover={{ y: -2 }}
                  className="w-9 h-9 rounded-xl border border-border bg-card hover:border-primary/40 hover:bg-purple-light flex items-center justify-center text-muted-foreground hover:text-primary transition-colors"
                >
                  <s.icon className="h-4 w-4" />
                </motion.a>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
}
