import { Star, Quote } from "lucide-react"
import { motion } from "motion/react"

const testimonials = [
  {
    name: "Carolina M.",
    role: "Clienta",
    text: "Encontré a una profesional excelente para el cuidado de mi mamá. El proceso fue simple y me sentí segura desde el primer momento.",
    rating: 5,
    accent: "#7c3aed",
    accentBg: "#f5f3ff",
  },
  {
    name: "María José L.",
    role: "Trabajadora",
    text: "Hana me dio visibilidad y clientas nuevas cada semana. Me encanta que valoren mi trabajo con reseñas reales.",
    rating: 5,
    accent: "#b45309",
    accentBg: "#fffbeb",
  },
  {
    name: "Valentina R.",
    role: "Clienta",
    text: "La verificación de identidad y las reseñas me dieron la confianza que necesitaba. Muy recomendable.",
    rating: 5,
    accent: "#9333ea",
    accentBg: "#faf5ff",
  },
]

const TestimonialsSection = () => {
  return (
    <section className="py-20 bg-secondary/30">
      <div className="container mx-auto px-4">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-xs font-bold text-primary uppercase tracking-[0.2em] mb-3">
            Comunidad Hana
          </p>
          <h2 className="text-3xl md:text-4xl font-bold font-display text-foreground mb-4">
            Lo que dicen nuestras usuarias
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: i * 0.12 }}
              className="rounded-2xl border-2 p-6 flex flex-col gap-4 transition-shadow duration-300 hover:shadow-soft"
              style={{
                backgroundColor: t.accentBg,
                borderColor: t.accent + "22",
              }}
            >
              {/* Comilla decorativa */}
              <Quote
                className="h-7 w-7 opacity-20"
                style={{ color: t.accent }}
              />

              {/* Estrellas */}
              <div className="flex gap-1">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star key={j} className="h-4 w-4 fill-amber-400 text-amber-400" />
                ))}
              </div>

              {/* Texto del testimonio — visible directamente */}
              <p className="text-sm text-foreground/75 leading-relaxed flex-1 italic">
                "{t.text}"
              </p>

              {/* Autor */}
              <div className="flex items-center gap-3 pt-2 border-t border-foreground/8">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
                  style={{ backgroundColor: t.accent }}
                >
                  {t.name[0]}
                </div>
                <div>
                  <p className="font-semibold text-sm text-foreground leading-tight">
                    {t.name}
                  </p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default TestimonialsSection
