import { Shield, DollarSign, Award, HeartHandshake } from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "Identidad Verificada",
    description: "Cada profesional pasa por un proceso de verificación de identidad y antecedentes antes de unirse.",
  },
  {
    icon: DollarSign,
    title: "Precios Transparentes",
    description: "Conoce la tarifa exacta antes de contratar. Sin cargos ocultos ni sorpresas.",
  },
  {
    icon: Award,
    title: "Profesionales Certificadas",
    description: "Trabajadoras con experiencia comprobada y capacitación en sus áreas de servicio.",
  },
  {
    icon: HeartHandshake,
    title: "Comunidad de Confianza",
    description: "Un espacio seguro creado por mujeres, donde cada reseña es real y verificada.",
  },
];

const TrustSection = () => {
  return (
    <section className="py-20 bg-muted/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-14">
          <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">
            Tu tranquilidad es lo primero
          </p>
          <h2 className="text-3xl md:text-4xl font-bold font-display text-foreground mb-4">
            ¿Por qué elegir Hana?
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Creamos un estándar de seguridad y calidad para que contrates con total confianza
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f) => (
            <div
              key={f.title}
              className="relative bg-card rounded-2xl p-6 border border-border hover:border-primary/25 hover:shadow-soft hover:-translate-y-1 transition-all duration-300 group shadow-xs"
            >
              {/* Línea de acento superior al hover */}
              <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl bg-gradient-to-r from-primary to-accent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="w-12 h-12 rounded-xl bg-purple-light flex items-center justify-center mb-5 group-hover:bg-primary group-hover:shadow-soft transition-all duration-300">
                <f.icon className="h-6 w-6 text-primary group-hover:text-primary-foreground transition-colors duration-300" />
              </div>
              <h3 className="font-semibold text-card-foreground text-lg mb-2 font-display">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustSection;
