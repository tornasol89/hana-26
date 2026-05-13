import { useRef } from "react";
import { Link } from "react-router-dom";
import { Heart, Shield, TrendingUp, Users } from "lucide-react";
import { motion, useInView } from "motion/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  ESTADISTICAS_PRINCIPALES,
  ESTADISTICAS_FINALES,
  HOGARES_UNIPERSONALES,
  JEFATURA_FEMENINA,
  SEGURIDAD_MUJERES,
  type EstadisticaImpacto,
} from "@/config/content";

// ── Paleta de tonos ────────────────────────────────────────────────────────────
const TONO: Record<EstadisticaImpacto["tono"], { text: string; bg: string; border: string; glow: string }> = {
  primary: {
    text: "text-primary",
    bg: "bg-primary/8",
    border: "border-primary/30",
    glow: "shadow-[0_0_24px_rgba(124,58,237,0.15)]",
  },
  accent: {
    text: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-300/50",
    glow: "shadow-[0_0_24px_rgba(212,168,83,0.15)]",
  },
  success: {
    text: "text-green-600",
    bg: "bg-green-50",
    border: "border-green-300/50",
    glow: "shadow-[0_0_24px_rgba(22,163,74,0.12)]",
  },
  warning: {
    text: "text-orange-600",
    bg: "bg-orange-50",
    border: "border-orange-300/50",
    glow: "shadow-[0_0_24px_rgba(234,88,12,0.12)]",
  },
};

// ── Tarjeta de stat animada ────────────────────────────────────────────────────
function StatCard({ estadistica, index }: { estadistica: EstadisticaImpacto; index: number }) {
  const t = TONO[estadistica.tono];
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.55, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className={`rounded-2xl border ${t.border} ${t.bg} ${t.glow} p-6 flex flex-col items-center text-center`}
    >
      <motion.p
        className={`text-4xl md:text-5xl font-black font-display ${t.text} mb-2 leading-none`}
        initial={{ scale: 0.6, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: index * 0.1 + 0.2, type: "spring", stiffness: 180, damping: 14 }}
      >
        {estadistica.num}
      </motion.p>
      <p className="text-sm text-card-foreground leading-snug mb-2 font-medium">
        {estadistica.label}
      </p>
      <p className={`text-xs italic ${t.text} opacity-70`}>{estadistica.fuente}</p>
    </motion.div>
  );
}

