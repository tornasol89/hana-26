// ============================================================
// HANA — Catálogo de categorías y subcategorías
// Fuente única de verdad. Importar desde aquí en cualquier
// componente que necesite la lista (Home, RegisterWorker,
// filtros de búsqueda, etc.)
// ============================================================

export const CATEGORIAS = [
  // ── TRADICIONALES ─────────────────────────────────────────
  {
    id: 'estetica',
    nombre: 'Estética y belleza',
    icono: '💇',
    tipo: 'tradicional',
    subcategorias: [
      'Peluquería',
      'Manicure y pedicure',
      'Maquillaje',
      'Depilación',
    ],
  },
  {
    id: 'hogar',
    nombre: 'Hogar y limpieza',
    icono: '🧹',
    tipo: 'tradicional',
    subcategorias: [
      'Aseo general del hogar',
      'Lavado y planchado',
      'Organización de espacios',
      'Limpieza profunda',
    ],
  },
  {
    id: 'clases',
    nombre: 'Clases y tutorías',
    icono: '📚',
    tipo: 'tradicional',
    subcategorias: [
      'Apoyo escolar',
      'Idiomas',
      'Computación básica',
      'Talleres creativos',
    ],
  },
  {
    id: 'cocina',
    nombre: 'Cocina y catering',
    icono: '🍽️',
    tipo: 'tradicional',
    subcategorias: [
      'Colaciones y almuerzos',
      'Repostería',
      'Catering para eventos',
      'Comida saludable o especial',
    ],
  },
  {
    id: 'bienestar',
    nombre: 'Bienestar y salud',
    icono: '🧘',
    tipo: 'tradicional',
    subcategorias: [
      'Masajes terapéuticos',
      'Acompañamiento adulto mayor',
      'Terapias complementarias',
      'Entrenamiento y movilidad',
    ],
  },
  {
    id: 'mascotas',
    nombre: 'Cuidado de mascotas',
    icono: '🐾',
    tipo: 'tradicional',
    subcategorias: [
      'Paseo de mascotas',
      'Guardería o cuidado temporal',
      'Baño e higiene',
      'Visitas a domicilio',
    ],
  },
  {
    id: 'infantil',
    nombre: 'Cuidado infantil',
    icono: '👶',
    tipo: 'tradicional',
    subcategorias: [
      'Babysitting por horas',
      'Apoyo en tareas',
      'Cuidado after school',
      'Estimulación y juegos',
    ],
  },
  {
    id: 'tecnologia',
    nombre: 'Tecnología y diseño',
    icono: '💻',
    tipo: 'tradicional',
    subcategorias: [
      'Diseño gráfico',
      'Redes sociales',
      'Soporte tecnológico básico',
      'Creación de páginas web',
    ],
  },

  // ── EMPODERAMIENTO ────────────────────────────────────────
  {
    id: 'gasfiteria',
    nombre: 'Gasfitería',
    icono: '🔧',
    tipo: 'empoderamiento',
    subcategorias: [
      'Reparación de filtraciones',
      'Instalación de llaves y grifería',
      'Destape básico',
      'Mantención de artefactos sanitarios',
    ],
  },
  // NOTA DE AUDITORÍA: Plomería y Gasfitería se solapan.
  // Decisión adoptada: Gasfitería = reparaciones/instalaciones rápidas;
  // Plomería = instalaciones más complejas de tuberías y presión.
  // Si en el futuro se quiere fusionar, basta con eliminar una entrada aquí
  // y migrar los WorkerProfiles con un script de MongoDB.
  {
    id: 'electricidad',
    nombre: 'Electricidad',
    icono: '⚡',
    tipo: 'empoderamiento',
    subcategorias: [
      'Cambio e instalación de enchufes',
      'Instalación de luminarias',
      'Reparaciones eléctricas menores',
      'Revisión de fallas domiciliarias',
    ],
  },
  {
    id: 'mecanica',
    nombre: 'Mecánica',
    icono: '🚗',
    tipo: 'empoderamiento',
    subcategorias: [
      'Mantención básica',
      'Diagnóstico inicial',
      'Cambio de batería',
      'Revisión precompra',
    ],
  },
  {
    id: 'carpinteria',
    nombre: 'Carpintería',
    icono: '🪚',
    tipo: 'empoderamiento',
    subcategorias: [
      'Reparación de muebles',
      'Fabricación a medida',
      'Instalación de repisas',
      'Ajustes y terminaciones',
    ],
  },
  {
    id: 'plomeria',
    nombre: 'Plomería',
    icono: '🏠',
    tipo: 'empoderamiento',
    subcategorias: [
      'Instalación de tuberías simples',
      'Reparación de fugas',
      'Mantención de conexiones',
      'Revisión de presión y drenaje',
    ],
  },
  {
    id: 'pintura',
    nombre: 'Pintura de interiores',
    icono: '🎨',
    tipo: 'empoderamiento',
    subcategorias: [
      'Pintura de muros',
      'Pintura de puertas y marcos',
      'Preparación de superficies',
      'Retocar y renovar espacios',
    ],
  },
  {
    id: 'mudanzas',
    nombre: 'Mudanzas y fletes',
    icono: '📦',
    tipo: 'empoderamiento',
    subcategorias: [
      'Flete pequeño',
      'Mudanza de hogar',
      'Carga y descarga',
      'Traslado de muebles específicos',
    ],
  },
  {
    id: 'jardineria',
    nombre: 'Jardinería',
    icono: '🌿',
    tipo: 'empoderamiento',
    subcategorias: [
      'Mantención de jardín',
      'Poda',
      'Plantación',
      'Limpieza de patio y áreas verdes',
    ],
  },
  {
    id: 'transporte',
    nombre: 'Transporte y traslados',
    icono: '🚐',
    tipo: 'empoderamiento',
    subcategorias: [
      'Traslado de personas',
      'Traslado de encomiendas',
      'Transporte para compras',
      'Traslados programados',
    ],
  },
]

// Helpers listos para usar
export const CATEGORIAS_TRADICIONALES = CATEGORIAS.filter(c => c.tipo === 'tradicional')
export const CATEGORIAS_EMPODERAMIENTO = CATEGORIAS.filter(c => c.tipo === 'empoderamiento')

// Array plano de nombres (para el enum del backend y los selects)
export const NOMBRES_CATEGORIAS = CATEGORIAS.map(c => c.nombre)

// Obtener subcategorías por nombre de categoría
export function getSubcategorias(nombreCategoria) {
  return CATEGORIAS.find(c => c.nombre === nombreCategoria)?.subcategorias ?? []
}