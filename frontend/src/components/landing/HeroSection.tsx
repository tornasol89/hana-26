import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Search, Shield, Star, ArrowRight, ChevronDown } from "lucide-react";
import ThreeDPhotoCarousel from "@/components/ui/three-d-carousel";
import { AnimatedButtonWrapper } from "@/components/ui/bg-animate-button";
import { TextureOverlay } from "@/components/ui/texture-overlay";
import { TextGif, HANA_GIFS } from "@/components/ui/text-gif";
import hanaLogo from "@/assets/hana-logo.png";

const HeroSection = () => {
  return (
    <section className="relative min-h-[92vh] flex flex-col items-stretch bg-gradient-warm pt-20 overflow-hidden">
      <TextureOverlay texture="paperGrain" opacity={0.4} />

      {/* Glow decorativo */}
      <div
        className="absolute top-0 right-0 w-[55%] h-full pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 70% 40%, hsl(var(--primary-lighter) / 0.25), transparent 65%)",
        }}
      />

      {/* Contenido principal */}
      <div className="flex-1 container mx-auto px-4 grid lg:grid-cols-2 gap-10 lg:gap-16 items-center relative z-10 py-8">

        {/* ── Columna izquierda ────────────────────────────────── */}
        <div className="flex flex-col items-center lg:items-start gap-5 lg:gap-6">

          {/* LOGO PROTAGONISTA */}
          <motion.div
            className="flex flex-col items-center lg:items-start gap-3"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.img
              src={hanaLogo}
              alt="Hana"
              className="h-40 sm:h-48 lg:h-52 w-auto drop-shadow-lg"
              animate={{
                filter: [
                  "drop-shadow(0 0 12px rgba(124,58,237,0.3))",
                  "drop-shadow(0 0 28px rgba(124,58,237,0.55))",
                  "drop-shadow(0 0 12px rgba(124,58,237,0.3))",
                ],
              }}
              transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
              whileHover={{ scale: 1.04 }}
            />

            {/* Nombre + lema */}
            <div className="text-center lg:text-left">
              <motion.p
                className="text-xs font-semibold text-primary/70 tracking-[0.25em] uppercase"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                Hecho por mujeres, para mujeres
              </motion.p>
            </div>
          </motion.div>

          {/* Titular */}
          <h1 className="font-display text-center lg:text-left">
            <motion.span
              className="block text-base sm:text-xl md:text-2xl font-medium text-foreground/50 tracking-tight leading-snug"
              initial={{ opacity: 0, x: -18 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.55, delay: 0.35 }}
            >
              Tu talento y tu hogar merecen
            </motion.span>

            <motion.span
              className="block pr-2"
              initial={{ opacity: 0, x: -18 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.55, delay: 0.48 }}
            >
              <TextGif
                text="lo mejor."
                gifUrl={HANA_GIFS.galaxy}
                fallbackColor="hsl(270 50% 70%)"
                className="text-[2.2rem] sm:text-[3rem] md:text-[4rem] lg:text-[4.5rem] font-bold italic leading-none"
              />
            </motion.span>

            <motion.span
              className="block text-sm sm:text-base md:text-lg font-medium text-foreground/45 tracking-tight leading-relaxed mt-1"
              initial={{ opacity: 0, x: -18 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.55, delay: 0.6 }}
            >
              Conectamos profesionales verificadas con personas que cuidan su hogar.
            </motion.span>
          </h1>

          {/* Botones */}
          <motion.div
            className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.75 }}
          >
            <AnimatedButtonWrapper
              gradient="nebula"
              className="w-full sm:w-auto shadow-soft hover:shadow-md-elevated transition-all duration-300 hover:-translate-y-0.5"
            >
              <Button variant="hero" size="lg" asChild className="w-full">
                <Link to="/buscar">
                  <Search className="mr-2 h-5 w-5" />
                  Buscar Profesionales
                </Link>
              </Button>
            </AnimatedButtonWrapper>
            <Button variant="outline-hero" size="lg" asChild className="w-full sm:w-auto hover:shadow-soft transition-all duration-300 hover:-translate-y-0.5">
              <Link to="/registro">
                Ofrecer mis Servicios
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </motion.div>

          {/* Trust indicators */}
          <motion.div
            className="flex items-center gap-4 sm:gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.9 }}
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

        {/* ── Columna derecha: carrusel (solo lg+) ──────────── */}
        <motion.div
          className="hidden lg:flex flex-col gap-4"
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
                <p className="text-sm font-semibold text-card-foreground">+500 profesionales</p>
                <p className="text-xs text-muted-foreground">verificadas en Chile</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Badge móvil */}
        <motion.div
          className="flex lg:hidden justify-center -mt-4"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <div className="inline-flex items-center gap-3 bg-card rounded-xl px-5 py-3.5 shadow-card border border-border/60">
            <div className="w-10 h-10 rounded-full bg-gradient-gold flex items-center justify-center shadow-gold shrink-0">
              <Star className="h-5 w-5 text-accent-foreground" />
            </div>
            <div>
              <p className="text-base font-semibold text-card-foreground">+500 profesionales</p>
              <p className="text-sm text-muted-foreground">verificadas en Chile</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Scroll cue */}
      <motion.div
        className="flex justify-center pb-6 relative z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 1.1 }}
      >
        <motion.button
          onClick={() => {
            const el = document.getElementById("por-que-hana");
            if (el) el.scrollIntoView({ behavior: "smooth" });
          }}
          className="flex flex-col items-center gap-1 text-muted-foreground/60 hover:text-primary transition-colors duration-300 group cursor-pointer"
          aria-label="Ver más"
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <span className="text-[10px] font-semibold uppercase tracking-[0.18em]">Descubrir más</span>
          <ChevronDown className="h-4 w-4 group-hover:scale-110 transition-transform" />
        </motion.button>
      </motion.div>
    </section>
  );
};

export default HeroSection;
