import { Award, CircleCheck, CircleX, MapPin, Star } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { WorkerProfile } from "@/features/workers/types";

interface Props {
  perfil: WorkerProfile;
  promedio: number;
  cantidadResenas: number;
  mostrarBotonReservar: boolean;
  certificadaChilevalora: boolean;
  onReservarClick: () => void;
}

export function WorkerHero({
  perfil,
  promedio,
  cantidadResenas,
  mostrarBotonReservar,
  certificadaChilevalora,
  onReservarClick,
}: Props) {
  const usuario = perfil.usuario;
  const nombreCompleto = `${usuario?.nombre ?? ""} ${usuario?.apellido ?? ""}`.trim() || "Profesional Hana";
  const iniciales = `${usuario?.nombre?.[0] ?? ""}${usuario?.apellido?.[0] ?? ""}`.toUpperCase() || "H";
  const ubicacion = [usuario?.comuna, usuario?.region].filter(Boolean).join(", ") || "Ubicación no disponible";

  // Índice Hana: promedio (0-5) escalado a 0-100; +10 si tiene certificado Chilevalora
  const indiceBase = promedio > 0 ? Math.round(promedio * 20) : 0;
  const indiceHana = Math.min(100, indiceBase + (certificadaChilevalora ? 10 : 0));

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6 md:p-8">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Avatar + estado */}
          <div className="relative shrink-0 flex justify-center md:justify-start">
            <Avatar className="h-28 w-28 border-2 border-primary/30">
              <AvatarImage src={usuario?.foto ?? undefined} alt={nombreCompleto} />
              <AvatarFallback className="text-3xl bg-primary text-primary-foreground">
                {iniciales}
              </AvatarFallback>
            </Avatar>

            {/* Status dot */}
            <div
              className={`absolute bottom-1 right-1 h-6 w-6 rounded-full border-2 border-card flex items-center justify-center ${
                perfil.disponible ? "bg-green-500" : "bg-muted-foreground"
              }`}
              title={perfil.disponible ? "Disponible" : "No disponible"}
            >
              {perfil.disponible ? (
                <CircleCheck className="h-3.5 w-3.5 text-white" />
              ) : (
                <CircleX className="h-3.5 w-3.5 text-white" />
              )}
            </div>
          </div>

          {/* Info principal */}
          <div className="flex-1 text-center md:text-left space-y-3">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold font-display text-card-foreground">
                {nombreCompleto}
              </h1>
              <p className="text-sm font-medium text-primary uppercase tracking-wider mt-1">
                {perfil.categoria || "Especialidad no definida"}
              </p>
            </div>

            <div className="flex items-center gap-2 justify-center md:justify-start text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 shrink-0" />
              <span>{ubicacion}</span>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-2 justify-center md:justify-start">
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i <= Math.round(promedio)
                        ? "fill-amber-400 text-amber-400"
                        : "fill-muted text-muted"
                    }`}
                  />
                ))}
              </div>
              <span className="text-lg font-bold text-card-foreground">
                {promedio.toFixed(1)}
              </span>
              <span className="text-sm text-muted-foreground">
                ({cantidadResenas} {cantidadResenas === 1 ? "reseña" : "reseñas"})
              </span>
            </div>

            {/* Badges: disponibilidad + verificada + Chilevalora */}
            <div className="flex flex-wrap gap-2 justify-center md:justify-start">
              {perfil.disponible ? (
                <Badge className="bg-green-500/15 text-green-700 border border-green-500/30 hover:bg-green-500/20">
                  Disponible
                </Badge>
              ) : (
                <Badge variant="outline">No disponible</Badge>
              )}
              {usuario?.verificada && (
                <Badge className="bg-primary/15 text-primary border border-primary/30 hover:bg-primary/20">
                  Verificada
                </Badge>
              )}
              {certificadaChilevalora && (
                <Badge className="gap-1 bg-amber-500/15 text-amber-700 border border-amber-500/30 hover:bg-amber-500/20">
                  <Award className="h-3 w-3" />
                  Certificada Chilevalora
                </Badge>
              )}
            </div>
          </div>

          {/* Índice Hana */}
          <div className="shrink-0 text-center md:text-right">
            <div className="bg-muted/50 rounded-xl p-4 min-w-[148px] border border-border/60">
              <div className="flex items-center justify-center md:justify-end gap-1 mb-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Índice Hana
                </p>
                {/* Tooltip-like hint */}
                <span
                  title="Basado en calificaciones de clientas (0–100). +10 pts por certificación Chilevalora."
                  className="w-4 h-4 rounded-full bg-muted text-muted-foreground text-[9px] font-bold flex items-center justify-center cursor-help border border-border/60 shrink-0"
                >
                  ?
                </span>
              </div>

              {/* Score con barra de progreso visual */}
              <p className="text-4xl font-bold font-display text-primary mt-1 leading-none">
                {indiceHana}
                <span className="text-base font-normal text-muted-foreground">/100</span>
              </p>

              {/* Barra de progreso */}
              <div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${indiceHana}%`,
                    background: indiceHana >= 70
                      ? "linear-gradient(90deg, hsl(var(--primary)), hsl(var(--primary-light)))"
                      : "hsl(var(--muted-foreground))",
                  }}
                />
              </div>

              <p className={`text-xs font-semibold mt-1.5 ${indiceHana >= 70 ? "text-primary" : "text-muted-foreground"}`}>
                {indiceHana >= 85 ? "Muy confiable" : indiceHana >= 70 ? "Confiable" : "En evaluación"}
              </p>

              {certificadaChilevalora && (
                <p className="text-[10px] text-amber-600 font-medium mt-1">
                  Incluye +10 pts Chilevalora
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Botón de reserva */}
        {mostrarBotonReservar && (
          <div className="mt-6 pt-6 border-t border-border">
            <Button
              variant="hero"
              size="lg"
              className="w-full md:w-auto"
              onClick={onReservarClick}
            >
              Solicitar reserva
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}