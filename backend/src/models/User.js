import mongoose from 'mongoose'
import { capitalizarNombre, normalizarRut } from '../utils/normalize.js'
import { validarRut, validarFechaNacimiento } from '../utils/validators.js'

const userSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true,
    trim: true,
    // Se aplica al guardar/actualizar: capitaliza con manejo de preposiciones
    set: capitalizarNombre,
  },
  apellido: {
    type: String,
    required: true,
    trim: true,
    set: capitalizarNombre,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },

  tipo: {
    type: String,
    enum: ['clienta', 'trabajadora', 'admin'],
    required: true,
  },

  foto:              { type: String, default: null },
  carnetFrenteUrl:   { type: String, default: null },
  carnetDorsoUrl:    { type: String, default: null },
  estadoVerificacion: {
    type: String,
    enum: ['sin_enviar', 'enviado', 'aprobado', 'rechazado'],
    default: 'sin_enviar',
  },

  rut: {
    type: String,
    default: '',
    trim: true,
    // Normalizar al formato sin puntos: "12.345.678-9" → "12345678-9"
    set: function (rut) {
      if (!rut) return ''
      const normalizado = normalizarRut(rut)
      return normalizado || rut // si no se pudo normalizar, dejamos lo que vino (luego falla el validator)
    },
    validate: {
      validator: function (rut) {
        // RUT vacío es válido (es opcional para clientas hoy)
        if (!rut) return true
        return validarRut(rut)
      },
      message: 'RUT inválido. Verifica el número y el dígito verificador.',
    },
  },

  //  fecha de nacimiento
  fechaNacimiento: {
    type: Date,
    required: true,
    validate: {
      validator: function (fecha) {
        if (!fecha) return false
        const resultado = validarFechaNacimiento(fecha)
        return resultado.valida
      },
      message: 'Fecha de nacimiento inválida o no cumple la edad mínima de 18 años.',
    },
  },

  // NUEVO: flag para mostrar banner a usuarias migradas con fecha ficticia
  // Se setea a `false` para las 10 cuentas viejas durante la migración,
  // y a `true` para registros nuevos o cuando la usuaria edita su perfil.
  fechaNacimientoCorregida: {
    type: Boolean,
    default: true,
  },

  verificada: { type: Boolean, default: false },
  disponible: { type: Boolean, default: true },
  region:     { type: String, default: '' },
  comuna:     { type: String, default: '' },
  // NUEVO: verificación de email por link
  emailVerificado:          { type: Boolean, default: false },
  tokenVerificacion:        { type: String,  default: null },
  tokenVerificacionExpira:  { type: Date,    default: null },

  aceptoCompromiso: { type: Boolean, default: false },
  fechaAceptacion:  { type: Date, default: null },

  categoriasInteres: [{ type: String }],

  activa: { type: Boolean, default: true },

  notasAdmin: { type: String, default: '' },

  // Roles adicionales para perfiles duales (ej: trabajadora con perfil de clienta)
  rolesAdicionales: [{ type: String, enum: ['clienta', 'trabajadora'] }],

}, { timestamps: true })

// ─────────────────────────────────────────────────────────────────────────
// Índices
// ─────────────────────────────────────────────────────────────────────────

// Para queries frecuentes en el buscador
userSchema.index({ tipo: 1, region: 1 })

//  MODIFICADO: índice único + parcial en rut.
// - partialFilterExpression: el índice solo aplica a RUTs con contenido real,
//   ignorando los strings vacíos '' (que son el default del schema).
//   Sin este filtro, MongoDB consideraría '' como un valor único e impediría
//   que más de una usuaria se registre sin RUT.
userSchema.index(
  { rut: 1 },
  {
    unique: true,
    partialFilterExpression: { rut: { $type: 'string', $gt: '' } },
  }
)

// ─────────────────────────────────────────────────────────────────────────
// Métodos estáticos: lógica de negocio reutilizable
// ─────────────────────────────────────────────────────────────────────────

/**
 * Verifica que los campos únicos (email, rut) no estén ya tomados por otra
 * usuaria. Centraliza la lógica de unicidad para que el register, el endpoint
 * de admin y futuros endpoints (signup social, importación) la usen igual.
 *
 * @param {Object} opciones
 * @param {string} [opciones.email]    - Email a verificar (opcional).
 * @param {string} [opciones.rut]      - RUT a verificar (opcional, se normaliza).
 * @param {string} [opciones.ignorarId] - ID de usuaria a ignorar (útil al editar:
 *                                        permite "guardar sin cambios").
 * @returns {Promise<null | { campo: 'email' | 'rut', mensaje: string }>}
 *          null si no hay conflicto; objeto con detalle del campo en conflicto si lo hay.
 */
userSchema.statics.verificarUnicidad = async function ({ email, rut, ignorarId } = {}) {
  const baseQuery = ignorarId ? { _id: { $ne: ignorarId } } : {}

  if (email) {
    const emailNormalizado = String(email).trim().toLowerCase()
    if (emailNormalizado) {
      const existe = await this.findOne({ ...baseQuery, email: emailNormalizado })
      if (existe) {
        return { campo: 'email', mensaje: 'El email ya está registrado' }
      }
    }
  }

  if (rut && String(rut).trim()) {
    const rutNormalizado = normalizarRut(rut)
    if (rutNormalizado) {
      const existe = await this.findOne({ ...baseQuery, rut: rutNormalizado })
      if (existe) {
        return { campo: 'rut', mensaje: 'El RUT ya está registrado' }
      }
    }
  }

  return null
}

export default mongoose.model('User', userSchema)