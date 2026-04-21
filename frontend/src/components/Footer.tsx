import { Link } from "react-router-dom";
import hanaLogo from "@/assets/hana-logo.png";

const Footer = () => {
  return (
    <footer className="bg-foreground py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <img src={hanaLogo} alt="Hana" className="h-8 brightness-200 mb-4" />
            <p className="text-sm text-primary-foreground/60">
              Hecho por mujeres, para mujeres. Conectando profesionales de confianza en Chile.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-primary-foreground mb-3 text-sm">Plataforma</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/60">
              <li><Link to="/buscar" className="hover:text-primary-foreground transition-colors">Buscar Servicios</Link></li>
              <li><Link to="/registro" className="hover:text-primary-foreground transition-colors">Registrarse</Link></li>
              <li><a href="#como-funciona" className="hover:text-primary-foreground transition-colors">¿Cómo funciona?</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-primary-foreground mb-3 text-sm">Para Trabajadoras</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/60">
              <li><Link to="/registro" className="hover:text-primary-foreground transition-colors">Ofrecer Servicios</Link></li>
              <li><a href="#" className="hover:text-primary-foreground transition-colors">Verificación</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-primary-foreground mb-3 text-sm">Legal</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/60">
              <li><a href="#" className="hover:text-primary-foreground transition-colors">Términos de Uso</a></li>
              <li><a href="#" className="hover:text-primary-foreground transition-colors">Privacidad</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-primary-foreground/10 mt-8 pt-8 text-center text-xs text-primary-foreground/40">
          © 2026 Hana. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
