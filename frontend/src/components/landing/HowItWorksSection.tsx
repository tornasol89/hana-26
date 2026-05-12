import { useRef } from "react";
import { Search, CalendarCheck, MessageCircle, Star } from "lucide-react";
import { motion, useInView } from "motion/react";

const steps = [
  {
    icon: Search,
    title: "Busca",
    description: "Filtra por categoría, región y disponibilidad para encontrar la profesional ideal.",
    color: "from-primary to-primary/80",
    glow: "shadow-[0_8px_32px_rgba(124,58,237,0.35)]",
    bg: "bg-primary/8",
    num: "01",
  },
  {
    icon: CalendarCheck,
    title: "Reserva",
    description: "Solicita el servicio indicando fecha, hora y detalles. La trabajadora confirma tu reserva.",
    color: "from-amber-500 to-amber-400",
    glow: "shadow-[0_8px_32px_rgba(212,168,83,0.35)]",
    bg: "bg-amber-50",
    num: "02",
  },
  {
    icon: MessageCircle,
    title: "Comunica",
    description: "Coordina los detalles directamente por chat integrado dentro de la plataforma.",
    color: "from-violet-600 to-purple-500",
    glow: "shadow-[0_8px_32px_rgba(124,58,237,0.30)]",
    bg: "bg-violet-50",
    num: "03",
  },
  {
    icon: Star,
    title: "Evalúa",
    description: "Después del servicio, deja una reseña para ayudar a la comunidad de confianza.",
    color: "from-primary to-accent",
    glow: "shadow-[0_8px_32px_rgba(212,168,83,0.30)]",
    bg: "bg-primary/5",
    num: "04",
  },
];

// ── Línea conectora animada ────────────────────────────────────────────────────
function ConnectorLine() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref as React.RefObject<Element>, { once: true });

  return (
    <div ref={ref} className="hidden md:block absolute top-10 left-[12.5%] right-[12.5%] h-px z-0">
      <div className="w-full h-full bg-border/60 rounded-full" />
      <motion.div
        className="absolute inset-0 h-full bg-gradient-to-r from-primary via-amber-500 to-primary rounded-full"
        initial={{ scaleX: 0, originX: 0 }}
        animate={isInView ? { scaleX: 1 } : { scaleX: 0 }}
        transition={{ duration: 1.4, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
      />
    </div>
  );
}

// ── Tarjeta de paso ────────────────────────────────────────────────────────────
function StepCard({ step, index }: { step: typeof steps[0]; index: number }) {
  return (
    <motion.div
      className="relative z-10 flex flex-col items-center text-center group cursor-default"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.6, delay: index * 0.15, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Número de fondo decorativo */}
      <span
        className="absolute -top-4 left-1/2 -translate-x-1/2 text-7xl font-black font-display select-none pointer-events-none opacity-[0.06] text-foreground leading-none"
      >
        {step.num}
      </span>

      {/* Círculo con icono */}
      <motion.div
        className={`relative w-20 h-20 rounded-full bg-gradient-to-br ${step.color} flex items-center justify-center mb-6 ${step.glow}`}
        whileHover={{ scale: 1.12, rotate: 6 }}
        transition={{ type: "spring", stiffness: 300, damping: 16 }}
      >
        <step.icon className="h-8 w-8 text-white" />

        {/* Badge número */}
        <span className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-card border-2 border-border flex items-center justify-center text-[10px] font-black text-foreground shadow-xs">
          {index + 1}
        </span>

        {/* Pulse ring */}
        <motion.span
          className={`absolute inset-0 rounded-full bg-gradient-to-br ${step.color} opacity-30`}
          animate={{ scale: [1, 1.5, 1.5], opacity: [0.3, 0, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, delay: index * 0.6, ease: "easeOut" }}
        />
      </motion.div>

      {/* Contenido */}
      <motion.div
        className={`w-full rounded-2xl border border-border/60 ${step.bg} px-5 py-5 group-hover:border-primary/20 group-hover:shadow-soft transition-all duration-300`}
        whileHover={{ y: -4 }}
        transition={{ duration: 0.2 }}
      >
        <h3 className="text-lg font-bold font-display text-foreground mb-2">
          {step.title}
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {step.description}
        </p>
      </motion.div>
    </motion.div>
  );
}

// ── Sección principal ──────────────────────────────────────────────────────────
const HowItWorksSection = () => {
  return (
    <section id="como-funciona" className="py-24 bg-gradient-warm overflow-hidden">
      <div className="container mx-auto px-4">

        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold font-display text-foreground mb-4">
            ¿Cómo{" "}
            <span className="italic text-gradient-primary">funciona?</span>
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            En 4 simples pasos, conecta con la profesional que necesitas
          </p>
        </motion.div>

        {/* Grid con línea conectora */}
        <div className="relative">
          <ConnectorLine />
          <div className="grid md:grid-cols-4 gap-6 md:gap-8">
            {steps.map((step, i) => (
              <StepCard key={step.title} step={step} index={i} />
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};

export default HowItWorksSection;
