import { Shield, DollarSign, Award, HeartHandshake } from "lucide-react";
import { motion } from "motion/react";

interface Feature {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  title: string;
  description: string;
  card: string;
  iconBg: string;
  border: string;
  hoverBorder: string;
  iconColor: string;
  pulseDuration: string;
  pulseDelay: string;
}

const features: Feature[] = [
  {
    icon: Shield,
    title: "Identidad Verificada",
    description:
      "Cada profesional pasa por un proceso de verificación de identidad y antecedentes antes de unirse.",
    card: "#f5f3ff",
    iconBg: "#ede9fe",
    border: "#c4b5fd",
    hoverBorder: "#7c3aed",
    iconColor: "#7c3aed",
    pulseDuration: "1.8s",
    pulseDelay: "0s",
  },
  {
    icon: DollarSign,
    title: "Precios Transparentes",
    description:
      "Conoce la tarifa exacta antes de contratar. Sin cargos ocultos ni sorpresas.",
    card: "#fffbeb",
    iconBg: "#fef3c7",
    border: "#fde68a",
    hoverBorder: "#b45309",
    iconColor: "#b45309",
    pulseDuration: "2.2s",
    pulseDelay: "0.4s",
  },
  {
    icon: Award,
    title: "Profesionales Certificadas",
    description:
      "Trabajadoras con experiencia comprobada y capacitación en sus áreas de servicio.",
    card: "#fff1f2",
    iconBg: "#ffe4e6",
    border: "#fda4af",
    hoverBorder: "#be123c",
    iconColor: "#be123c",
    pulseDuration: "1.6s",
    pulseDelay: "0.8s",
  },
  {
    icon: HeartHandshake,
    title: "Comunidad de Confianza",
    description:
      "Un espacio seguro creado por mujeres, donde cada reseña es real y verificada.",
    card: "#faf5ff",
    iconBg: "#f3e8ff",
    border: "#d8b4fe",
    hoverBorder: "#9333ea",
    iconColor: "#9333ea",
    pulseDuration: "2.0s",
    pulseDelay: "1.2s",
  },
];

const TrustSection = () => {
  return (
    <section className="py-24 bg-background relative overflow-hidden">
      {/* Blobs decorativos de fondo */}
      <div className="absolute top-[-5%] left-[-5%] w-80 h-80 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-5%] right-[-5%] w-72 h-72 rounded-full bg-accent/8 blur-3xl pointer-events-none" />
      <div className="absolute top-[40%] left-[50%] w-48 h-48 rounded-full bg-primary/4 blur-2xl pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Encabezado */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-xs font-bold text-primary uppercase tracking-[0.22em] mb-3">
            Tu tranquilidad es lo primero
          </p>
          <h2 className="text-4xl md:text-5xl font-bold font-display text-foreground mb-4 leading-tight">
            ¿Por qué elegir{" "}
            <em className="not-italic text-gradient-primary">Hana?</em>
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto text-base">
            Creamos un estándar de seguridad y calidad para que contrates
            con total confianza
          </p>
        </motion.div>

        {/* Tarjetas */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -6, transition: { duration: 0.25 } }}
              className="group relative rounded-2xl border-2 p-6 cursor-default transition-shadow duration-300 hover:shadow-lg"
              style={{
                backgroundColor: f.card,
                borderColor: f.border,
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = f.hoverBorder;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = f.border;
              }}
            >
              {/* Número */}
              <span
                className="absolute top-4 right-4 text-xs font-bold tabular-nums opacity-30"
                style={{ color: f.iconColor }}
              >
                {String(i + 1).padStart(2, "0")}
              </span>

              {/* Icono pulsante */}
              <div className="mb-5 relative w-fit">
                {/* Anillo de pulso exterior */}
                <div
                  className="absolute inset-0 rounded-xl animate-ping opacity-20"
                  style={{
                    backgroundColor: f.iconColor,
                    animationDuration: f.pulseDuration,
                    animationDelay: f.pulseDelay,
                  }}
                />
                <div
                  className="relative w-14 h-14 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 animate-pulse"
                  style={{
                    backgroundColor: f.iconBg,
                    animationDuration: f.pulseDuration,
                    animationDelay: f.pulseDelay,
                  }}
                >
                  <f.icon
                    className="h-7 w-7 transition-transform duration-300 group-hover:rotate-6"
                    style={{ color: f.iconColor }}
                  />
                </div>
              </div>

              {/* Texto */}
              <h3
                className="font-bold text-lg font-display mb-2 leading-snug"
                style={{ color: f.iconColor }}
              >
                {f.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {f.description}
              </p>

              {/* Barra decorativa inferior */}
              <div
                className="absolute bottom-0 left-6 right-6 h-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ backgroundColor: f.hoverBorder }}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustSection;
