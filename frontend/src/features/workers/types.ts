import type { Usuario } from "@/features/auth/types";

export interface WorkerUsuario
  extends Pick<Usuario, "id" | "nombre" | "apellido" | "foto" | "region" | "comuna" | "verificada"> {
  _id?: string;
  activa?: boolean;
  email?: string;
  rut?: string;
}

export interface Certificado {
  _id: string;
  nombre: string;
  institucion: string;
  urlImagen: string;
}

export interface WorkerProfile {
  _id: string;
  usuario: WorkerUsuario;
  categoria: string;
  subcategoria: string;
  descripcion: string;
  tarifaHora: number;
  modalidad: string;
  nivelExperiencia: string;
  disponible: boolean;
  certificados?: Certificado[];
  certificadaChilevalora?: boolean;
  promedio?: number;
  totalReviews?: number;
}

/** Input para crear o actualizar un perfil profesional */
export interface WorkerProfileInput {
  categoria: string;
  subcategoria?: string;
  descripcion?: string;
  tarifaHora: number;
  modalidad?: string;
  nivelExperiencia?: string;
  disponible?: boolean;
}

export interface Review {
  _id: string;
  autor: {
    _id: string;
    nombre: string;
    apellido: string;
    foto: string | null;
  };
  destinataria?: string;
  tipo?: "clienta_a_trabajadora" | "trabajadora_a_clienta";
  estrellas: number;
  comentario?: string;
  metricas?: {
    puntualidad?: number;
    confiabilidad?: number;
    calidad?: number;
    comunicacion?: number;
    precio?: number;
  };
  createdAt: string;
}

export interface MetricasPromedio {
  puntualidad: number;
  confiabilidad: number;
  calidad: number;
  comunicacion: number;
  precio: number;
}

export interface WorkerDetail {
  perfil: WorkerProfile;
  reviews: Review[];
  promedio: number;
  metricasPromedio: MetricasPromedio;
  serviciosCompletados: number;
  tasaRespuesta: number;
  certificadaChilevalora: boolean;
}

export interface WorkerFilters {
  categoria?: string;
  subcategoria?: string;
  region?: string;
}