export type UserType = "clienta" | "trabajadora" | "admin";

export type EstadoVerificacion =
  | "pendiente"
  | "enviado"
  | "aprobado"
  | "rechazado"
  | "sin_enviar";

export interface Usuario {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  tipo: UserType;
  foto: string | null;
  region: string;
  comuna: string;
  rut: string;
  verificada: boolean;
  estadoVerificacion: EstadoVerificacion;
  aceptoCompromiso: boolean;
  carnetFrenteUrl: string | null;
  carnetDorsoUrl: string | null;

  // ✅ NUEVO: fecha de nacimiento y campos derivados
  /** Fecha en formato ISO. Ej: "1990-05-15T00:00:00.000Z" */
  fechaNacimiento?: string;
  /**
   * Flag que indica si la fecha de nacimiento es real o ficticia.
   * - true: registro normal o usuaria ya corrigió la ficticia
   * - false: usuaria migrada con fecha 2000-01-01 (mostrar banner)
   */
  fechaNacimientoCorregida?: boolean;
  /** Edad calculada por el backend. Solo lectura. */
  edad?: number | null;
}

export interface AuthResponse {
  token: string;
  usuario: Usuario;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  nombre: string;
  apellido: string;
  email: string;
  password: string;
  tipo: UserType;
  region?: string;
  comuna?: string;
  rut?: string;
  /** Fecha en formato YYYY-MM-DD (input type="date") */
  fechaNacimiento: string;
  aceptoCompromiso: boolean;
  fechaAceptacion?: string;
}

/** Payload para PUT /api/auth/me */
export interface UpdateProfilePayload {
  nombre?: string;
  apellido?: string;
  region?: string;
  comuna?: string;
  /** Fecha en formato YYYY-MM-DD (input type="date") */
  fechaNacimiento?: string;
}

export interface ApiError {
  mensaje: string;
  error?: string;
}