import type { Usuario } from "@/features/auth/types";

export type EstadoBooking =
  | "pendiente"
  | "aceptada"
  | "en_curso"
  | "completada"
  | "rechazada"
  | "cancelada"
  | "en_disputa";

export interface Disputa {
  activa: boolean;
  fase: "inicio" | "fin" | null;
  motivoTrabajadora: string;
  motivoClienta: string;
  creadaEn: string | null;
}

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

export interface ConfirmacionPor {
  trabajadora: string | null;
  clienta: string | null;
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
  regionServicio?: string;
  comunaServicio?: string;
  direccionServicio?: string;
  inicioConfirmadoPor?: ConfirmacionPor;
  finConfirmadoPor?: ConfirmacionPor;
  disputa?: Disputa;
  createdAt: string;
  updatedAt: string;
}