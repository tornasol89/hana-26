import type { UserType } from "@/features/auth/types";

export type EstadoVerificacion = "pendiente" | "enviado" | "aprobado" | "rechazado";

/** Usuaria como la devuelve /api/admin/usuarias */
export interface UsuariaAdmin {
  _id: string;
  nombre: string;
  apellido: string;
  email: string;
  tipo: UserType;
  rut?: string;
  region?: string;
  comuna?: string;
  foto?: string | null;
  carnetFrenteUrl?: string;
  carnetDorsoUrl?: string;
  verificada?: boolean;
  estadoVerificacion?: EstadoVerificacion;
  activa?: boolean;
  notasAdmin?: string;
  createdAt: string;
}

export interface ConteoEstado {
  _id: string;
  count: number;
}

/** Estadísticas devueltas por /api/admin/stats */
export interface AdminStats {
  totalUsuarias: number;
  totalTrabajadoras: number;
  totalClientas: number;
  totalReservas: number;
  pendientesVerif: number;
  reservasUltimos30: number;
  reservasPorEstado: ConteoEstado[];
  categoriasTrabajadoras: ConteoEstado[];
  categoriasReservas: ConteoEstado[];
  regionesDemanda: ConteoEstado[];
  regionesTrabajadoras: ConteoEstado[];
}

export interface UsuariasFilters {
  tipo?: UserType;
  verificacion?: EstadoVerificacion;
  activa?: boolean;
  q?: string;
}