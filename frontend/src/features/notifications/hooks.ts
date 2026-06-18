import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { useMyBookings } from "@/features/bookings/hooks";
import api from "@/lib/api";

export type TipoNotificacion =
  | "disputa"
  | "confirmar_inicio"
  | "confirmar_fin"
  | "nueva_solicitud"
  | "mensajes";

export interface Notificacion {
  id: string;
  tipo: TipoNotificacion;
  titulo: string;
  descripcion: string;
  bookingId: string;
}

interface UnreadResponse {
  count: number;
  reservas: { _id: string; servicio: string; count: number }[];
}

function useUnreadMessages(enabled: boolean) {
  return useQuery({
    queryKey: ["messages", "no-leidos"],
    queryFn: async () => {
      const { data } = await api.get<UnreadResponse>("/messages/no-leidos");
      return data;
    },
    enabled,
    staleTime: 1000 * 30,
    refetchInterval: 1000 * 60,
  });
}

export function useNotificaciones(): Notificacion[] {
  const { user, isAuthenticated } = useAuth();
  const esAdmin = user?.tipo === "admin";
  const esTrabajadora = user?.tipo === "trabajadora";
  const modo = esTrabajadora ? "trabajadora" : "clienta";

  const { data: bookings = [] } = useMyBookings(
    isAuthenticated && !esAdmin ? modo : undefined
  );
  const { data: unread } = useUnreadMessages(isAuthenticated && !esAdmin);

  if (!isAuthenticated || esAdmin) return [];

  const rol = esTrabajadora ? "trabajadora" : "clienta";
  const notificaciones: Notificacion[] = [];

  for (const b of bookings) {
    if (b.estado === "en_disputa") {
      notificaciones.push({
        id: `disputa-${b._id}`,
        tipo: "disputa",
        titulo: "Disputa abierta",
        descripcion: b.servicio,
        bookingId: b._id,
      });
      continue;
    }

    if (b.estado === "pendiente" && esTrabajadora) {
      const nombre = b.clienta
        ? `${b.clienta.nombre} ${b.clienta.apellido ?? ""}`.trim()
        : "una clienta";
      notificaciones.push({
        id: `pendiente-${b._id}`,
        tipo: "nueva_solicitud",
        titulo: "Nueva solicitud de servicio",
        descripcion: `${b.servicio} — de ${nombre}`,
        bookingId: b._id,
      });
    }

    if (b.estado === "aceptada" && !b.inicioConfirmadoPor?.[rol]) {
      notificaciones.push({
        id: `inicio-${b._id}`,
        tipo: "confirmar_inicio",
        titulo: "Confirma el inicio del servicio",
        descripcion: b.servicio,
        bookingId: b._id,
      });
    }

    if (b.estado === "en_curso" && !b.finConfirmadoPor?.[rol]) {
      notificaciones.push({
        id: `fin-${b._id}`,
        tipo: "confirmar_fin",
        titulo: "Confirma el fin del servicio",
        descripcion: b.servicio,
        bookingId: b._id,
      });
    }
  }

  // Una notificación por reserva con mensajes no leídos
  for (const r of unread?.reservas ?? []) {
    notificaciones.push({
      id: `mensajes-${r._id}`,
      tipo: "mensajes",
      titulo: `${r.count} mensaje${r.count !== 1 ? "s" : ""} sin leer`,
      descripcion: r.servicio,
      bookingId: String(r._id),
    });
  }

  return notificaciones;
}
