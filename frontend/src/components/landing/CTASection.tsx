import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const CTASection = () => {
  return (
    <section className="py-20 bg-gradient-hero">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-bold font-display text-primary-foreground mb-4">
          ¿Lista para comenzar?
        </h2>
        <p className="text-primary-foreground/80 max-w-md mx-auto mb-8">
          Únete a la comunidad de mujeres que confían en Hana para conectar, trabajar y crecer juntas.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button variant="gold" size="lg" asChild>
            <Link to="/registro">
              Crear mi Cuenta
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <Button variant="outline" size="lg" asChild className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground">
            <Link to="/buscar">Explorar Servicios</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
