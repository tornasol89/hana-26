import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Award, BookOpen, CheckCircle2, ExternalLink,
  HandshakeIcon, TrendingUp, Users, ArrowRight, Sparkles,
} from "lucide-react";
import { motion, useInView } from "motion/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AnimatedButtonWrapper } from "@/components/ui/bg-animate-button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import logoChilevalora from "@/assets/logo-chilevalora.jpg";
import logoSercotec from "@/assets/logo-sercotec.jpg";

// ── Datos ──────────────────────────────────────────────────────────────────────
const BENEFICIOS_CHILEVALORA = [
  { text: "Certificación reconocida por el Estado chileno en más de 50 competencias laborales", highlight: null },
  { text: "Aumenta tu Índice Hana en", highlight: "+10 puntos y aparece destacada en búsquedas" },
  { text: "Demuestra a las clientas que", highlight: "tu especialidad está avalada oficialmente" },
  { text: "Acceso a más oportunidades laborales formales y mejor remuneradas", highlight: null },
];

const BENEFICIOS_SERCOTEC = [
  { text: "Capital Semilla y Capital Abeja para emprendedoras que necesitan financiamiento", highlight: null },
  { text: "Talleres gratuitos de gestión, marketing y herramientas digitales", highlight: null },
  { text: "Asesoría personalizada para formalizar tu negocio de servicios", highlight: null },
  { text: "Red de emprendedoras conectadas a través de los Centros de Negocios regionales", highlight: null },
];

const PASOS_CHILEVALORA = [
  { num: "01", titulo: "Inscríbete", desc: "Contacta a un organismo evaluador acreditado por Chilevalora en tu región." },
  { num: "02", titulo: "Evaluación", desc: "Un evaluador certifica tus habilidades a través de una evaluación práctica y teórica." },
  { num: "03", titulo: "Certificado oficial", desc: "Recibes un certificado oficial que acredita tu especialidad a nivel nacional." },
  { num: "04", titulo: "Súbelo a Hana", desc: "En «Mis servicios → Certificados», carga tu documento y tu Índice Hana sube automáticamente." },
];

