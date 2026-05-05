import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LogOut, Menu, ShieldAlert, User, X } from "lucide-react";
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
import hanaLogo from "@/assets/hana-logo.png";

// Links públicos visibles para todos
const LINKS_PUBLICOS = [
  { to: "/", label: "Inicio" },
  { to: "/buscar", label: "Buscar Servicios" },
  { to: "/alianza", label: "Alianza" },
  { to: "/impacto", label: "Impacto" },
  { to: "/compromiso", label: "Compromiso" },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const logout = useLogout();
  const location = useLocation();
  const navigate = useNavigate();

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
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
      <div className="container mx-auto px-4 flex items-center justify-between h-16">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <img src={hanaLogo} alt="Hana" className="h-10" />
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-8">
          {LINKS_PUBLICOS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`text-sm font-medium transition-colors ${
                isActive(link.to)
                  ? "text-primary"
                  : "text-foreground/80 hover:text-foreground"
              }`}
            >
              {link.label}
            </Link>
          ))}

          {isAuthenticated && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-full hover:bg-accent/50 px-1 py-1 transition-colors">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.foto ?? undefined} alt={nombreCompleto} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                      {iniciales || "?"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium text-foreground pr-2">
                    {user.nombre}
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col gap-0.5">
                    <p className="text-sm font-medium truncate">{nombreCompleto}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/mi-perfil" className="cursor-pointer">
                    <User className="h-4 w-4 mr-2" />
                    Mi perfil
                  </Link>
                </DropdownMenuItem>
                {esAdmin && (
                  <DropdownMenuItem asChild>
                    <Link to="/perfil/admin" className="cursor-pointer">
                      <ShieldAlert className="h-4 w-4 mr-2" />
                      Panel Admin
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="cursor-pointer text-destructive focus:text-destructive"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Cerrar sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-3">
              <Button variant="outline-hero" size="sm" asChild>
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
          className="md:hidden text-foreground"
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? "Cerrar menú" : "Abrir menú"}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-background border-b border-border px-4 pb-4 animate-fade-in">
          <div className="flex flex-col gap-1">
            {/* Usuario logueada — cabecera */}
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
                  <p className="text-xs text-muted-foreground truncate">
                    {user.email}
                  </p>
                </div>
              </div>
            )}

            {/* Links públicos */}
            {LINKS_PUBLICOS.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setIsOpen(false)}
                className={`py-2.5 text-sm font-medium transition-colors ${
                  isActive(link.to)
                    ? "text-primary"
                    : "text-foreground/80 hover:text-foreground"
                }`}
              >
                {link.label}
              </Link>
            ))}

            {/* Acciones según sesión */}
            {isAuthenticated && user ? (
              <>
                <Link
                  to="/mi-perfil"
                  onClick={() => setIsOpen(false)}
                  className={`py-2.5 text-sm font-medium flex items-center gap-2 transition-colors ${
                    isActive("/mi-perfil")
                      ? "text-primary"
                      : "text-foreground/80 hover:text-foreground"
                  }`}
                >
                  <User className="h-4 w-4" />
                  Mi perfil
                </Link>
                {esAdmin && (
                  <Link
                    to="/perfil/admin"
                    onClick={() => setIsOpen(false)}
                    className={`py-2.5 text-sm font-medium flex items-center gap-2 transition-colors ${
                      isActive("/perfil/admin")
                        ? "text-primary"
                        : "text-foreground/80 hover:text-foreground"
                    }`}
                  >
                    <ShieldAlert className="h-4 w-4" />
                    Panel Admin
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="py-2.5 text-sm font-medium text-destructive flex items-center gap-2 text-left"
                >
                  <LogOut className="h-4 w-4" />
                  Cerrar sesión
                </button>
              </>
            ) : (
              <div className="flex gap-3 pt-3 mt-2 border-t border-border">
                <Button variant="outline-hero" size="sm" asChild className="flex-1">
                  <Link to="/login" onClick={() => setIsOpen(false)}>
                    Iniciar Sesión
                  </Link>
                </Button>
                <Button variant="hero" size="sm" asChild className="flex-1">
                  <Link to="/registro" onClick={() => setIsOpen(false)}>
                    Registrarse
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;