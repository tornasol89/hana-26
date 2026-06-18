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

export const COMUNAS_POR_REGION: Record<string, string[]> = {
  "Arica y Parinacota": ["Arica", "Camarones", "Putre", "General Lagos"],
  "Tarapacá": ["Iquique", "Alto Hospicio", "Pozo Almonte", "Camiña", "Colchane", "Huara", "Pica"],
  "Antofagasta": ["Antofagasta", "Mejillones", "Sierra Gorda", "Taltal", "Calama", "Ollagüe", "San Pedro de Atacama", "Tocopilla", "María Elena"],
  "Atacama": ["Copiapó", "Caldera", "Tierra Amarilla", "Chañaral", "Diego de Almagro", "Vallenar", "Alto del Carmen", "Freirina", "Huasco"],
  "Coquimbo": ["La Serena", "Coquimbo", "Andacollo", "La Higuera", "Paihuano", "Vicuña", "Illapel", "Canela", "Los Vilos", "Salamanca", "Ovalle", "Combarbalá", "Monte Patria", "Punitaqui", "Río Hurtado"],
  "Valparaíso": ["Valparaíso", "Casablanca", "Concón", "Juan Fernández", "Puchuncaví", "Quintero", "Viña del Mar", "Isla de Pascua", "Los Andes", "Calle Larga", "Rinconada", "San Esteban", "La Ligua", "Cabildo", "Papudo", "Petorca", "Zapallar", "Quillota", "Calera", "Hijuelas", "La Cruz", "Nogales", "San Antonio", "Algarrobo", "Cartagena", "El Quisco", "El Tabo", "Santo Domingo", "San Felipe", "Catemu", "Llaillay", "Panquehue", "Putaendo", "Santa María", "Quilpué", "Limache", "Olmué", "Villa Alemana"],
  "Metropolitana de Santiago": ["Santiago", "Cerrillos", "Cerro Navia", "Conchalí", "El Bosque", "Estación Central", "Huechuraba", "Independencia", "La Cisterna", "La Florida", "La Granja", "La Pintana", "La Reina", "Las Condes", "Lo Barnechea", "Lo Espejo", "Lo Prado", "Macul", "Maipú", "Ñuñoa", "Pedro Aguirre Cerda", "Peñalolén", "Providencia", "Pudahuel", "Quilicura", "Quinta Normal", "Recoleta", "Renca", "San Joaquín", "San Miguel", "San Ramón", "Vitacura", "Puente Alto", "Pirque", "San José de Maipo", "Colina", "Lampa", "Tiltil", "San Bernardo", "Buin", "Calera de Tango", "Paine", "Melipilla", "Alhué", "Curacaví", "María Pinto", "San Pedro", "Talagante", "El Monte", "Isla de Maipo", "Padre Hurtado", "Peñaflor"],
  "O'Higgins": ["Rancagua", "Codegua", "Coinco", "Coltauco", "Doñihue", "Graneros", "Las Cabras", "Machalí", "Malloa", "Mostazal", "Olivar", "Peumo", "Pichidegua", "Quinta de Tilcoco", "Requínoa", "Rengo", "San Vicente", "Pichilemu", "La Estrella", "Litueche", "Marchihue", "Navidad", "Paredones", "San Fernando", "Chépica", "Chimbarongo", "Lolol", "Nancagua", "Palmilla", "Peralillo", "Placilla", "Pumanque", "Santa Cruz"],
  "Maule": ["Talca", "Constitución", "Curepto", "Empedrado", "Maule", "Pelarco", "Pencahue", "Río Claro", "San Clemente", "San Rafael", "Cauquenes", "Chanco", "Pelluhue", "Curicó", "Hualañé", "Licantén", "Molina", "Rauco", "Romeral", "Sagrada Familia", "Teno", "Vichuquén", "Linares", "Colbún", "Longaví", "Parral", "Retiro", "San Javier", "Villa Alegre", "Yerbas Buenas"],
  "Ñuble": ["Chillán", "Bulnes", "Chillán Viejo", "El Carmen", "Pemuco", "Pinto", "Quillón", "San Ignacio", "Yungay", "Cobquecura", "Coelemu", "Ninhue", "Portezuelo", "Quirihue", "Ránquil", "Treguaco", "Coihueco", "Ñiquén", "San Carlos", "San Fabián", "San Nicolás"],
  "Biobío": ["Concepción", "Coronel", "Chiguayante", "Florida", "Hualqui", "Lota", "Penco", "San Pedro de la Paz", "Santa Juana", "Talcahuano", "Tomé", "Hualpén", "Lebu", "Arauco", "Cañete", "Contulmo", "Curanilahue", "Los Álamos", "Tirúa", "Los Ángeles", "Antuco", "Cabrero", "Laja", "Mulchén", "Nacimiento", "Negrete", "Quilaco", "Quilleco", "San Rosendo", "Santa Bárbara", "Tucapel", "Yumbel", "Alto Biobío"],
  "La Araucanía": ["Temuco", "Carahue", "Cunco", "Curarrehue", "Freire", "Galvarino", "Gorbea", "Lautaro", "Loncoche", "Melipeuco", "Nueva Imperial", "Padre Las Casas", "Perquenco", "Pitrufquén", "Pucón", "Saavedra", "Teodoro Schmidt", "Toltén", "Vilcún", "Villarrica", "Cholchol", "Angol", "Collipulli", "Curacautín", "Ercilla", "Lonquimay", "Los Sauces", "Lumaco", "Purén", "Renaico", "Traiguén", "Victoria"],
  "Los Ríos": ["Valdivia", "Corral", "Futrono", "La Unión", "Lago Ranco", "Lanco", "Los Lagos", "Máfil", "Mariquina", "Paillaco", "Panguipulli", "Río Bueno"],
  "Los Lagos": ["Puerto Montt", "Calbuco", "Cochamó", "Fresia", "Frutillar", "Los Muermos", "Llanquihue", "Maullín", "Puerto Varas", "Castro", "Ancud", "Chonchi", "Curaco de Vélez", "Dalcahue", "Puqueldón", "Queilén", "Quellón", "Quemchi", "Quinchao", "Osorno", "Puerto Octay", "Purranque", "Puyehue", "Río Negro", "San Juan de la Costa", "San Pablo", "Chaitén", "Futaleufú", "Hualaihué", "Palena"],
  "Aysén": ["Coyhaique", "Lago Verde", "Aysén", "Cisnes", "Guaitecas", "Cochrane", "O'Higgins", "Tortel", "Chile Chico", "Río Ibáñez"],
  "Magallanes": ["Punta Arenas", "Laguna Blanca", "Río Verde", "San Gregorio", "Cabo de Hornos", "Antártica", "Porvenir", "Primavera", "Timaukel", "Natales", "Torres del Paine"],
};

export type Region = (typeof REGIONES_CHILE)[number];
export type Categoria = (typeof CATEGORIAS_SERVICIO)[number];
export type Modalidad = (typeof MODALIDADES)[number];
export type NivelExperiencia = (typeof NIVELES_EXPERIENCIA)[number];