// ── Logo Chilevalora ───────────────────────────────────────────────────────────
function LogoChilevalora({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const h = size === "sm" ? "h-7" : size === "lg" ? "h-14" : "h-10";
  return <img src={logoChilevalora} alt="Chilevalora" className={`${h} w-auto object-contain`} />;
}

// ── Logo Sercotec ──────────────────────────────────────────────────────────────
function LogoSercotec({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const h = size === "sm" ? "h-7" : size === "lg" ? "h-14" : "h-10";
  return <img src={logoSercotec} alt="Sercotec" className={`${h} w-auto object-contain`} />;
}

// ── Componente AnimatedBenefit ─────────────────────────────────────────────────
function BenefitItem({ text, highlight, index, color }: { text: string; highlight: string | null; index: number; color: string }) {
  return (
    <motion.li
      className="flex items-start gap-3"
      initial={{ opacity: 0, x: -16 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
    >
      <CheckCircle2 className={`h-4 w-4 shrink-0 mt-0.5 ${color}`} />
      <span className="text-sm text-card-foreground leading-relaxed">
        {text}{highlight && (
          <> <span className={`font-semibold ${color}`}>{highlight}</span></>
        )}
      </span>
    </motion.li>
  );
}

// ── Step Timeline ──────────────────────────────────────────────────────────────
function StepTimeline() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref as React.RefObject<Element>, { once: true });

  return (
    <div ref={ref} className="relative">
      {/* línea vertical */}
      <div className="absolute left-[22px] top-4 bottom-4 w-0.5 bg-border" />
      <motion.div
        className="absolute left-[22px] top-4 w-0.5 bg-gradient-to-b from-amber-500 to-amber-300 origin-top"
        initial={{ scaleY: 0 }}
        animate={isInView ? { scaleY: 1 } : {}}
        transition={{ duration: 1.2, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
        style={{ height: "calc(100% - 2rem)" }}
      />

      <div className="space-y-6">
        {PASOS_CHILEVALORA.map((paso, i) => (
          <motion.div
            key={paso.num}
            className="flex gap-5 items-start"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: i * 0.12 }}
          >
            <div className="relative z-10 w-11 h-11 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs font-black shrink-0 shadow-[0_4px_12px_rgba(245,166,35,0.4)]">
              {paso.num}
            </div>
            <div className="pt-1.5 pb-2">
              <p className="font-bold text-sm text-card-foreground mb-1">{paso.titulo}</p>
              <p className="text-xs text-muted-foreground leading-relaxed">{paso.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ── Página ─────────────────────────────────────────────────────────────────────
export default function Alianza() {
  useEffect(() => { window.scrollTo(0, 0); }, []);

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
              <HandshakeIcon className="h-3.5 w-3.5 text-accent" />
              <span className="text-xs font-medium text-white/80 uppercase tracking-widest">
                Alianzas estratégicas
              </span>
            </div>

            <h1 className="font-display leading-none mb-3">
              <span className="block text-xs font-semibold uppercase tracking-[0.2em] text-white/40 mb-2">
                Tu trabajo,
              </span>
              <span className="block text-[3.5rem] md:text-[5.5rem] lg:text-[7rem] font-black italic text-white leading-none">
                respaldado
              </span>
              <span className="block text-xl md:text-2xl font-bold mt-2 bg-gradient-to-r from-violet-300 via-fuchsia-100 to-amber-200 bg-clip-text text-transparent">
                por el Estado
              </span>
            </h1>

            <p className="text-white/55 text-sm max-w-md mx-auto mt-3">
              Trabajamos junto a dos organismos del Estado para que las mujeres que
              ofrecen servicios a través de Hana tengan acceso a certificación oficial,
              financiamiento y capacitación gratuita.
            </p>
          </motion.div>

          {/* Logos */}
          <motion.div
            className="flex flex-wrap items-center justify-center gap-4 mt-8"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="flex items-center gap-2 px-4 py-2.5 bg-white/10 border border-white/20 rounded-xl backdrop-blur-sm">
              <div className="w-6 h-6 rounded-full bg-gradient-hero flex items-center justify-center">
                <Sparkles className="h-3 w-3 text-white" />
              </div>
              <span className="font-black text-white text-sm">HANA</span>
            </div>
            <span className="text-xl font-light text-white/40">×</span>
            <div className="px-4 py-2.5 bg-white rounded-xl">
              <LogoChilevalora size="sm" />
            </div>
            <span className="text-xl font-light text-white/40">×</span>
            <div className="px-4 py-2.5 bg-white rounded-xl">
              <LogoSercotec size="sm" />
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            className="flex flex-wrap justify-center gap-8 mt-10"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.5 }}
          >
            {[
              { val: "+50", label: "competencias certificadas" },
              { val: "100%", label: "gratuito para trabajadoras" },
              { val: "16", label: "regiones de Chile" },
            ].map((s) => (
              <div key={s.val} className="text-center">
                <p className="font-display text-2xl font-bold text-white">{s.val}</p>
                <p className="text-white/45 text-xs mt-0.5">{s.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      <div className="pt-0">

        {/* ── Chilevalora ── */}
        <section className="bg-card border-y border-border py-16">
          <div className="container mx-auto px-4 max-w-5xl">

            {/* Header organización */}
            <motion.div
              className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-10 pb-8 border-b border-border"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex-shrink-0 p-5 bg-white border border-amber-200 rounded-2xl">
                <LogoChilevalora size="lg" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-black italic font-display text-amber-600">Chilevalora</h2>
                <p className="text-muted-foreground max-w-xl text-sm leading-relaxed">
                  La Comisión del Sistema Nacional de Certificación de Competencias Laborales
                  certifica habilidades y conocimientos adquiridos por la experiencia,
                  <strong className="text-foreground"> sin importar si completaste estudios formales.</strong>
                </p>
                <a
                  href="https://www.chilevalora.cl"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-amber-600 hover:text-amber-700 font-semibold transition-colors"
                >
                  <ExternalLink className="h-3 w-3" />
                  www.chilevalora.cl
                </a>
              </div>
            </motion.div>

            {/* Layout 2 columnas */}
            <div className="grid md:grid-cols-2 gap-8">
              {/* Beneficios */}
              <motion.div
                initial={{ opacity: 0, x: -24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.55 }}
              >
                <Card className="border-t-4 border-t-amber-500 h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <TrendingUp className="h-5 w-5 text-amber-500" />
                      Beneficios para trabajadoras Hana
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3.5">
                      {BENEFICIOS_CHILEVALORA.map((b, i) => (
                        <BenefitItem
                          key={i} text={b.text} highlight={b.highlight}
                          index={i} color="text-amber-500"
                        />
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Pasos */}
              <motion.div
                initial={{ opacity: 0, x: 24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.55, delay: 0.1 }}
              >
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle className="text-base">Cómo obtener tu certificado</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <StepTimeline />
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* CTAs */}
            <motion.div
              className="flex flex-col sm:flex-row gap-3 justify-center mt-8"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45 }}
            >
              <AnimatedButtonWrapper gradient="gold">
                <Button asChild variant="hero" className="w-full">
                  <Link to="/mi-perfil">
                    Subir mi certificado Chilevalora
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </AnimatedButtonWrapper>
              <Button asChild variant="outline">
                <a href="https://www.chilevalora.cl" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                  <ExternalLink className="h-4 w-4" />
                  Visitar sitio oficial
                </a>
              </Button>
            </motion.div>
          </div>
        </section>

        {/* ── Sercotec ── */}
        <section className="py-16">
          <div className="container mx-auto px-4 max-w-5xl space-y-8">

            {/* Header organización */}
            <motion.div
              className="flex flex-col md:flex-row items-start md:items-center gap-6 pb-8 border-b border-border"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex-shrink-0 p-5 bg-white border border-red-200 rounded-2xl">
                <LogoSercotec size="lg" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-black italic font-display text-red-600">Sercotec</h2>
                <p className="text-muted-foreground max-w-xl text-sm leading-relaxed">
                  El Servicio de Cooperación Técnica apoya a micro y pequeñas empresas
                  con financiamiento, capacitación y asesoría,
                  <strong className="text-foreground"> especialmente para mujeres que lideran sus propios negocios.</strong>
                </p>
                <a
                  href="https://www.sercotec.cl"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-[#e63329] hover:text-red-700 font-semibold transition-colors"
                >
                  <ExternalLink className="h-3 w-3" />
                  www.sercotec.cl
                </a>
              </div>
            </motion.div>

            {/* Beneficios + CTA */}
            <div className="grid md:grid-cols-2 gap-8">
              <motion.div
                initial={{ opacity: 0, x: -24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.55 }}
              >
                <Card className="border-t-4 border-t-[#e63329] h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <BookOpen className="h-5 w-5 text-[#e63329]" />
                      Programas disponibles para trabajadoras Hana
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3.5">
                      {BENEFICIOS_SERCOTEC.map((b, i) => (
                        <BenefitItem
                          key={i} text={b.text} highlight={b.highlight}
                          index={i} color="text-[#e63329]"
                        />
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                className="flex flex-col gap-4"
                initial={{ opacity: 0, x: 24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.55, delay: 0.1 }}
              >
                {[
                  { icon: "💰", title: "Capital Abeja", desc: "Financiamiento directo para mujeres emprendedoras. Postulación anual en todas las regiones." },
                  { icon: "📚", title: "Capacitación gratuita", desc: "Talleres de gestión, marketing digital y habilidades empresariales en los Centros de Negocios." },
                  { icon: "🤝", title: "Asesoría personalizada", desc: "Acompañamiento para formalizar tu negocio y acceder a más clientes y mejores tarifas." },
                ].map((item, i) => (
                  <motion.div
                    key={item.title}
                    className="flex gap-4 p-4 rounded-xl bg-red-50/60 border border-red-100 hover:border-[#e63329]/30 transition-colors"
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1, duration: 0.4 }}
                    whileHover={{ x: 4 }}
                  >
                    <span className="text-2xl shrink-0">{item.icon}</span>
                    <div>
                      <p className="font-bold text-sm text-foreground mb-0.5">{item.title}</p>
                      <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}

                <Button asChild variant="outline" className="mt-2">
                  <a href="https://www.sercotec.cl" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                    <ExternalLink className="h-4 w-4" />
                    Visitar sitio oficial de Sercotec
                  </a>
                </Button>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ── CTA final ── */}
        <motion.section
          className="bg-gradient-to-br from-primary/10 via-background to-amber-500/5 border-t border-primary/15 py-16"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="container mx-auto px-4 max-w-2xl text-center space-y-6">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary/15 mx-auto">
              <HandshakeIcon className="h-7 w-7 text-primary" />
            </div>
            <h2 className="font-display leading-tight">
              <span className="block text-base md:text-lg font-medium text-foreground/55">Juntas construimos</span>
              <span className="block text-3xl md:text-4xl font-black italic text-gradient-primary leading-none">una economía</span>
              <span className="block text-2xl md:text-3xl font-bold text-gradient-gold leading-snug">más justa</span>
            </h2>
            <p className="text-muted-foreground leading-relaxed text-sm max-w-lg mx-auto">
              Estas alianzas no son solo papeles: son el camino para que tu trabajo
              sea reconocido, valorado y mejor pagado. Hana conecta tu talento con
              quien lo necesita; Chilevalora y Sercotec lo respaldan.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <AnimatedButtonWrapper gradient="nebula">
                <Button asChild variant="hero" size="lg" className="w-full">
                  <Link to="/registro">
                    <Users className="h-4 w-4 mr-2" />
                    Únete a Hana
                  </Link>
                </Button>
              </AnimatedButtonWrapper>
              <Button asChild variant="outline" size="lg">
                <Link to="/impacto">Ver nuestro impacto</Link>
              </Button>
            </div>
          </div>
        </motion.section>
      </div>

      <Footer />
    </div>
  );
}