// ── Barra histórica animada ────────────────────────────────────────────────────
function BarraAnimada({ año, valor, max, index }: { año: string; valor: number; max: number; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref as React.RefObject<Element>, { once: true });

  return (
    <div ref={ref} className="flex items-center gap-3">
      <span className="text-sm text-muted-foreground w-10 text-right shrink-0">{año}</span>
      <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-primary rounded-full"
          initial={{ width: 0 }}
          animate={isInView ? { width: `${(valor / max) * 100}%` } : { width: 0 }}
          transition={{ duration: 1.1, delay: index * 0.12, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
      <span className="text-sm font-bold text-card-foreground w-12 text-right shrink-0">
        {valor}%
      </span>
    </div>
  );
}

// ── Barra de progreso animada (seguridad) ─────────────────────────────────────
function BarraProgreso({ label, valor, index }: { label: string; valor: number; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref as React.RefObject<Element>, { once: true });

  return (
    <div ref={ref}>
      <div className="flex justify-between mb-1.5">
        <span className="text-sm text-card-foreground">{label}</span>
        <span className="text-sm font-bold text-primary">{valor}%</span>
      </div>
      <div className="h-2.5 bg-muted rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full"
          initial={{ width: 0 }}
          animate={isInView ? { width: `${valor}%` } : { width: 0 }}
          transition={{ duration: 1.0, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
    </div>
  );
}

// ── Divisor de sección ─────────────────────────────────────────────────────────
function SectionDivider({ titulo }: { titulo: string }) {
  return (
    <motion.div
      className="my-12 text-center"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      <p className="text-xs font-bold text-primary uppercase tracking-[0.22em] px-4">
        {titulo}
      </p>
      <div className="h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent mt-3" />
    </motion.div>
  );
}

// ── Página ─────────────────────────────────────────────────────────────────────
export default function Impacto() {
  return (
    <div className="min-h-screen bg-gradient-warm">
      <Navbar />

      {/* ── Hero ── */}
      <div className="relative bg-gradient-to-br from-[#1a0533] via-[#2d0f52] to-[#160c2e] overflow-hidden pt-24 pb-16 px-4">
        <div className="absolute top-0 left-1/4 w-96 h-64 rounded-full bg-primary/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-64 h-48 rounded-full bg-accent/15 blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 right-[10%] w-32 h-32 rounded-full bg-white/5 blur-2xl animate-float pointer-events-none" />

        <div className="container mx-auto max-w-3xl text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 mb-5">
              <TrendingUp className="h-3.5 w-3.5 text-accent" />
              <span className="text-xs font-medium text-white/80 uppercase tracking-widest">
                Datos que lo demuestran
              </span>
            </div>

            <h1 className="font-display leading-none mb-3">
              <span className="block text-xs font-semibold uppercase tracking-[0.2em] text-white/40 mb-2">
                Por qué
              </span>
              <span className="block text-[3.5rem] md:text-[5.5rem] lg:text-[7rem] font-black italic text-white leading-none">
                Hana
              </span>
              <span className="block text-xl md:text-2xl font-bold mt-2 bg-gradient-to-r from-violet-300 via-fuchsia-100 to-amber-200 bg-clip-text text-transparent">
                existe
              </span>
            </h1>

            <p className="text-white/50 text-sm max-w-md mx-auto mt-3">
              Cifras reales de Chile · INE · CASEN · Fundación Sol · Corporación Humanas · ChileMujeres 2024–2025
            </p>
          </motion.div>
        </div>
      </div>

      <div className="pb-12 container mx-auto px-4 max-w-5xl pt-12">

        {/* Stats principales */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {ESTADISTICAS_PRINCIPALES.map((e, i) => (
            <StatCard key={e.num} estadistica={e} index={i} />
          ))}
        </div>

        {/* ─── Sección 1: Chile cambia ─── */}
        <SectionDivider titulo="Chile está cambiando — y las mujeres lideran ese cambio" />

        <div className="grid md:grid-cols-2 gap-5 mb-8">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="text-base">Hogares con jefatura femenina en Chile</CardTitle>
                <p className="text-xs text-muted-foreground">Evolución 1990–2024 · Fuente: CASEN / INE / Fundación Sol</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 mb-4">
                  {JEFATURA_FEMENINA.map((r, i) => (
                    <BarraAnimada key={r.año} año={r.año} valor={r.valor} max={100} index={i} />
                  ))}
                </div>
                <p className="text-sm font-semibold text-primary border-t border-border pt-3">
                  De 642 mil a 2 millones de hogares — se triplicaron en 30 años
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          >
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="text-base">Hogares unipersonales en Chile</CardTitle>
                <p className="text-xs text-muted-foreground">Mujeres viviendo solas · Fuente: Censo INE</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 mb-4">
                  {HOGARES_UNIPERSONALES.map((r, i) => (
                    <BarraAnimada key={r.año} año={r.año} valor={r.valor} max={25} index={i} />
                  ))}
                </div>
                <p className="text-sm font-semibold text-primary border-t border-border pt-3">
                  Más de 1 de cada 5 hogares chilenos tiene una sola persona
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* ─── Sección 2: Desigualdad laboral ─── */}
        <SectionDivider titulo="La desigualdad laboral que Hana combate" />

        <div className="grid md:grid-cols-3 gap-5 mb-8">
          {/* Participación laboral */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, delay: 0, ease: [0.22, 1, 0.36, 1] }}
          >
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="text-base">Participación laboral</CardTitle>
                <p className="text-xs text-muted-foreground">Tasa de participación · INE oct–dic 2024</p>
              </CardHeader>
              <CardContent>
                <div className="flex justify-around mb-5">
                  <div className="text-center">
                    <p className="text-3xl font-black font-display text-green-600">71,4%</p>
                    <p className="text-xs text-muted-foreground mt-1">Hombres</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-black font-display text-primary">52,1%</p>
                    <p className="text-xs text-muted-foreground mt-1">Mujeres</p>
                  </div>
                </div>
                <div className="text-center mb-4">
                  <span className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold">
                    Brecha de 19,3 puntos
                  </span>
                </div>
                <p className="text-sm font-semibold text-primary border-t border-border pt-3">
                  Casi 1 de cada 5 mujeres fuera del mercado laboral
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Quién cuida */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          >
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="text-base">¿Quién deja de trabajar por cuidar?</CardTitle>
                <p className="text-xs text-muted-foreground">Cuidado de hijos · CASEN 2020</p>
              </CardHeader>
              <CardContent>
                <div className="flex justify-around mb-4">
                  <div className="text-center">
                    <p className="text-4xl font-black font-display text-primary">98,3%</p>
                    <p className="text-xs text-muted-foreground mt-1">Mujeres</p>
                  </div>
                  <div className="text-center">
                    <p className="text-4xl font-black font-display text-muted-foreground/40">1,7%</p>
                    <p className="text-xs text-muted-foreground mt-1">Hombres</p>
                  </div>
                </div>
                <BarraProgreso label="" valor={98.3} index={0} />
                <p className="text-sm font-semibold text-primary border-t border-border pt-3 mt-4">
                  Casi la totalidad del sacrificio laboral recae en ellas
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Brecha salarial */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="text-base">Brecha salarial</CardTitle>
                <p className="text-xs text-muted-foreground">Ingreso promedio · ChileMujeres 2024</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
                    <span className="text-sm text-muted-foreground">Hombres</span>
                    <span className="text-2xl font-black font-display text-green-600">$500K</span>
                  </div>
                  <div className="text-center">
                    <span className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold">
                      −23,3% brecha
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-primary/5 border border-primary/20">
                    <span className="text-sm text-card-foreground font-medium">Mujeres</span>
                    <span className="text-2xl font-black font-display text-primary">$450K</span>
                  </div>
                </div>
                <p className="text-sm font-semibold text-primary border-t border-border pt-3">
                  En empleos informales la brecha sube a 29,2%
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* ─── Sección 3: Seguridad ─── */}
        <SectionDivider titulo="Seguridad y autonomía — la razón más profunda de Hana" />

        <div className="grid md:grid-cols-2 gap-5 mb-8">
          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0, x: -25 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55 }}
            >
              <Card className="border-l-4 border-l-amber-500">
                <CardContent className="p-5">
                  <blockquote className="text-base italic text-card-foreground leading-relaxed mb-3">
                    "Un 92% de las mujeres valora el trabajo remunerado como fuente de autonomía económica y desarrollo personal."
                  </blockquote>
                  <p className="text-xs text-muted-foreground">
                    Corporación Humanas, Encuesta 2025 · 1.301 mujeres encuestadas en Chile
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -25 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, delay: 0.1 }}
            >
              <Card className="border-l-4 border-l-primary">
                <CardContent className="p-5">
                  <blockquote className="text-base italic text-card-foreground leading-relaxed mb-3">
                    "Un 77% de las mujeres chilenas declara haberse sentido insegura en espacios públicos. Un 69% en el transporte. Un 67% en plazas y parques."
                  </blockquote>
                  <p className="text-xs text-muted-foreground">Corporación Humanas, Encuesta 2025</p>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 25 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, delay: 0.1 }}
          >
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Shield className="h-4 w-4 text-primary" />
                  ¿Dónde se sienten inseguras las mujeres?
                </CardTitle>
                <p className="text-xs text-muted-foreground">Chile · Corporación Humanas 2025</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {SEGURIDAD_MUJERES.map((item, i) => (
                    <BarraProgreso key={item.label} label={item.label} valor={item.valor} index={i} />
                  ))}
                </div>
                <p className="text-sm font-semibold text-primary border-t border-border pt-4 mt-5">
                  Elegir a quién abres tu puerta no es un detalle — es una decisión
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Stats finales */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {ESTADISTICAS_FINALES.map((e, i) => (
            <StatCard key={e.num} estadistica={e} index={i} />
          ))}
        </div>

        {/* CTA final */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.65 }}
        >
          <Card className="bg-gradient-to-br from-primary/10 to-amber-500/5 border-primary/20">
            <CardContent className="p-8 md:p-12 text-center space-y-5">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/15">
                <Heart className="h-6 w-6 text-primary" />
              </div>
              <h2 className="text-2xl md:text-3xl font-black font-display text-card-foreground leading-tight">
                Hana no es solo una app.<br />Es una decisión.
              </h2>
              <div className="max-w-2xl mx-auto space-y-4 text-muted-foreground leading-relaxed">
                <p>Chile tiene 2 millones de hogares liderados por mujeres. Mujeres que trabajan, que viven solas, que crían solas y que merecen elegir a quién abren su puerta.</p>
                <p>Por eso en Hana cada trabajadora es verificada, maneja su propia agenda, fija sus tarifas y construye su reputación con datos reales.</p>
                <p className="font-semibold text-primary">Usar Hana no es solo resolver una necesidad. Es apoyar el trabajo femenino, fortalecer la economía de otras mujeres y construir una comunidad donde todas estamos más seguras.</p>
              </div>
              <div className="flex flex-wrap gap-3 justify-center pt-4">
                <Button asChild variant="hero" size="lg">
                  <Link to="/registro">
                    <Users className="h-4 w-4" />
                    Quiero contratar servicios
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link to="/registro">Quiero ofrecer mis servicios</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
}
