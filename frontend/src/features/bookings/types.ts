import type { Usuario } from "@/types/auth";
import type { WorkerProfile } from "@/types/worker";

export type EstadoBooking =
  | "pendiente"
  | "aceptada"
  | "rechazada"
  | "completada"
  | "cancelada";

export interface Booking {
  _id: string;
  servicio: string;
  fecha?: string;
  estado: EstadoBooking;
  precio?: number;
  notas?: string;
  clienta?: Pick<Usuario, "id" | "nombre" | "apellido" | "foto"> & { _id?: string };
  trabajadora?: (WorkerProfile & { _id: string }) | string;
  createdAt: string;
  updatedAt: string;
}