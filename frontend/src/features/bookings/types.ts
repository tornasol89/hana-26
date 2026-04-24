import type { Usuario } from "@/features/auth/types";

export type EstadoBooking =
  | "pendiente"
  | "aceptada"
  | "rechazada"
  | "completada"
  | "cancelada";

export interface BookingClienta
  extends Pick<Usuario, "nombre" | "apellido" | "foto"> {
  _id: string;
  email?: string;
  verificada?: boolean;
  estadoVerificacion?: string;
}

export interface BookingTrabajadora {
  _id: string;
  usuario?: {
    _id: string;
    nombre: string;
    apellido: string;
    foto?: string | null;
  };
  categoria?: string;
  tarifaHora?: number;
}

export interface Booking {
  _id: string;
  servicio: string;
  fecha?: string;
  estado: EstadoBooking;
  descripcion?: string;
  precio?: number;
  notas?: string;
  clienta?: BookingClienta;
  trabajadora?: BookingTrabajadora | string;
  createdAt: string;
  updatedAt: string;
}