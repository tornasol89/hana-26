export type UserType = "clienta" | "trabajadora" | "admin";

export type EstadoVerificacion = "sin_enviar" | "enviado" | "aprobado" | "rechazado";

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
  rolesAdicionales: UserType[];
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
  aceptoCompromiso: boolean;
  fechaAceptacion?: string;
}

export interface UpdateProfilePayload {
  nombre?: string;
  apellido?: string;
  region?: string;
  comuna?: string;
  fechaNacimiento?: string;
}

export interface ApiError {
  mensaje: string;
  error?: string;
}