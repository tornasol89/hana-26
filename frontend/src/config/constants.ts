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

/**
 * Subcategorías predefinidas por categoría.
 * El campo backend `subcategoria` sigue siendo texto libre, pero el frontend
 * limita la elección a estas opciones para mantener consistencia y permitir
 * filtrado en el buscador.
 *
 * Si necesitás agregar una opción nueva, hacelo acá. NO requiere cambios en
 * el backend.
 */
export const SUBCATEGORIAS_POR_CATEGORIA: Record<string, string[]> = {
  "Estética y belleza": [
    "Manicura y pedicura",
    "Pestañas y cejas",
    "Maquillaje profesional",
    "Peluquería",
    "Depilación",
    "Tratamientos faciales",
    "Masajes",
    "Otro",
  ],
  "Hogar y limpieza": [
    "Limpieza profunda",
    "Limpieza regular",
    "Limpieza post-obra",
    "Lavado de alfombras",
    "Lavado de muebles",
    "Lavandería",
    "Planchado",
    "Otro",
  ],
  "Clases y tutorías": [
    "Apoyo escolar primaria",
    "Apoyo escolar secundaria",
    "Preparación PAES",
    "Idiomas",
    "Música",
    "Arte y manualidades",
    "Otro",
  ],
  "Cocina y catering": [
    "Comida casera diaria",
    "Eventos y celebraciones",
    "Comida saludable o especial",
    "Repostería y pastelería",
    "Comida vegana o vegetariana",
    "Otro",
  ],
  "Bienestar y salud": [
    "Yoga",
    "Pilates",
    "Entrenadora personal",
    "Nutrición",
    "Terapia psicológica",
    "Reiki y terapias alternativas",
    "Otro",
  ],
  "Cuidado de mascotas": [
    "Paseo de perros",
    "Cuidado a domicilio",
    "Hospedaje",
    "Peluquería canina",
    "Adiestramiento",
    "Otro",
  ],
  "Cuidado infantil": [
    "Niñera ocasional",
    "Niñera permanente",
    "Cuidado de bebés",
    "Apoyo escolar",
    "Otro",
  ],
  "Tecnología y diseño": [
    "Diseño gráfico",
    "Desarrollo web",
    "Soporte técnico",
    "Redes sociales y marketing digital",
    "Edición de video y foto",
    "Otro",
  ],
  "Gasfitería": [
    "Reparación de cañerías",
    "Instalación de artefactos",
    "Destape de desagües",
    "Emergencias",
    "Otro",
  ],
  "Electricidad": [
    "Instalación eléctrica",
    "Reparación de cortocircuitos",
    "Instalación de luminarias",
    "Emergencias",
    "Otro",
  ],
  "Mecánica": [
    "Mantención de auto",
    "Reparación de frenos",
    "Cambio de aceite y filtros",
    "Diagnóstico",
    "Otro",
  ],
  "Carpintería": [
    "Muebles a medida",
    "Reparación de muebles",
    "Instalación de puertas y ventanas",
    "Pisos",
    "Otro",
  ],
  "Plomería": [
    "Reparación de tuberías",
    "Instalación de griferías",
    "Reparación de baños",
    "Otro",
  ],
  "Pintura de interiores": [
    "Pintura de paredes",
    "Pintura de techos",
    "Empapelado",
    "Otro",
  ],
  "Mudanzas y fletes": [
    "Mudanza completa",
    "Flete pequeño",
    "Embalaje",
    "Otro",
  ],
  "Jardinería": [
    "Poda y mantención",
    "Diseño de jardín",
    "Plantación",
    "Riego automático",
    "Otro",
  ],
  "Transporte y traslados": [
    "Traslado a aeropuerto",
    "Traslado de personas",
    "Transporte escolar",
    "Otro",
  ],
};

/**
 * Helper para obtener las subcategorías de una categoría.
 * Si la categoría no existe en el mapa, devuelve array vacío.
 */
export function getSubcategorias(categoria: string): string[] {
  return SUBCATEGORIAS_POR_CATEGORIA[categoria] ?? [];
}

export type Region = (typeof REGIONES_CHILE)[number];
export type Categoria = (typeof CATEGORIAS_SERVICIO)[number];
export type Modalidad = (typeof MODALIDADES)[number];
export type NivelExperiencia = (typeof NIVELES_EXPERIENCIA)[number];