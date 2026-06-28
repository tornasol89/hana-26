import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { AnimatedButtonWrapper } from "@/components/ui/bg-animate-button";
import { TextureOverlay } from "@/components/ui/texture-overlay";

const CTASection = () => {
  return (
    <section className="relative py-20 bg-gradient-hero overflow-hidden">
      <TextureOverlay texture="dots" opacity={0.07} />
      <div className="container mx-auto px-4 text-center relative z-10">
        <h2 className="text-3xl md:text-4xl font-bold font-display text-primary-foreground mb-4">
          ¿Lista para{" "}
          <span className="italic text-accent">comenzar?</span>
        </h2>
        <p className="text-primary-foreground/80 max-w-md mx-auto mb-8">
          Únete a la comunidad de mujeres que confían en Hana para conectar, trabajar y crecer juntas.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <AnimatedButtonWrapper gradient="gold" className="shadow-soft hover:shadow-md-elevated transition-all duration-300 hover:-translate-y-0.5">
            <Button variant="gold" size="lg" asChild className="w-full">
              <Link to="/registro">
                Crear mi Cuenta
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </AnimatedButtonWrapper>
          <Button variant="ghost" size="lg" asChild className="w-full border border-white/50 text-white hover:bg-white/10 hover:text-white hover:border-white/70 transition-all duration-300 hover:-translate-y-0.5">
            <Link to="/buscar">Explorar Servicios</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
