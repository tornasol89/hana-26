import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { Heart, Instagram, Linkedin, Mail } from "lucide-react";
import hanaLogo from "@/assets/hana-logo.png";

const LINKS = {
  plataforma: [
    { label: "Buscar Servicios", to: "/buscar" },
    { label: "¿Cómo funciona?", to: "/#como-funciona" },
    { label: "Registrarse", to: "/registro" },
  ],
  trabajadoras: [
    { label: "Ofrecer Servicios", to: "/registro" },
    { label: "Verificación", to: "/registro" },
    { label: "Mi Perfil", to: "/mi-perfil" },
  ],
  empresa: [
    { label: "Alianza", to: "/alianza" },
    { label: "Impacto", to: "/impacto" },
    { label: "Compromiso", to: "/compromiso" },
  ],
  soporte: [
    { label: "Contáctenos", to: "/contacto" },
    { label: "Sugerencias", to: "/sugerencias" },
    { label: "Reclamos", to: "/sugerencias" },
  ],
  legal: [
    { label: "Términos de Uso", to: "#" },
    { label: "Privacidad", to: "#" },
  ],
};

const SOCIAL = [
  { icon: Instagram, label: "Instagram", href: "#" },
  { icon: Linkedin, label: "LinkedIn", href: "#" },
  { icon: Mail, label: "Contacto", href: "/contacto" },
];

function FooterCol({ title, links }: { title: string; links: { label: string; to: string }[] }) {
  return (
    <div>
      <h4 className="text-xs font-bold text-white/50 uppercase tracking-[0.18em] mb-4">{title}</h4>
      <ul className="space-y-2.5">
        {links.map((l) => (
          <li key={l.label}>
            <Link
              to={l.to}
              className="text-sm text-white/60 hover:text-white transition-colors duration-200 relative group inline-flex items-center gap-1.5"
            >
              <span className="absolute -left-3 opacity-0 group-hover:opacity-100 text-primary transition-all duration-200 group-hover:-left-2">›</span>
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

const Footer = () => {
  return (
    <footer className="relative bg-[#0f0a1a] overflow-hidden">
      {/* Glow decorativo */}
      <div className="absolute top-0 left-1/4 w-96 h-64 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-64 h-48 rounded-full bg-accent/8 blur-3xl pointer-events-none" />

      {/* Separador superior con gradiente */}
      <div className="h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

      <div className="container mx-auto px-4 pt-14 pb-8 relative z-10">

        {/* Fila principal */}
        <div className="grid md:grid-cols-5 gap-10 mb-12">

          {/* Marca */}
          <div className="md:col-span-1">
            <motion.img
              src={hanaLogo}
              alt="Hana"
              className="h-10 brightness-[2] saturate-50 mb-4"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            />
            <p className="text-sm text-white/50 leading-relaxed mb-5">
              Hecho por mujeres, para mujeres. Conectando profesionales verificadas en Chile.
            </p>
            {/* Social */}
            <div className="flex gap-2">
              {SOCIAL.map((s) => (
                <motion.a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  className="w-8 h-8 rounded-lg bg-white/6 hover:bg-primary/30 border border-white/10 hover:border-primary/40 flex items-center justify-center text-white/50 hover:text-white transition-colors duration-200"
                  whileHover={{ y: -2, scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <s.icon className="h-4 w-4" />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Links */}
          <div className="md:col-span-4 grid grid-cols-2 sm:grid-cols-5 gap-8">
            <FooterCol title="Plataforma" links={LINKS.plataforma} />
            <FooterCol title="Trabajadoras" links={LINKS.trabajadoras} />
            <FooterCol title="Empresa" links={LINKS.empresa} />
            <FooterCol title="Soporte" links={LINKS.soporte} />
            <FooterCol title="Legal" links={LINKS.legal} />
          </div>
        </div>

        {/* Franja CTA */}
        <motion.div
          className="rounded-2xl bg-gradient-to-r from-primary/20 via-primary/10 to-accent/10 border border-primary/20 px-6 py-5 mb-10 flex flex-col sm:flex-row items-center justify-between gap-4"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div>
            <p className="text-sm font-semibold text-white">¿Lista para empezar?</p>
            <p className="text-xs text-white/50 mt-0.5">Únete a más de 500 profesionales verificadas en Chile</p>
          </div>
          <Link
            to="/registro"
            className="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold transition-colors duration-200 shadow-[0_4px_16px_rgba(124,58,237,0.35)]"
          >
            Crear cuenta gratis
          </Link>
        </motion.div>

        {/* Barra inferior */}
        <div className="border-t border-white/8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/30">
          <span>© 2026 Hana. Todos los derechos reservados.</span>
          <span className="flex items-center gap-1">
            Hecho con <Heart className="h-3 w-3 text-primary/60 mx-0.5" /> en Chile
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
