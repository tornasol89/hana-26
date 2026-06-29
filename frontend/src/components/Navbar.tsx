import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LogOut, Menu, ShieldAlert, User, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { useLogout } from "@/features/auth/hooks";
import { NotificacionesBell } from "@/components/NotificacionesBell";

const LINKS_PUBLICOS = [
  { to: "/", label: "Inicio" },
  { to: "/buscar", label: "Buscar Servicios" },
  { to: "/alianza", label: "Alianza" },
  { to: "/impacto", label: "Impacto" },
  { to: "/compromiso", label: "Compromiso" },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const logout = useLogout();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function isActive(path: string) {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  }

  function handleLogout() {
    logout();
    setIsOpen(false);
    navigate("/");
  }

  const iniciales = user
    ? `${user.nombre?.[0] ?? ""}${user.apellido?.[0] ?? ""}`.toUpperCase()
    : "";
  const nombreCompleto = user ? `${user.nombre} ${user.apellido ?? ""}`.trim() : "";
  const esAdmin = user?.tipo === "admin";

  return (
    <motion.nav
      className="fixed top-0 left-0 right-0 z-50 border-b transition-colors duration-300"
      animate={{
        backgroundColor: scrolled ? "hsl(var(--background) / 0.97)" : "hsl(var(--background) / 0.82)",
        borderColor: scrolled ? "hsl(var(--border))" : "hsl(var(--border) / 0.4)",
        boxShadow: scrolled ? "0 4px 24px rgba(0,0,0,0.06)" : "none",
      }}
      style={{ backdropFilter: "blur(14px)" }}
    >
      <div className="container mx-auto px-4 flex items-center justify-between h-20">

        {/* Logo */}
        <Link to="/" className="flex items-center shrink-0">
          <div className="flex flex-col leading-tight">
            <span className="text-lg font-bold font-display text-primary tracking-tight">Hana</span>
            <span className="hidden sm:block text-[10px] text-muted-foreground tracking-wide whitespace-nowrap">Hecho por mujeres, para mujeres</span>
          </div>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6">
          {LINKS_PUBLICOS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="relative text-sm font-medium transition-colors group py-1"
            >
              <span className={isActive(link.to) ? "text-primary" : "text-foreground/75 group-hover:text-foreground transition-colors duration-200"}>
                {link.label}
              </span>
              {/* underline animada */}
              <span
                className={`absolute -bottom-0.5 left-0 h-0.5 rounded-full bg-primary transition-all duration-300 ${
                  isActive(link.to) ? "w-full" : "w-0 group-hover:w-full"
                }`}
              />
            </Link>
          ))}
        </div>

        {/* Desktop auth */}
        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated && user ? (
            <>
              {!esAdmin && <NotificacionesBell />}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 rounded-full hover:bg-accent/50 px-2 py-1 transition-colors">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.foto ?? undefined} alt={nombreCompleto} />
                      <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                        {iniciales || "?"}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium text-foreground pr-1">{user.nombre}</span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col gap-0.5">
                      <p className="text-sm font-medium truncate">{nombreCompleto}</p>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/mi-perfil" className="cursor-pointer">
                      <User className="h-4 w-4 mr-2" />Mi perfil
                    </Link>
                  </DropdownMenuItem>
                  {esAdmin && (
                    <DropdownMenuItem asChild>
                      <Link to="/perfil/admin" className="cursor-pointer">
                        <ShieldAlert className="h-4 w-4 mr-2" />Panel Admin
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive focus:text-destructive">
                    <LogOut className="h-4 w-4 mr-2" />Cerrar sesión
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" asChild className="border-primary/40 text-primary hover:bg-primary/8 hover:border-primary transition-colors duration-200">
                <Link to="/login">Iniciar Sesión</Link>
              </Button>
              <Button variant="hero" size="sm" asChild>
                <Link to="/registro">Registrarse</Link>
              </Button>
            </div>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden p-2 rounded-lg text-foreground hover:bg-accent/50 transition-colors"
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? "Cerrar menú" : "Abrir menú"}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={isOpen ? "close" : "open"}
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.18 }}
            >
              {isOpen ? <X size={22} /> : <Menu size={22} />}
            </motion.div>
          </AnimatePresence>
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="md:hidden bg-background/98 border-t border-border overflow-hidden"
          >
            <div className="container mx-auto px-4 py-4 flex flex-col gap-1">
              {/* Usuario logueada */}
              {isAuthenticated && user && (
                <div className="flex items-center gap-3 py-3 border-b border-border mb-2">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.foto ?? undefined} alt={nombreCompleto} />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {iniciales || "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{nombreCompleto}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                  {!esAdmin && <NotificacionesBell />}
                </div>
              )}

              {/* Links */}
              {LINKS_PUBLICOS.map((link, i) => (
                <motion.div
                  key={link.to}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.22 }}
                >
                  <Link
                    to={link.to}
                    onClick={() => setIsOpen(false)}
                    className={`block py-2.5 px-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive(link.to)
                        ? "text-primary bg-primary/8"
                        : "text-foreground/80 hover:text-foreground hover:bg-accent/50"
                    }`}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}

              {/* Acciones */}
              {isAuthenticated && user ? (
                <div className="pt-2 mt-1 border-t border-border flex flex-col gap-1">
                  <Link
                    to="/mi-perfil"
                    onClick={() => setIsOpen(false)}
                    className="py-2.5 px-2 text-sm font-medium flex items-center gap-2 rounded-lg hover:bg-accent/50 transition-colors text-foreground/80 hover:text-foreground"
                  >
                    <User className="h-4 w-4" />Mi perfil
                  </Link>
                  {esAdmin && (
                    <Link
                      to="/perfil/admin"
                      onClick={() => setIsOpen(false)}
                      className="py-2.5 px-2 text-sm font-medium flex items-center gap-2 rounded-lg hover:bg-accent/50 transition-colors text-foreground/80 hover:text-foreground"
                    >
                      <ShieldAlert className="h-4 w-4" />Panel Admin
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="py-2.5 px-2 text-sm font-medium text-destructive flex items-center gap-2 rounded-lg hover:bg-destructive/10 transition-colors text-left"
                  >
                    <LogOut className="h-4 w-4" />Cerrar sesión
                  </button>
                </div>
              ) : (
                <div className="flex gap-2 pt-3 mt-2 border-t border-border">
                  <Button variant="outline" size="sm" asChild className="flex-1">
                    <Link to="/login" onClick={() => setIsOpen(false)}>Iniciar Sesión</Link>
                  </Button>
                  <Button variant="default" size="sm" asChild className="flex-1">
                    <Link to="/registro" onClick={() => setIsOpen(false)}>Registrarse</Link>
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;
