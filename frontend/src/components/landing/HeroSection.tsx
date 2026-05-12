import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Search, Shield, Star, ArrowRight } from "lucide-react";
import ThreeDPhotoCarousel from "@/components/ui/three-d-carousel";
import { AnimatedButtonWrapper } from "@/components/ui/bg-animate-button";
import { TextureOverlay } from "@/components/ui/texture-overlay";

const HeroSection = () => {
  return (
    <section className="relative min-h-[90vh] flex items-center bg-gradient-warm pt-16 overflow-hidden">
      <TextureOverlay texture="paperGrain" opacity={0.4} />

      {/* Glow decorativo */}
      <div
        className="absolute top-0 right-0 w-[55%] h-full pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 70% 40%, hsl(var(--primary-lighter) / 0.25), transparent 65%)",
        }}
      />

      <div className="container mx-auto px-4 grid lg:grid-cols-2 gap-12 items-center relative z-10">

        {/* ── Columna izquierda ────────────────────────────────── */}
        <div className="space-y-7">

          {/* Badge */}
          <motion.div
            className="inline-flex items-center gap-2 bg-purple-light border border-primary/10 px-4 py-1.5 rounded-full shadow-xs"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse-soft" />
            <span className="text-xs font-semibold text-primary tracking-wide">
              Hecho por mujeres, para mujeres
            </span>
          </motion.div>

          {/* Título editorial */}
          <h1 className="font-display">
            {/* Línea 1 — apoyo, tamaño medio */}
            <motion.span
              className="block text-2xl md:text-3xl font-medium text-foreground/50 tracking-tight leading-snug"
              initial={{ opacity: 0, x: -18 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.55, delay: 0.22 }}
            >
              Tu talento merece
            </motion.span>

            {/* Línea 2 — protagonista, italic enorme */}
            <motion.span
              className="block text-[3.2rem] md:text-[4rem] lg:text-[5rem] font-bold italic text-gradient-primary leading-none pr-2"
              initial={{ opacity: 0, x: -18 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.55, delay: 0.36 }}
            >
              ser visto.
            </motion.span>

            {/* Separador sutil */}
            <motion.span
              className="block w-10 h-px bg-gradient-to-r from-primary/30 to-transparent my-3"
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: 1, scaleX: 1 }}
              style={{ originX: 0 }}
              transition={{ duration: 0.4, delay: 0.5 }}
            />

            {/* Línea 3 — apoyo, tamaño medio */}
            <motion.span
              className="block text-xl md:text-2xl font-medium text-foreground/50 tracking-tight leading-snug"
              initial={{ opacity: 0, x: -18 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.55, delay: 0.54 }}
            >
              Tu hogar merece
            </motion.span>

            {/* Línea 4 — protagonista, bold grande */}
            <motion.span
              className="block text-[2.8rem] md:text-[3.5rem] lg:text-[4.5rem] font-bold text-gradient-gold leading-none"
              initial={{ opacity: 0, x: -18 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.55, delay: 0.68 }}
            >
              lo mejor.
            </motion.span>
          </h1>

          {/* Descripción */}
          <motion.p
            className="text-base md:text-lg text-muted-foreground max-w-lg leading-relaxed"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            Hana conecta a mujeres que buscan servicios del hogar con
            profesionales verificadas. Un espacio de confianza, respeto y
            empoderamiento.
          </motion.p>

          {/* Botones */}
          <motion.div
            className="flex flex-col sm:flex-row gap-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.9 }}
          >
            <AnimatedButtonWrapper
              gradient="nebula"
              className="shadow-soft hover:shadow-md-elevated transition-all duration-300 hover:-translate-y-0.5"
            >
              <Button variant="hero" size="lg" asChild className="w-full">
                <Link to="/buscar">
                  <Search className="mr-2 h-5 w-5" />
                  Buscar Profesionales
                </Link>
              </Button>
            </AnimatedButtonWrapper>
            <AnimatedButtonWrapper
              gradient="violet"
              className="hover:shadow-soft transition-all duration-300 hover:-translate-y-0.5"
            >
              <Button variant="outline-hero" size="lg" asChild className="w-full">
                <Link to="/registro">
                  Ofrecer mis Servicios
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </AnimatedButtonWrapper>
          </motion.div>

          {/* Trust indicators */}
          <motion.div
            className="flex items-center gap-6 pt-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 1.0 }}
          >
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Shield className="h-4 w-4 text-primary shrink-0" />
              Identidad verificada
            </div>
            <div className="w-px h-4 bg-border" />
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Star className="h-4 w-4 text-accent shrink-0" />
              Reseñas reales
            </div>
          </motion.div>
        </div>

        {/* ── Columna derecha: carrusel ────────────────────────── */}
        <motion.div
          className="flex flex-col gap-4"
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
        >
          <ThreeDPhotoCarousel />
          <div className="flex justify-center">
            <div className="inline-flex items-center gap-3 bg-card rounded-xl px-5 py-3 shadow-card border border-border/60 animate-float">
              <div className="w-9 h-9 rounded-full bg-gradient-gold flex items-center justify-center shadow-gold shrink-0">
                <Star className="h-4 w-4 text-accent-foreground" />
              </div>
              <div>
                <p className="text-sm font-semibold text-card-foreground">
                  +500 profesionales
                </p>
                <p className="text-xs text-muted-foreground">verificadas en Chile</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
