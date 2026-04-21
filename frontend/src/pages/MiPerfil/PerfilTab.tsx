import { useState } from "react";
import { Link } from "react-router-dom";
import { Calendar, Loader2 } from "lucide-react";
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
import { useUpdateProfile, useLogout } from "@/features/profile/hooks";
import type { Usuario } from "@/types/auth";
import type { Booking } from "@/features/bookings/types";

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

export function PerfilTab({ user, reservas }: Props) {
  const [editando, setEditando] = useState(false);
  const [form, setForm] = useState({
    nombre: user.nombre,
    apellido: user.apellido,
    region: user.region,
    comuna: user.comuna,
  });

  const updateProfile = useUpdateProfile();
  const logout = useLogout();

  const esTrabajadora = user.tipo === "trabajadora";
  const confianza = calcularConfianza(reservas);

  function handleGuardar() {
    if (!form.nombre.trim() || !form.apellido.trim()) return;
    updateProfile.mutate(form, {
      onSuccess: () => setEditando(false),
    });
  }

  function handleCancelar() {
    setForm({
      nombre: user.nombre,
      apellido: user.apellido,
      region: user.region,
      comuna: user.comuna,
    });
    setEditando(false);
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-base">Datos personales</CardTitle>
          {!editando && (
            <Button variant="outline" size="sm" onClick={() => setEditando(true)}>
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
                    onChange={(e) => setForm((p) => ({ ...p, nombre: e.target.value }))}
                    disabled={updateProfile.isPending}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="apellido">Apellido</Label>
                  <Input
                    id="apellido"
                    value={form.apellido}
                    onChange={(e) => setForm((p) => ({ ...p, apellido: e.target.value }))}
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
                    onChange={(e) => setForm((p) => ({ ...p, comuna: e.target.value }))}
                    disabled={updateProfile.isPending}
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
                { label: "Nombre completo", valor: `${user.nombre} ${user.apellido}` },
                { label: "Email", valor: user.email },
                { label: "Región", valor: user.region || "—" },
                { label: "Comuna", valor: user.comuna || "—" },
                { label: "Tipo de cuenta", valor: esTrabajadora ? "Trabajadora" : "Clienta" },
                {
                  label: "Compromiso Hana",
                  valor: user.aceptoCompromiso ? "✓ Aceptado" : "Pendiente",
                },
              ].map((row) => (
                <div
                  key={row.label}
                  className="flex justify-between items-center py-2.5 border-b border-border last:border-0"
                >
                  <span className="text-sm text-muted-foreground">{row.label}</span>
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
            Aumenta completando servicios, verificando tu identidad y recibiendo buenas evaluaciones.
          </p>

          <Separator className="my-4" />

          <div className="grid grid-cols-3 gap-3">
            {[
              { n: reservas.length, l: "Reservas" },
              { n: reservas.filter((r) => r.estado === "completada").length, l: "Completadas" },
              { n: reservas.filter((r) => r.estado === "pendiente").length, l: "Pendientes" },
            ].map((stat) => (
              <div key={stat.l} className="bg-muted/50 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold font-display text-primary">{stat.n}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{stat.l}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

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