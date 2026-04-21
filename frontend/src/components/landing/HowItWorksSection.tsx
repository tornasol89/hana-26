import { Search, CalendarCheck, MessageCircle, Star } from "lucide-react";

const steps = [
  {
    icon: Search,
    title: "Busca",
    description: "Filtra por categoría, región y disponibilidad para encontrar la profesional ideal.",
  },
  {
    icon: CalendarCheck,
    title: "Reserva",
    description: "Solicita el servicio indicando fecha, hora y detalles. La trabajadora confirma tu reserva.",
  },
  {
    icon: MessageCircle,
    title: "Comunica",
    description: "Coordina los detalles directamente por chat integrado dentro de la plataforma.",
  },
  {
    icon: Star,
    title: "Evalúa",
    description: "Después del servicio, deja una reseña para ayudar a la comunidad de confianza.",
  },
];

const HowItWorksSection = () => {
  return (
    <section id="como-funciona" className="py-20 bg-gradient-warm">
      <div className="container mx-auto px-4">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold font-display text-foreground mb-4">
            ¿Cómo funciona?
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            En 4 simples pasos, conecta con la profesional que necesitas
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-8">
          {steps.map((step, i) => (
            <div key={step.title} className="relative text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-gradient-hero flex items-center justify-center mb-5 shadow-soft">
                <step.icon className="h-7 w-7 text-primary-foreground" />
              </div>
              <span className="absolute top-0 right-1/2 translate-x-1/2 -translate-y-2 text-xs font-bold text-accent bg-card px-2 py-0.5 rounded-full border border-border">
                {i + 1}
              </span>
              <h3 className="text-lg font-semibold font-display text-foreground mb-2">{step.title}</h3>
              <p className="text-sm text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
