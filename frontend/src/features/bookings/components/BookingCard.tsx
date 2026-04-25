import { useState } from "react";
import {
  Calendar,
  ChevronDown,
  MessageSquare,
  ShieldCheck,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { Booking, EstadoBooking } from "../types";
import { BookingActions } from "./BookingActions";

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

export function BookingCard({ booking, esTrabajadora }: Props) {
  const [expanded, setExpanded] = useState(false);

  const contraparteInfo = getContraparteInfo(booking, esTrabajadora);
  const fechaFormateada = booking.fecha
    ? new Date(booking.fecha).toLocaleDateString("es-CL", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  const tieneAcciones =
    (esTrabajadora &&
    (booking.estado === "pendiente" || 
      booking.estado === "aceptada" ||
      booking.estado === "completada")) ||
    (!esTrabajadora && booking.estado === "completada");

  return (
    <Card>
      <CardContent className="p-4">
        <button
          type="button"
          onClick={() => setExpanded((p) => !p)}
          className="w-full text-left flex items-start justify-between gap-3"
        >
          <div className="flex-1 min-w-0">
            <p className="font-medium text-card-foreground truncate">
              {booking.servicio}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5 truncate">
              {esTrabajadora ? "De: " : "Con: "}
              {contraparteInfo.nombre}
            </p>
            {fechaFormateada && (
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <Calendar className="h-3 w-3 shrink-0" />
                <span className="truncate">{fechaFormateada}</span>
              </p>
            )}
          </div>

          <div className="flex flex-col items-end gap-2 shrink-0">
            <Badge variant={ESTADO_VARIANT[booking.estado]}>
              {ESTADO_LABEL[booking.estado]}
            </Badge>
            <ChevronDown
              className={`h-4 w-4 text-muted-foreground transition-transform ${
                expanded ? "rotate-180" : ""
              }`}
            />
          </div>
        </button>

        {expanded && (
          <div className="mt-4 pt-4 border-t border-border space-y-4">
            <div className="flex items-start gap-3">
              <Avatar className="h-12 w-12 shrink-0">
                <AvatarImage
                  src={contraparteInfo.foto ?? undefined}
                  alt={contraparteInfo.nombre}
                />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {contraparteInfo.iniciales}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-card-foreground">
                  {contraparteInfo.nombre}
                </p>
                {contraparteInfo.email && (
                  <p className="text-xs text-muted-foreground truncate">
                    {contraparteInfo.email}
                  </p>
                )}
                {contraparteInfo.verificada !== undefined && (
                  <div className="mt-1.5">
                    {contraparteInfo.verificada ? (
                      <Badge className="gap-1 bg-green-500/15 text-green-700 border border-green-500/30 hover:bg-green-500/20">
                        <ShieldCheck className="h-3 w-3" />
                        Verificada
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-muted-foreground">
                        Sin verificar
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            </div>

            {booking.descripcion && (
              <div className="rounded-lg bg-muted/50 p-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1">
                  <MessageSquare className="h-3 w-3" />
                  {esTrabajadora ? "Mensaje de la clienta" : "Tus notas"}
                </p>
                <p className="text-sm text-card-foreground">{booking.descripcion}</p>
              </div>
            )}

            {tieneAcciones && (
              <div className="pt-1">
                <BookingActions booking={booking} esTrabajadora={esTrabajadora} />
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface ContraparteInfo {
  nombre: string;
  iniciales: string;
  foto: string | null;
  email?: string;
  verificada?: boolean;
}

function getContraparteInfo(booking: Booking, esTrabajadora: boolean): ContraparteInfo {
  if (esTrabajadora) {
    const c = booking.clienta;
    if (!c) return { nombre: "Clienta", iniciales: "?", foto: null };
    return {
      nombre: `${c.nombre} ${c.apellido ?? ""}`.trim() || "Clienta",
      iniciales: `${c.nombre?.[0] ?? ""}${c.apellido?.[0] ?? ""}`.toUpperCase() || "?",
      foto: c.foto ?? null,
      email: c.email,
      verificada: c.verificada,
    };
  }

  if (typeof booking.trabajadora === "object" && booking.trabajadora?.usuario) {
    const u = booking.trabajadora.usuario;
    return {
      nombre: `${u.nombre} ${u.apellido ?? ""}`.trim() || "Profesional",
      iniciales: `${u.nombre?.[0] ?? ""}${u.apellido?.[0] ?? ""}`.toUpperCase() || "?",
      foto: u.foto ?? null,
    };
  }

  return { nombre: "Profesional", iniciales: "?", foto: null };
}