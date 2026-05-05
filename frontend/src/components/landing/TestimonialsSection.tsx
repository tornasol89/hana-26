import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Carolina M.",
    role: "Clienta",
    text: "Encontré a una profesional excelente para el cuidado de mi mamá. El proceso fue simple y me sentí segura desde el primer momento.",
    rating: 5,
  },
  {
    name: "María José L.",
    role: "Trabajadora",
    text: "Hana me dio visibilidad y clientas nuevas cada semana. Me encanta que valoren mi trabajo con reseñas reales.",
    rating: 5,
  },
  {
    name: "Valentina R.",
    role: "Clienta",
    text: "La verificación de identidad y las reseñas me dieron la confianza que necesitaba. Muy recomendable.",
    rating: 5,
  },
];

const TestimonialsSection = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold font-display text-foreground mb-4">
            Lo que dicen nuestras usuarias
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="p-6 rounded-xl bg-card border border-border shadow-card hover:shadow-soft hover:-translate-y-1 hover:border-primary/20 transition-all duration-300"
            >
              <div className="flex gap-1 mb-4">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-accent text-accent" />
                ))}
              </div>
              <p className="text-sm text-muted-foreground mb-5 leading-relaxed italic">"{t.text}"</p>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-purple-light flex items-center justify-center text-xs font-bold text-primary shrink-0">
                  {t.name[0]}
                </div>
                <div>
                  <p className="font-semibold text-sm text-card-foreground">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
