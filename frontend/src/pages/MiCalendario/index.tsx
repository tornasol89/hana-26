import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { ArrowLeft, BanIcon, Calendar, Clock, Loader2, Save } from "lucide-react";
import { motion } from "motion/react";
import { format, parseISO, isBefore, startOfToday } from "date-fns";
import { es } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Calendar as CalendarPicker } from "@/components/ui/calendar";
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

function dateToStr(d: Date): string {
  return format(d, "yyyy-MM-dd");
}

export default function MiCalendario() {
  const { user } = useAuth();
  const { data: guardado, isLoading } = useDisponibilidad();
  const update = useUpdateDisponibilidad();

  const [horario, setHorario] = useState<HorarioDia[]>(DEFAULT_HORARIO);
  const [bloqueados, setBloqueados] = useState<Date[]>([]);

  useEffect(() => {
    if (!guardado) return;

    if (guardado.horarioSemanal?.length === 7) {
      const ordenado = DIAS.map(({ dia }) => {
        const found = guardado.horarioSemanal.find((h) => h.dia === dia);
        return found ?? { dia, activo: false, inicio: "09:00", fin: "18:00" };
      });
      setHorario(ordenado);
    }

    if (guardado.diasBloqueados?.length) {
      const hoy = startOfToday();
      setBloqueados(
        guardado.diasBloqueados
          .map((s) => parseISO(s))
          .filter((d) => !isBefore(d, hoy))
      );
    }
  }, [guardado]);

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

  function quitarBloqueo(fecha: Date) {
    setBloqueados((prev) => prev.filter((d) => dateToStr(d) !== dateToStr(fecha)));
  }

  function guardar() {
    const horarioOrdenado = [...horario].sort((a, b) => a.dia - b.dia);
    update.mutate({
      horarioSemanal: horarioOrdenado,
      diasBloqueados: bloqueados.map(dateToStr),
    });
  }

  const diasActivos = horario.filter((h) => h.activo).length;
  const bloqueadosOrdenados = [...bloqueados].sort((a, b) => a.getTime() - b.getTime());

  return (
    <div className="min-h-screen bg-gradient-warm">
      <Navbar />

      <div className="pt-24 pb-12 container mx-auto px-4 max-w-2xl">
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
              Configura tu horario habitual y bloquea fechas específicas
            </p>
          </div>
        </div>

        {/* Resumen */}
        <Card className="mb-4 border-primary/20 bg-primary/5">
          <CardContent className="py-3 px-4 flex items-center justify-between flex-wrap gap-2">
            <p className="text-sm text-primary font-medium">
              {diasActivos === 0
                ? "Sin días disponibles configurados"
                : `Disponible ${diasActivos} día${diasActivos !== 1 ? "s" : ""} a la semana`}
            </p>
            {bloqueados.length > 0 && (
              <p className="text-sm text-destructive font-medium">
                {bloqueados.length} fecha{bloqueados.length !== 1 ? "s" : ""} bloqueada{bloqueados.length !== 1 ? "s" : ""}
              </p>
            )}
          </CardContent>
        </Card>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-4">
            {/* ── Horario semanal ── */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  Horario semanal recurrente
                </CardTitle>
                <p className="text-xs text-muted-foreground">
                  Aplica todas las semanas automáticamente
                </p>
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

            {/* ── Días bloqueados ── */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <BanIcon className="h-4 w-4 text-destructive" />
                  Fechas bloqueadas
                </CardTitle>
                <p className="text-xs text-muted-foreground">
                  Bloquea días específicos: vacaciones, feriados, compromisos personales
                </p>
              </CardHeader>
              <CardContent className="pb-4">
                <div className="flex justify-center">
                  <CalendarPicker
                    mode="multiple"
                    selected={bloqueados}
                    onSelect={(days) => setBloqueados(days ?? [])}
                    disabled={{ before: startOfToday() }}
                    locale={es}
                    className="rounded-xl border border-border"
                    classNames={{
                      day_selected: "bg-destructive text-white hover:bg-destructive hover:text-white focus:bg-destructive focus:text-white",
                    }}
                  />
                </div>

                {bloqueadosOrdenados.length > 0 && (
                  <div className="mt-4 space-y-1.5">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                      Días bloqueados seleccionados
                    </p>
                    {bloqueadosOrdenados.map((fecha) => (
                      <div
                        key={dateToStr(fecha)}
                        className="flex items-center justify-between px-3 py-2 rounded-lg bg-destructive/5 border border-destructive/15"
                      >
                        <span className="text-sm text-foreground capitalize">
                          {format(fecha, "EEEE d 'de' MMMM yyyy", { locale: es })}
                        </span>
                        <button
                          type="button"
                          onClick={() => quitarBloqueo(fecha)}
                          className="text-xs text-destructive hover:underline font-medium"
                        >
                          Quitar
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {bloqueadosOrdenados.length === 0 && (
                  <p className="text-center text-xs text-muted-foreground mt-4">
                    Haz clic en los días del calendario para bloquearlos
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        )}

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
