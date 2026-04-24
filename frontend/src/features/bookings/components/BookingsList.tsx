import type { Booking, EstadoBooking } from "../types";
import { BookingCard } from "./BookingCard";

interface Props {
  bookings: Booking[];
  esTrabajadora: boolean;
}

const ORDEN_ESTADOS: EstadoBooking[] = [
  "pendiente",
  "aceptada",
  "completada",
  "rechazada",
  "cancelada",
];

const ESTADO_LABEL: Record<EstadoBooking, string> = {
  pendiente: "Pendiente",
  aceptada: "Aceptada",
  rechazada: "Rechazada",
  completada: "Completada",
  cancelada: "Cancelada",
};

export function BookingsList({ bookings, esTrabajadora }: Props) {
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
                />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}