import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Navbar from "@/components/Navbar";
import hanaLogo from "@/assets/hana-logo.png";
import { useAuth } from "@/contexts/AuthContext";
import { getErrorMessage } from "@/features/auth/utils";
import { REGIONES_CHILE } from "@/config/constants";
import type { UserType } from "@/features/auth/types";

const Registro = () => {
  const [tipo, setTipo] = useState<UserType>("clienta");
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rut, setRut] = useState("");
  const [region, setRegion] = useState("");
  const [comuna, setComuna] = useState("");
  const [aceptoCompromiso, setAceptoCompromiso] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nombre.trim() || !apellido.trim()) {
      toast.error("Completa tu nombre y apellido");
      return;
    }
    if (password.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres");
      return;
    }
    if (!region || !comuna.trim()) {
      toast.error("Selecciona tu región y comuna");
      return;
    }
    if (!aceptoCompromiso) {
      toast.error("Debes aceptar el Compromiso Hana para continuar");
      return;
    }

    setIsSubmitting(true);
    try {
      const usuario = await register({
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        email: email.trim().toLowerCase(),
        password,
        tipo,
        rut: rut.trim(),
        region,
        comuna: comuna.trim(),
        aceptoCompromiso: true,
      });

      toast.success(`¡Bienvenida a Hana, ${usuario.nombre}!`);

      // Todos los nuevos usuarios van a su perfil para completar datos
      // (verificación de identidad, perfil profesional si es trabajadora, etc.)
      if (usuario.tipo === "admin") {
        navigate("/admin", { replace: true });
      } else {
        navigate("/mi-perfil", { replace: true });
      }
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-warm">
      <Navbar />
      <div className="flex items-center justify-center min-h-screen pt-20 pb-8 px-4">
        <div className="w-full max-w-md bg-card rounded-2xl shadow-soft p-8 animate-scale-in">
          <div className="text-center mb-8">
            <img src={hanaLogo} alt="Hana" className="h-12 mx-auto mb-4" />
            <h1 className="text-2xl font-bold font-display text-card-foreground">
              Crea tu cuenta
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Únete a la comunidad Hana
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-6">
            <button
              type="button"
              onClick={() => setTipo("clienta")}
              disabled={isSubmitting}
              className={`p-4 rounded-xl border-2 text-center transition-all ${
                tipo === "clienta"
                  ? "border-primary bg-purple-light"
                  : "border-border hover:border-primary/30"
              }`}
            >
              <p className="font-semibold text-sm text-card-foreground">Soy Clienta</p>
              <p className="text-xs text-muted-foreground mt-1">Busco servicios</p>
            </button>
            <button
              type="button"
              onClick={() => setTipo("trabajadora")}
              disabled={isSubmitting}
              className={`p-4 rounded-xl border-2 text-center transition-all ${
                tipo === "trabajadora"
                  ? "border-primary bg-purple-light"
                  : "border-border hover:border-primary/30"
              }`}
            >
              <p className="font-semibold text-sm text-card-foreground">Soy Trabajadora</p>
              <p className="text-xs text-muted-foreground mt-1">Ofrezco servicios</p>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre</Label>
                <Input
                  id="nombre"
                  placeholder="Tu nombre"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  disabled={isSubmitting}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="apellido">Apellido</Label>
                <Input
                  id="apellido"
                  placeholder="Tu apellido"
                  value={apellido}
                  onChange={(e) => setApellido(e.target.value)}
                  disabled={isSubmitting}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="rut">RUT</Label>
              <Input
                id="rut"
                placeholder="12.345.678-9"
                value={rut}
                onChange={(e) => setRut(e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="region">Región</Label>
              <Select
                value={region}
                onValueChange={setRegion}
                disabled={isSubmitting}
              >
                <SelectTrigger id="region">
                  <SelectValue placeholder="Selecciona tu región" />
                </SelectTrigger>
                <SelectContent>
                  {REGIONES_CHILE.map((r) => (
                    <SelectItem key={r} value={r}>
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="comuna">Comuna</Label>
              <Input
                id="comuna"
                placeholder="Tu comuna"
                value={comuna}
                onChange={(e) => setComuna(e.target.value)}
                disabled={isSubmitting}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isSubmitting}
                minLength={6}
                required
              />
            </div>

            <div className="flex items-start gap-2 pt-2">
              <Checkbox
                id="compromiso"
                checked={aceptoCompromiso}
                onCheckedChange={(checked) => setAceptoCompromiso(checked === true)}
                disabled={isSubmitting}
              />
              <Label
                htmlFor="compromiso"
                className="text-sm font-normal text-muted-foreground leading-relaxed cursor-pointer"
              >
                Acepto el{" "}
                <Link
                  to="/compromiso"
                  target="_blank"
                  className="text-primary font-medium hover:underline"
                >
                  Compromiso Hana
                </Link>{" "}
                y las normas de la comunidad
              </Label>
            </div>

            <Button
              variant="hero"
              className="w-full"
              size="lg"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creando cuenta...
                </>
              ) : (
                `Crear Cuenta como ${tipo === "clienta" ? "Clienta" : "Trabajadora"}`
              )}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            ¿Ya tienes cuenta?{" "}
            <Link to="/login" className="text-primary font-medium hover:underline">
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Registro;