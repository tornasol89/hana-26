import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Calendar, Clock, Loader2, Save } from "lucide-react";
import { Navigate } from "react-router-dom";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { useDisponibilidad, useUpdateDisponibilidad } from "@/features/workers/hooks";
import type { HorarioDia } from "@/features/workers/types";

const DIAS = [
  { dia: 1, label: "Lunes" },
  { dia: 2, label: "Martes" },
  { dia: 3, label: "Miércoles" },
  { dia: 4, label: "Jueves" },
  { dia: 5, label: "Viernes" },
  { dia: 6, label: "Sábado" },
  { dia: 0, label: "Domingo" },
];

const DEFAULT_HORARIO: HorarioDia[] = DIAS.map(({ dia }) => ({
  dia,
  activo: dia >= 1 && dia <= 5,
  inicio: "09:00",
  fin: "18:00",
}));

export default function MiCalendario() {
  const { user } = useAuth();
  const { data: horarioGuardado, isLoading } = useDisponibilidad();
  const update = useUpdateDisponibilidad();

  const [horario, setHorario] = useState<HorarioDia[]>(DEFAULT_HORARIO);

  useEffect(() => {
    if (horarioGuardado && horarioGuardado.length === 7) {
      // Ordenar por el mismo orden de DIAS para consistencia visual
      const ordenado = DIAS.map(({ dia }) => {
        const encontrado = horarioGuardado.find((h) => h.dia === dia);
        return encontrado ?? { dia, activo: false, inicio: "09:00", fin: "18:00" };
      });
      setHorario(ordenado);
    }
  }, [horarioGuardado]);

  if (!user) return <Navigate to="/login" replace />;
  if (user.tipo !== "trabajadora" && !user.rolesAdicionales?.includes("trabajadora")) {
    return <Navigate to="/mi-perfil" replace />;
  }

  function toggleDia(dia: number) {
    setHorario((prev) =>
      prev.map((h) => (h.dia === dia ? { ...h, activo: !h.activo } : h))
    );
  }

  function setHora(dia: number, campo: "inicio" | "fin", valor: string) {
    setHorario((prev) =>
      prev.map((h) => (h.dia === dia ? { ...h, [campo]: valor } : h))
    );
  }

  function guardar() {
    // Reordenar a 0-6 antes de guardar
    const paraGuardar = [...horario].sort((a, b) => a.dia - b.dia);
    update.mutate(paraGuardar);
  }

  const diasActivos = horario.filter((h) => h.activo).length;

  return (
    <div className="min-h-screen bg-gradient-warm">
      <Navbar />

      <div className="pt-20 pb-12 container mx-auto px-4 max-w-2xl">
        {/* Header */}
        <div className="mb-6 flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/mi-perfil">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold font-display text-foreground flex items-center gap-2">
              <Calendar className="h-6 w-6 text-primary" />
              Mi disponibilidad
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Configura los días y horarios en que ofreces tus servicios
            </p>
          </div>
        </div>

        {/* Resumen */}
        <Card className="mb-4 border-primary/20 bg-primary/5">
          <CardContent className="py-3 px-4">
            <p className="text-sm text-primary font-medium">
              {diasActivos === 0
                ? "No tienes días disponibles configurados"
                : `Disponible ${diasActivos} día${diasActivos !== 1 ? "s" : ""} a la semana`}
            </p>
          </CardContent>
        </Card>

        {/* Días */}
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                Horario semanal
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 pb-4">
              {horario.map(({ dia, activo, inicio, fin }, i) => {
                const label = DIAS.find((d) => d.dia === dia)?.label ?? "";
                return (
                  <motion.div
                    key={dia}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className={`flex flex-col sm:flex-row sm:items-center gap-3 p-3 rounded-xl transition-colors ${
                      activo ? "bg-primary/5 border border-primary/15" : "bg-muted/30"
                    }`}
                  >
                    {/* Toggle + nombre */}
                    <div className="flex items-center gap-3 min-w-[130px]">
                      <Switch
                        id={`dia-${dia}`}
                        checked={activo}
                        onCheckedChange={() => toggleDia(dia)}
                      />
                      <Label
                        htmlFor={`dia-${dia}`}
                        className={`text-sm font-semibold cursor-pointer ${
                          activo ? "text-foreground" : "text-muted-foreground"
                        }`}
                      >
                        {label}
                      </Label>
                    </div>

                    {/* Horario */}
                    {activo ? (
                      <div className="flex items-center gap-2 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs text-muted-foreground whitespace-nowrap">Desde</span>
                          <input
                            type="time"
                            value={inicio}
                            onChange={(e) => setHora(dia, "inicio", e.target.value)}
                            className="h-8 rounded-lg border border-input bg-background px-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                          />
                        </div>
                        <span className="text-muted-foreground">–</span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs text-muted-foreground whitespace-nowrap">Hasta</span>
                          <input
                            type="time"
                            value={fin}
                            onChange={(e) => setHora(dia, "fin", e.target.value)}
                            className="h-8 rounded-lg border border-input bg-background px-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                          />
                        </div>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground italic">No disponible</span>
                    )}
                  </motion.div>
                );
              })}
            </CardContent>
          </Card>
        )}

        {/* Guardar */}
        <div className="mt-6 flex justify-end">
          <Button
            variant="hero"
            className="gap-2 px-8"
            onClick={guardar}
            disabled={update.isPending}
          >
            {update.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Guardar disponibilidad
          </Button>
        </div>
      </div>

      <Footer />
    </div>
  );
}
