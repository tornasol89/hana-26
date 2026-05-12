import type { Booking, EstadoBooking } from "../types";
import { BookingCard } from "./BookingCard";

interface Props {
  bookings: Booking[];
  esTrabajadora: boolean;
  reservaDestacada?: string;
}

const ORDEN_ESTADOS: EstadoBooking[] = [
  "en_disputa",
  "pendiente",
  "aceptada",
  "en_curso",
  "completada",
  "rechazada",
  "cancelada",
];

const ESTADO_LABEL: Record<EstadoBooking, string> = {
  en_disputa: "En disputa",
  pendiente:  "Pendiente",
  aceptada:   "Aceptada",
  en_curso:   "En curso",
  completada: "Completada",
  rechazada:  "Rechazada",
  cancelada:  "Cancelada",
};

export function BookingsList({ bookings, esTrabajadora, reservaDestacada }: Props) {
  return (
    <div className="space-y-6">
      {ORDEN_ESTADOS.map((estado) => {
        const grupo = bookings.filter((r) => r.estado === estado);
        if (!grupo.length) return null;

        return (
          <section key={estado}>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              {ESTADO_LABEL[estado]} ({grupo.length})
            </p>
            <div className="space-y-2">
              {grupo.map((booking) => (
                <BookingCard
                  key={booking._id}
                  booking={booking}
                  esTrabajadora={esTrabajadora}
                  destacada={booking._id === reservaDestacada}
                />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}