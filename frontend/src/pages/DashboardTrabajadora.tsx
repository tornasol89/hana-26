import { useState } from "react";
import { TextGif, HANA_GIFS } from "@/components/ui/text-gif";
import { Link } from "react-router-dom";
import {
  Award,
  BadgeCheck,
  BarChart3,
  BookOpen,
  Briefcase,
  ChevronRight,
  Clock,
  DollarSign,
  Heart,
  Lightbulb,
  MessageCircle,
  Sparkles,
  Star,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";

// ── Datos simulados (reemplazar con endpoint real) ──────────────────────────

const AREAS_DEMANDA = [
  { label: "Cuidado de adultos mayores", pct: 84, color: "#7c3aed" },
  { label: "Limpieza del hogar",          pct: 78, color: "#b45309" },
  { label: "Cuidado infantil",            pct: 71, color: "#be123c" },
  { label: "Cocina y alimentación",       pct: 63, color: "#9333ea" },
  { label: "Cuidado de mascotas",         pct: 55, color: "#7c3aed" },
  { label: "Lavado y planchado",          pct: 47, color: "#b45309" },
];

const TIPS_SERVICIO = [
  {
    icon: Star,
    title: "Responde rápido",
    body: "Trabajadoras que contestan en menos de 2 horas tienen un 60% más de reservas confirmadas.",
    color: "#b45309",
    bg: "#fffbeb",
    border: "#fde68a",
  },
  {
    icon: Heart,
    title: "Perfil con foto real",
    body: "Un perfil con foto verificada genera hasta 3× más contactos que uno sin imagen.",
    color: "#be123c",
    bg: "#fff1f2",
    border: "#fda4af",
  },
  {
    icon: MessageCircle,
    title: "Solicita reseñas",
    body: "Al finalizar cada servicio pide a tu clienta que deje una reseña. Son tu mejor carta de presentación.",
    color: "#7c3aed",
    bg: "#f5f3ff",
    border: "#c4b5fd",
  },
  {
    icon: BadgeCheck,
    title: "Mantén tu verificación activa",
    body: "Perfil verificado aparece primero en los resultados y proyecta mayor confianza a nuevas clientas.",
    color: "#9333ea",
    bg: "#faf5ff",
    border: "#d8b4fe",
  },
];

interface TarifaItem {
  concepto: string;
  desc: string;
}

const GUIA_TARIFA: TarifaItem[] = [
  {
    concepto: "1. Calcula tu costo base",
    desc: "Suma transporte, materiales que llevas y el tiempo de desplazamiento. Este es tu piso mínimo.",
  },
  {
    concepto: "2. Investiga el mercado",
    desc: "Revisa qué cobran otras profesionales en tu área y tipo de servicio. En Chile el rango típico de aseo es $8.000–$14.000/hr.",
  },
  {
    concepto: "3. Valoriza tu experiencia",
    desc: "Cada año de trayectoria o certificación justifica un incremento de entre 10%–20% sobre el precio base.",
  },
  {
    concepto: "4. Incluye tu descanso",
    desc: "Trabaja máximo 8 horas por turno. El agotamiento baja la calidad y puede afectar tu reputación.",
  },
  {
    concepto: "5. Revisa tus tarifas cada 6 meses",
    desc: "El costo de vida sube. Ajustar tus precios gradualmente es más fácil que hacer un cambio brusco.",
  },
];

const RECURSOS = [
  {
    icon: BookOpen,
    title: "Guía de Hana para trabajadoras",
    desc: "Todo lo que necesitas saber para empezar a recibir reservas.",
    color: "#7c3aed",
    bg: "#f5f3ff",
    to: "/compromiso",
  },
  {
    icon: Users,
    title: "Comunidad Hana",
    desc: "Conecta con otras trabajadoras, comparte experiencias y aprende.",
    color: "#b45309",
    bg: "#fffbeb",
    to: "/buscar",
  },
  {
    icon: Briefcase,
    title: "Completa tu perfil",
    desc: "Un perfil al 100% recibe hasta 4× más visitas. Agrega servicios, fotos y descripción.",
    color: "#be123c",
    bg: "#fff1f2",
    to: "/mi-perfil",
  },
  {
    icon: MessageCircle,
    title: "¿Tienes dudas?",
    desc: "Escríbenos directamente. Nuestro equipo te responde en menos de 24 horas.",
    color: "#9333ea",
    bg: "#faf5ff",
    to: "/contacto",
  },
];

// ── Estadísticas rápidas (simuladas) ───────────────────────────────────────

const QUICK_STATS = [
  { icon: TrendingUp, num: "+12%", label: "búsquedas este mes", color: "#7c3aed" },
  { icon: Clock,      num: "2,4h",  label: "tiempo resp. promedio", color: "#b45309" },
  { icon: Award,      num: "4.8★",  label: "valoración de tu área", color: "#be123c" },
  { icon: Zap,        num: "3.1k",  label: "búsquedas activas hoy", color: "#9333ea" },
];

// ── Componente principal ───────────────────────────────────────────────────

export default function DashboardTrabajadora() {
  const { user } = useAuth();
  const nombre = user?.nombre ?? "Profesional";

  const [tarifaAbierta, setTarifaAbierta] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* ── Hero ── */}
      <div className="relative bg-gradient-to-br from-[#1a0533] via-[#2d0f52] to-[#160c2e] overflow-hidden pt-32 pb-20 px-4">
        <div className="absolute top-0 left-1/4 w-96 h-64 rounded-full bg-primary/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-64 h-48 rounded-full bg-accent/15 blur-3xl pointer-events-none" />
        <div className="absolute top-[40%] left-[8%] w-28 h-28 rounded-full bg-white/5 blur-2xl animate-float pointer-events-none" />

        <div className="container mx-auto max-w-4xl relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 mb-6">
              <Sparkles className="h-3.5 w-3.5 text-accent" />
              <span className="text-xs font-medium text-white/80 uppercase tracking-widest">
                Panel de trabajadora
              </span>
            </div>

            <h1 className="font-display leading-none mb-4">
              <span className="block text-lg md:text-xl font-medium text-white/50 mb-1">
                Hola,
              </span>
              <TextGif
                text={nombre}
                gifUrl={HANA_GIFS.flowers}
                fallbackColor="hsl(270 50% 80%)"
                className="text-[2.8rem] md:text-[3.8rem] font-bold italic"
              />
              <span className="block text-base md:text-lg font-medium mt-2 text-white/55">
                Tu espacio para crecer como profesional independiente
              </span>
            </h1>
          </motion.div>

          {/* Quick stats */}
          <motion.div
            className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-10"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {QUICK_STATS.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.3 + i * 0.08 }}
                className="bg-white/8 backdrop-blur-sm border border-white/12 rounded-2xl px-4 py-4 text-center"
              >
                <s.icon className="h-4 w-4 mx-auto mb-1.5" style={{ color: s.color }} />
                <p className="font-display text-2xl font-bold text-white leading-none">{s.num}</p>
                <p className="text-white/45 text-xs mt-1">{s.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* ── Cuerpo ── */}
      <div className="container mx-auto px-4 max-w-4xl py-14 space-y-14">

        {/* ── Áreas más demandadas ── */}
        <Section
          icon={BarChart3}
          label="Tendencias de la plataforma"
          title="Áreas más solicitadas este mes"
          subtitle="Datos en tiempo real de búsquedas activas en Hana. Posiciónate en las categorías con mayor demanda."
          delay={0}
        >
          <div className="space-y-3.5">
            {AREAS_DEMANDA.map((a, i) => (
              <motion.div
                key={a.label}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.07 }}
              >
                <div className="flex items-center justify-between text-sm mb-1.5">
                  <span className="font-medium text-card-foreground">{a.label}</span>
                  <span className="font-bold tabular-nums" style={{ color: a.color }}>{a.pct}%</span>
                </div>
                <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: a.color }}
                    initial={{ width: 0 }}
                    whileInView={{ width: `${a.pct}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7, delay: i * 0.07 + 0.1, ease: "easeOut" }}
                  />
                </div>
              </motion.div>
            ))}
          </div>

          <p className="text-xs text-muted-foreground mt-4 italic">
            * Datos basados en búsquedas de clientas activas en la plataforma. Actualización semanal.
          </p>
        </Section>

        {/* ── Tips de servicio ── */}
        <Section
          icon={Lightbulb}
          label="Mejora tu desempeño"
          title="Consejos para un servicio excepcional"
          subtitle="Las trabajadoras con mejor valoración comparten estos hábitos. Aplícalos y nota la diferencia."
          delay={0.1}
        >
          <div className="grid sm:grid-cols-2 gap-4">
            {TIPS_SERVICIO.map((t, i) => (
              <motion.div
                key={t.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.09 }}
                className="group flex gap-4 p-5 rounded-xl border-2 transition-all duration-300 hover:-translate-y-1 hover:shadow-md cursor-default"
                style={{ backgroundColor: t.bg, borderColor: t.border }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = t.color;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = t.border;
                }}
              >
                <div
                  className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
                  style={{ backgroundColor: t.color + "20" }}
                >
                  <t.icon className="h-5 w-5" style={{ color: t.color }} />
                </div>
                <div>
                  <h3 className="font-semibold text-sm mb-1" style={{ color: t.color }}>{t.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{t.body}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </Section>

        {/* ── Guía de tarifas ── */}
        <Section
          icon={DollarSign}
          label="Finanzas personales"
          title="Cómo fijar una tarifa justa"
          subtitle="Una tarifa bien calculada te asegura trabajo sostenible y proyecta profesionalismo a tus clientas."
          delay={0.15}
        >
          <div className="space-y-2">
            {GUIA_TARIFA.map((item, i) => {
              const abierta = tarifaAbierta === i;
              return (
                <motion.div
                  key={item.concepto}
                  initial={{ opacity: 0, x: -12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.35, delay: i * 0.06 }}
                  className={`rounded-xl border-2 overflow-hidden transition-all duration-300 ${
                    abierta
                      ? "border-primary/40 bg-purple-light/30"
                      : "border-border bg-card hover:border-primary/25"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setTarifaAbierta(abierta ? null : i)}
                    className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold"
                        style={{
                          backgroundColor: abierta ? "hsl(var(--primary)/0.15)" : "#f1f5f9",
                          color: abierta ? "hsl(var(--primary))" : "#64748b",
                        }}
                      >
                        {i + 1}
                      </span>
                      <span className="font-semibold text-sm text-card-foreground">{item.concepto}</span>
                    </div>
                    <motion.div
                      animate={{ rotate: abierta ? 90 : 0 }}
                      transition={{ duration: 0.2 }}
                      className="shrink-0 text-muted-foreground"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </motion.div>
                  </button>

                  <AnimatePresence>
                    {abierta && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <p className="text-sm text-muted-foreground leading-relaxed px-5 pb-5 pt-0">
                          {item.desc}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>

          <div className="mt-5 p-4 rounded-xl bg-amber-50 border border-amber-200">
            <p className="text-xs text-amber-900 leading-relaxed">
              <strong>Ejemplo práctico:</strong> Si cobras $10.000/hr y trabajas 6 horas, son $60.000 brutos.
              Descuenta transporte ($2.500) y materiales ($3.000) → <strong>ganancia neta $54.500</strong>.
              ¿Alcanza para vivir bien? Si no, sube tu tarifa.
            </p>
          </div>
        </Section>

        {/* ── Recursos útiles ── */}
        <Section
          icon={BookOpen}
          label="Recursos para ti"
          title="Herramientas y accesos rápidos"
          subtitle="Todo lo que necesitas en un solo lugar para gestionar tu trabajo independiente."
          delay={0.2}
        >
          <div className="grid sm:grid-cols-2 gap-4">
            {RECURSOS.map((r, i) => (
              <motion.div
                key={r.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.09 }}
              >
                <Link
                  to={r.to}
                  className="group flex items-start gap-4 p-5 rounded-xl border-2 transition-all duration-300 hover:-translate-y-1 hover:shadow-md block"
                  style={{ backgroundColor: r.bg, borderColor: r.color + "30" }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = r.color;
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = r.color + "30";
                  }}
                >
                  <div
                    className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
                    style={{ backgroundColor: r.color + "20" }}
                  >
                    <r.icon className="h-5 w-5" style={{ color: r.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm mb-0.5" style={{ color: r.color }}>{r.title}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">{r.desc}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground group-hover:translate-x-1 transition-transform duration-200 mt-0.5" />
                </Link>
              </motion.div>
            ))}
          </div>
        </Section>

        {/* ── CTA ir a perfil ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="rounded-2xl bg-gradient-to-r from-primary/15 via-primary/8 to-accent/10 border border-primary/20 px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-6"
        >
          <div>
            <p className="font-display text-xl font-bold text-foreground">¿Tu perfil está completo?</p>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm">
              Asegúrate de tener foto, descripción, servicios y tarifa actualizados para recibir más reservas.
            </p>
          </div>
          <Button asChild variant="hero" size="lg" className="shrink-0 gap-2">
            <Link to="/mi-perfil">
              <Sparkles className="h-4 w-4" />
              Ir a mi perfil
            </Link>
          </Button>
        </motion.div>

      </div>

      <Footer />
    </div>
  );
}

// ── Sección reutilizable ───────────────────────────────────────────────────

interface SectionProps {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  label: string;
  title: string;
  subtitle: string;
  delay: number;
  children: React.ReactNode;
}

function Section({ icon: Icon, label, title, subtitle, delay, children }: SectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
    >
      <div className="flex items-center gap-2 mb-2">
        <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
          <Icon className="h-4 w-4 text-primary" />
        </div>
        <span className="text-xs font-bold text-primary uppercase tracking-[0.18em]">{label}</span>
      </div>
      <h2 className="font-display text-2xl font-bold text-foreground mb-1">{title}</h2>
      <p className="text-sm text-muted-foreground mb-6 max-w-xl">{subtitle}</p>
      {children}
    </motion.div>
  );
}
