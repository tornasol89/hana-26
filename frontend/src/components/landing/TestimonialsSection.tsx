import { Star, ChevronDown, Quote } from "lucide-react"
import { motion } from "motion/react"
import {
  Expandable,
  ExpandableContent,
  ExpandableTrigger,
} from "@/components/ui/expandable"

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
]

const TestimonialsSection = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold font-display text-foreground mb-4">
            Lo que dicen{" "}
            <span className="italic text-gradient-primary">nuestras usuarias</span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: i * 0.1 }}
            >
              <Expandable
                className="rounded-xl bg-card border border-border shadow-card hover:shadow-soft hover:border-primary/20 transition-all duration-300 overflow-hidden"
              >
                {({ isExpanded }) => (
                  <>
                    {/* Cabecera siempre visible — clic expande */}
                    <ExpandableTrigger>
                      <div className="p-6 pb-4">
                        {/* Estrellas */}
                        <div className="flex gap-1 mb-4">
                          {Array.from({ length: t.rating }).map((_, j) => (
                            <Star key={j} className="h-4 w-4 fill-accent text-accent" />
                          ))}
                        </div>

                        {/* Usuario + chevron */}
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-purple-light flex items-center justify-center text-sm font-bold text-primary shrink-0">
                              {t.name[0]}
                            </div>
                            <div>
                              <p className="font-semibold text-sm text-card-foreground leading-tight">
                                {t.name}
                              </p>
                              <p className="text-xs text-muted-foreground">{t.role}</p>
                            </div>
                          </div>

                          <motion.div
                            animate={{ rotate: isExpanded ? 180 : 0 }}
                            transition={{ duration: 0.25 }}
                            className="text-muted-foreground shrink-0"
                          >
                            <ChevronDown className="h-4 w-4" />
                          </motion.div>
                        </div>
                      </div>
                    </ExpandableTrigger>

                    {/* Reseña expandible */}
                    <ExpandableContent preset="slide-up">
                      <div className="px-6 pb-6 pt-1">
                        <div className="border-t border-border/50 pt-4 relative">
                          <Quote className="h-5 w-5 text-primary/20 absolute -top-1 left-0" />
                          <p className="text-sm text-muted-foreground leading-relaxed italic pl-4">
                            "{t.text}"
                          </p>
                        </div>
                      </div>
                    </ExpandableContent>
                  </>
                )}
              </Expandable>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default TestimonialsSection
