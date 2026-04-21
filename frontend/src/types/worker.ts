import type { Usuario } from "./auth";

// Subset de Usuario que llega populado en los listados
export interface WorkerUsuario
  extends Pick<Usuario, "id" | "nombre" | "apellido" | "foto" | "region" | "comuna" | "verificada"> {
  _id?: string; // el backend a veces manda _id en vez de id
  activa?: boolean;
  email?: string;
  rut?: string;
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
}

export interface Review {
  _id: string;
  autor: {
    _id: string;
    nombre: string;
    apellido: string;
    foto: string | null;
  };
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
}

export interface WorkerFilters {
  categoria?: string;
  subcategoria?: string;
  region?: string;
}