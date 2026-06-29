import mongoose from 'mongoose'

// Nombres de categorías — deben coincidir con src/data/categorias.js del frontend
const CATEGORIAS_ENUM = [
  'Estética y belleza', 'Hogar y limpieza', 'Clases y tutorías',
  'Cocina y catering', 'Bienestar y salud', 'Cuidado de mascotas',
  'Cuidado infantil', 'Tecnología y diseño', 'Gasfitería',
  'Electricidad', 'Mecánica', 'Carpintería', 'Plomería',
  'Pintura de interiores', 'Mudanzas y fletes', 'Jardinería',
  'Transporte y traslados',
]

const workerProfileSchema = new mongoose.Schema({
  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },

  // Categoría principal (obligatoria)
  categoria: {
    type: String,
    enum: CATEGORIAS_ENUM,
    required: true,
  },

  // ✅ NUEVO: Subcategoría / especialidad dentro de la categoría (opcional)
  subcategoria: {
    type: String,
    default: '',
    trim: true,
  },

  descripcion: { type: String, default: '', trim: true },
  tarifaHora:  { type: Number, default: 0 },
  disponible:  { type: Boolean, default: true },

  // ✅ NUEVO: Modalidad de atención
  modalidad: {
    type: String,
    enum: ['A domicilio', 'Remoto', 'Retiro y entrega', ''],
    default: '',
  },

  // ✅ NUEVO: Nivel de experiencia declarado por la trabajadora
  nivelExperiencia: {
    type: String,
    enum: ['Menos de 1 año', '1 a 3 años', '3 a 5 años', 'Más de 5 años', ''],
    default: '',
  },

  serviciosCompletados: { type: Number, default: 0 },
  tasaRespuesta:        { type: Number, default: 100 },

  certificados: [{
    nombre:      { type: String },
    institucion: { type: String },
    urlImagen:   { type: String },
  }],

  metricas: {
    puntualidad:    { type: Number, default: 0 },
    confiabilidad:  { type: Number, default: 0 },
    calidad:        { type: Number, default: 0 },
    comunicacion:   { type: Number, default: 0 },
    precio:         { type: Number, default: 0 },
  },

  indiceConfianza: { type: Number, default: 0 },

  // true cuando al menos un certificado tiene institucion = "Chilevalora"
  certificadaChilevalora: { type: Boolean, default: false },

  // Disponibilidad semanal recurrente (7 días, 0=domingo … 6=sábado)
  horarioSemanal: [{
    dia:    { type: Number, min: 0, max: 6, required: true },
    activo: { type: Boolean, default: false },
    inicio: { type: String, default: '09:00' },
    fin:    { type: String, default: '18:00' },
  }],

}, { timestamps: true })

export default mongoose.model('WorkerProfile', workerProfileSchema)
