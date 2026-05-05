import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Search, Shield, Star, ArrowRight } from "lucide-react";
import heroImage from "@/assets/hero-image.jpg";

const HeroSection = () => {
  return (
    <section className="relative min-h-[90vh] flex items-center bg-gradient-warm pt-16 overflow-hidden">
      {/* Glow decorativo de fondo */}
      <div
        className="absolute top-0 right-0 w-[55%] h-full pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at 70% 40%, hsl(var(--primary-lighter) / 0.25), transparent 65%)",
        }}
      />

      <div className="container mx-auto px-4 grid lg:grid-cols-2 gap-12 items-center relative z-10">
        {/* Text */}
        <div className="space-y-7 animate-fade-up">
          <div className="inline-flex items-center gap-2 bg-purple-light border border-primary/10 px-4 py-1.5 rounded-full shadow-xs">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse-soft" />
            <span className="text-xs font-semibold text-primary tracking-wide">Hecho por mujeres, para mujeres</span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-display leading-tight text-foreground">
            Tu talento merece{" "}
            <span className="text-gradient-primary">ser visto.</span>{" "}
            Tu hogar merece{" "}
            <span className="text-gradient-gold">lo mejor.</span>
          </h1>

          <p className="text-lg text-muted-foreground max-w-lg leading-relaxed">
            Hana conecta a mujeres que buscan servicios del hogar con profesionales verificadas. Un espacio de confianza, respeto y empoderamiento.
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button variant="hero" size="lg" asChild className="shadow-soft hover:shadow-md-elevated transition-all duration-300 hover:-translate-y-0.5">
              <Link to="/buscar">
                <Search className="mr-2 h-5 w-5" />
                Buscar Profesionales
              </Link>
            </Button>
            <Button variant="outline-hero" size="lg" asChild className="hover:shadow-soft transition-all duration-300 hover:-translate-y-0.5">
              <Link to="/registro">
                Ofrecer mis Servicios
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="flex items-center gap-6 pt-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Shield className="h-4 w-4 text-primary shrink-0" />
              Identidad verificada
            </div>
            <div className="w-px h-4 bg-border" />
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Star className="h-4 w-4 text-accent shrink-0" />
              Reseñas reales
            </div>
          </div>
        </div>

        {/* Image */}
        <div className="relative hidden lg:block animate-fade-in" style={{ animationDelay: "0.3s" }}>
          <div className="relative rounded-2xl overflow-hidden shadow-lg-elevated">
            <img
              src={heroImage}
              alt="Dos mujeres conectando a través de Hana"
              className="w-full h-[500px] object-cover"
              width={1280}
              height={960}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/25 via-transparent to-transparent" />
          </div>
          {/* Floating card */}
          <div className="absolute -bottom-6 -left-6 bg-card rounded-xl p-4 shadow-card animate-float border border-border/60">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-gold flex items-center justify-center shadow-gold">
                <Star className="h-5 w-5 text-accent-foreground" />
              </div>
              <div>
                <p className="text-sm font-semibold text-card-foreground">+500 profesionales</p>
                <p className="text-xs text-muted-foreground">verificadas en Chile</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
