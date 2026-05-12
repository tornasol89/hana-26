import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { Calendar, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { CertificadosSection } from "@/features/workers/components/CertificadosSection";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { REGIONES_CHILE } from "@/config/constants";
import { useUpdateProfile, useLogout } from "@/features/auth/hooks";
import type { Usuario } from "@/features/auth/types";
import type { Booking } from "@/features/bookings/types";
import { FechaNacimientoBanner } from "@/components/FechaNacimientoBanner";
import {
  capitalizarNombre,
  validarFechaNacimiento,
  fechaAInputDate,
  calcularEdad,
} from "@/lib/validators";

interface Props {
  user: Usuario;
  reservas: Booking[];
}

function calcularConfianza(reservas: Booking[]) {
  if (!reservas.length) return { nivel: "Nueva usuaria", pct: 8 };
  const completadas = reservas.filter((r) => r.estado === "completada").length;
  const base = (completadas / reservas.length) * 75;
  const bonus = reservas.length > 1 ? 15 : 5;
  const pct = Math.min(Math.round(base + bonus), 100);

  if (pct >= 80) return { nivel: "Muy confiable", pct };
  if (pct >= 50) return { nivel: "Confiable", pct };
  return { nivel: "En construcción", pct };
}

/**
 * Fecha máxima permitida en el input: exactamente 18 años atrás desde hoy.
 */
function getFechaMaxima(): string {
  const hoy = new Date();
  const max = new Date(hoy.getFullYear() - 18, hoy.getMonth(), hoy.getDate());
  return max.toISOString().split("T")[0];
}

function getFechaMinima(): string {
  const hoy = new Date();
  const min = new Date(hoy.getFullYear() - 120, hoy.getMonth(), hoy.getDate());
  return min.toISOString().split("T")[0];
}

export function PerfilTab({ user, reservas }: Props) {
  const [editando, setEditando] = useState(false);
  const [form, setForm] = useState({
    nombre: user.nombre,
    apellido: user.apellido,
    region: user.region,
    comuna: user.comuna,
    fechaNacimiento: fechaAInputDate(user.fechaNacimiento),
  });

  // Ref al input de fecha para hacer scroll/focus cuando se clickea el banner
  const fechaInputRef = useRef<HTMLInputElement>(null);

  const updateProfile = useUpdateProfile();
  const logout = useLogout();

  const esTrabajadora = user.tipo === "trabajadora";
  const confianza = calcularConfianza(reservas);

  // ¿Debe mostrar el banner de "completá tu fecha"?
  const necesitaCorregirFecha = user.fechaNacimientoCorregida === false;

  // Edad calculada (preferimos backend, fallback a frontend)
  const edad =
    user.edad ??
    (user.fechaNacimiento ? calcularEdad(user.fechaNacimiento) : null);

  function handleCorregirFechaClick() {
    // Activar modo edición y hacer scroll al campo
    setEditando(true);
    // Esperar un tick para que el input se monte y entonces hacer scroll/focus
    setTimeout(() => {
      fechaInputRef.current?.focus();
      fechaInputRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }, 50);
  }

  function handleGuardar() {
    if (!form.nombre.trim() || !form.apellido.trim()) {
      toast.error("Nombre y apellido son obligatorios");
      return;
    }

    // Validar fecha de nacimiento si la usuaria la cambió
    const fechaCambio = form.fechaNacimiento !== fechaAInputDate(user.fechaNacimiento);
    if (fechaCambio) {
      const resFecha = validarFechaNacimiento(form.fechaNacimiento);
      if (!resFecha.valida) {
        toast.error(resFecha.mensaje ?? "Fecha de nacimiento inválida");
        return;
      }
    }

    // Construir payload: solo enviar fechaNacimiento si cambió
    const payload: {
      nombre: string;
      apellido: string;
      region: string;
      comuna: string;
      fechaNacimiento?: string;
    } = {
      nombre: capitalizarNombre(form.nombre.trim()),
      apellido: capitalizarNombre(form.apellido.trim()),
      region: form.region,
      comuna: form.comuna.trim(),
    };

    if (fechaCambio) {
      payload.fechaNacimiento = form.fechaNacimiento;
    }

    updateProfile.mutate(payload, {
      onSuccess: () => setEditando(false),
    });
  }

  function handleCancelar() {
    setForm({
      nombre: user.nombre,
      apellido: user.apellido,
      region: user.region,
      comuna: user.comuna,
      fechaNacimiento: fechaAInputDate(user.fechaNacimiento),
    });
    setEditando(false);
  }

  return (
    <div className="space-y-6">
      {/* Banner si tiene fecha ficticia */}
      {necesitaCorregirFecha && !editando && (
        <FechaNacimientoBanner onCorregir={handleCorregirFechaClick} />
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-base">Datos personales</CardTitle>
          {!editando && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditando(true)}
            >
              Editar
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {editando ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre</Label>
                  <Input
                    id="nombre"
                    value={form.nombre}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, nombre: e.target.value }))
                    }
                    onBlur={() =>
                      setForm((p) => ({ ...p, nombre: capitalizarNombre(p.nombre) }))
                    }
                    disabled={updateProfile.isPending}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="apellido">Apellido</Label>
                  <Input
                    id="apellido"
                    value={form.apellido}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, apellido: e.target.value }))
                    }
                    onBlur={() =>
                      setForm((p) => ({
                        ...p,
                        apellido: capitalizarNombre(p.apellido),
                      }))
                    }
                    disabled={updateProfile.isPending}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="region">Región</Label>
                  <Select
                    value={form.region}
                    onValueChange={(v) => setForm((p) => ({ ...p, region: v }))}
                    disabled={updateProfile.isPending}
                  >
                    <SelectTrigger id="region">
                      <SelectValue placeholder="Selecciona región" />
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
                    value={form.comuna}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, comuna: e.target.value }))
                    }
                    disabled={updateProfile.isPending}
                  />
                </div>

                {/* Fecha de nacimiento (ocupa ambas columnas en mobile, una en desktop) */}
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="fechaNacimiento">
                    Fecha de nacimiento
                    {necesitaCorregirFecha && (
                      <span className="text-amber-600 text-xs ml-2">
                        (corrigela con tu fecha real)
                      </span>
                    )}
                  </Label>
                  <Input
                    id="fechaNacimiento"
                    ref={fechaInputRef}
                    type="date"
                    value={form.fechaNacimiento}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        fechaNacimiento: e.target.value,
                      }))
                    }
                    disabled={updateProfile.isPending}
                    min={getFechaMinima()}
                    max={getFechaMaxima()}
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  onClick={handleGuardar}
                  disabled={updateProfile.isPending}
                  variant="hero"
                >
                  {updateProfile.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    "Guardar cambios"
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleCancelar}
                  disabled={updateProfile.isPending}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-1">
              {[
                {
                  label: "Nombre completo",
                  valor: `${user.nombre} ${user.apellido}`,
                },
                { label: "Email", valor: user.email },
                { label: "RUT", valor: user.rut || "—" },
                {
                  label: "Fecha de nacimiento",
                  valor: user.fechaNacimiento
                    ? new Date(user.fechaNacimiento).toLocaleDateString("es-CL")
                    : "—",
                },
                {
                  label: "Edad",
                  valor: edad !== null ? `${edad} años` : "—",
                },
                { label: "Región", valor: user.region || "—" },
                { label: "Comuna", valor: user.comuna || "—" },
                {
                  label: "Tipo de cuenta",
                  valor: esTrabajadora ? "Trabajadora" : "Clienta",
                },
                {
                  label: "Compromiso Hana",
                  valor: user.aceptoCompromiso ? "✓ Aceptado" : "Pendiente",
                },
              ].map((row) => (
                <div
                  key={row.label}
                  className="flex justify-between items-center py-2.5 border-b border-border last:border-0"
                >
                  <span className="text-sm text-muted-foreground">
                    {row.label}
                  </span>
                  <span className="text-sm font-medium text-card-foreground text-right">
                    {row.valor}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Índice de confianza Hana</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end justify-between mb-3">
            <span className="text-sm text-muted-foreground">{confianza.nivel}</span>
            <span className="text-3xl font-bold font-display text-primary">
              {confianza.pct}%
            </span>
          </div>
          <Progress value={confianza.pct} className="h-2" />
          <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
            Aumenta completando servicios, verificando tu identidad y recibiendo
            buenas evaluaciones.
          </p>

          <Separator className="my-4" />

          <div className="grid grid-cols-3 gap-3">
            {[
              { n: reservas.length, l: "Reservas" },
              {
                n: reservas.filter((r) => r.estado === "completada").length,
                l: "Completadas",
              },
              {
                n: reservas.filter((r) => r.estado === "pendiente").length,
                l: "Pendientes",
              },
            ].map((stat) => (
              <div
                key={stat.l}
                className="bg-muted/50 rounded-lg p-3 text-center"
              >
                <div className="text-2xl font-bold font-display text-primary">
                  {stat.n}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {stat.l}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {esTrabajadora && <CertificadosSection />}

      {esTrabajadora && (
        <div className="text-center">
          <Button asChild variant="outline">
            <Link to="/mi-calendario">
              <Calendar className="h-4 w-4" />
              Gestionar mi calendario de disponibilidad
            </Link>
          </Button>
        </div>
      )}

      <div className="text-center pt-2">
        <Button variant="ghost" size="sm" onClick={logout}>
          Cerrar sesión
        </Button>
      </div>
    </div>
  );
}