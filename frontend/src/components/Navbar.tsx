import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import hanaLogo from "@/assets/hana-logo.png";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
      <div className="container mx-auto px-4 flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-2">
          <img src={hanaLogo} alt="Hana" className="h-10" />
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-8">
          <Link to="/" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors">Inicio</Link>
          <Link to="/buscar" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors">Buscar Servicios</Link>
          <a href="#como-funciona" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors">¿Cómo funciona?</a>
          <div className="flex items-center gap-3">
            <Button variant="outline-hero" size="sm" asChild>
              <Link to="/login">Iniciar Sesión</Link>
            </Button>
            <Button variant="hero" size="sm" asChild>
              <Link to="/registro">Registrarse</Link>
            </Button>
          </div>
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden text-foreground" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-background border-b border-border px-4 pb-4 animate-fade-in">
          <div className="flex flex-col gap-3">
            <Link to="/" className="py-2 text-sm font-medium text-foreground/80" onClick={() => setIsOpen(false)}>Inicio</Link>
            <Link to="/buscar" className="py-2 text-sm font-medium text-foreground/80" onClick={() => setIsOpen(false)}>Buscar Servicios</Link>
            <a href="#como-funciona" className="py-2 text-sm font-medium text-foreground/80" onClick={() => setIsOpen(false)}>¿Cómo funciona?</a>
            <div className="flex gap-3 pt-2">
              <Button variant="outline-hero" size="sm" asChild className="flex-1">
                <Link to="/login">Iniciar Sesión</Link>
              </Button>
              <Button variant="hero" size="sm" asChild className="flex-1">
                <Link to="/registro">Registrarse</Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
