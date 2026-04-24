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

export const CATEGORIAS_SERVICIO = [
  "Limpieza",
  "Cuidado de Adultos",
  "Cuidado Infantil",
  "Cocina",
  "Lavado y Planchado",
  "Asistencia del Hogar",
] as const; 

export const MODALIDADES = [
  "Por horas",
  "Jornada completa",
  "Días acordados",
  "Puntual",
] as const;

export const NIVELES_EXPERIENCIA = [
  "Principiante",
  "Intermedia",
  "Experta",
] as const;

export type Region = (typeof REGIONES_CHILE)[number];
export type Categoria = (typeof CATEGORIAS_SERVICIO)[number];
export type Modalidad = (typeof MODALIDADES)[number];
export type NivelExperiencia = (typeof NIVELES_EXPERIENCIA)[number];