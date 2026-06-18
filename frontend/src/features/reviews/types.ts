export interface ReviewAutor {
  _id: string;
  nombre: string;
  apellido: string;
  foto: string | null;
}

export type ReviewTipo = "clienta_a_trabajadora" | "trabajadora_a_clienta";

export interface ReviewMetricas {
  puntualidad?: number;
  confiabilidad?: number;
  calidad?: number;
  comunicacion?: number;
  precio?: number;
}

export interface Review {
  _id: string;
  autor: ReviewAutor;
  destinataria: string;
  tipo: ReviewTipo;
  estrellas: number;
  comentario?: string;
  metricas?: ReviewMetricas;
  createdAt: string;
}

/** Respuesta del endpoint GET /api/reviews/:usuarioId */
export interface ReviewsResumen {
  promedio: number;
  total: number;
  reviews: Review[];
}