/**
 * Constantes compartidas entre frontend y backend.
 * IMPORTANTE: Las categorías, modalidades y niveles deben coincidir EXACTAMENTE
 * con los enums definidos en backend/src/models/WorkerProfile.js
 */

export const REGIONES_CHILE = [
  "Arica y Parinacota",
  "Tarapacá",
  "Antofagasta",
  "Atacama",
  "Coquimbo",
  "Valparaíso",
  "Metropolitana de Santiago",
  "O'Higgins",
  "Maule",
  "Ñuble",
  "Biobío",
  "La Araucanía",
  "Los Ríos",
  "Los Lagos",
  "Aysén",
  "Magallanes",
] as const;

/**
 * Categorías de servicio. Sincronizadas con WorkerProfile.js (CATEGORIAS_ENUM).
 * NO modificar sin actualizar el backend.
 */
export const CATEGORIAS_SERVICIO = [
  "Estética y belleza",
  "Hogar y limpieza",
  "Clases y tutorías",
  "Cocina y catering",
  "Bienestar y salud",
  "Cuidado de mascotas",
  "Cuidado infantil",
  "Tecnología y diseño",
  "Gasfitería",
  "Electricidad",
  "Mecánica",
  "Carpintería",
  "Plomería",
  "Pintura de interiores",
  "Mudanzas y fletes",
  "Jardinería",
  "Transporte y traslados",
] as const;

/**
 * Modalidad de atención. Sincronizada con WorkerProfile.js
 */
export const MODALIDADES = [
  "A domicilio",
  "Remoto",
  "Retiro y entrega",
] as const;

/**
 * Nivel de experiencia. Sincronizado con WorkerProfile.js
 */
export const NIVELES_EXPERIENCIA = [
  "Menos de 1 año",
  "1 a 3 años",
  "3 a 5 años",
  "Más de 5 años",
] as const;

export type Region = (typeof REGIONES_CHILE)[number];
export type Categoria = (typeof CATEGORIAS_SERVICIO)[number];
export type Modalidad = (typeof MODALIDADES)[number];
export type NivelExperiencia = (typeof NIVELES_EXPERIENCIA)[number];