import { Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { Booking, EstadoBooking } from "../types";

const ESTADO_LABEL: Record<EstadoBooking, string> = {
  pendiente: "Pendiente",
  aceptada: "Aceptada",
  rechazada: "Rechazada",
  completada: "Completada",
  cancelada: "Cancelada",
};

type BadgeVariant = "default" | "secondary" | "destructive" | "outline";

const ESTADO_VARIANT: Record<EstadoBooking, BadgeVariant> = {
  pendiente: "outline",
  aceptada: "default",
  rechazada: "destructive",
  completada: "secondary",
  cancelada: "outline",
};

interface Props {
  booking: Booking;
  esTrabajadora: boolean;
}

export function BookingRow({ booking, esTrabajadora }: Props) {
  const contraparte = getContraparte(booking, esTrabajadora);
  const fechaFormateada = booking.fecha
    ? new Date(booking.fecha).toLocaleDateString("es-CL", {
        weekday: "short",
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  return (
    <Card>
      <CardContent className="p-4 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex-1 min-w-[180px]">
          <p className="font-medium text-card-foreground">{booking.servicio}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {esTrabajadora ? "Clienta: " : "Con: "}
            {contraparte}
          </p>
          {fechaFormateada && (
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <Calendar className="h-3 w-3" /> {fechaFormateada}
            </p>
          )}
        </div>
        <Badge variant={ESTADO_VARIANT[booking.estado]}>
          {ESTADO_LABEL[booking.estado]}
        </Badge>
      </CardContent>
    </Card>
  );
}

function getContraparte(booking: Booking, esTrabajadora: boolean): string {
  if (esTrabajadora) {
    return booking.clienta
      ? `${booking.clienta.nombre} ${booking.clienta.apellido ?? ""}`.trim()
      : "Clienta";
  }

  if (typeof booking.trabajadora === "object" && booking.trabajadora?.usuario) {
    return `${booking.trabajadora.usuario.nombre} ${booking.trabajadora.usuario.apellido ?? ""}`.trim();
  }

  return "Profesional";
}

export { ESTADO_LABEL, ESTADO_VARIANT };