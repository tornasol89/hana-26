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

  // ✅ NUEVO: fecha de nacimiento
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

  // ✅ NUEVO: flag para mostrar banner a usuarias migradas con fecha ficticia
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

  aceptoCompromiso: { type: Boolean, default: false },
  fechaAceptacion:  { type: Date, default: null },

  categoriasInteres: [{ type: String }],

  activa: { type: Boolean, default: true },

  notasAdmin: { type: String, default: '' },

}, { timestamps: true })

// Índice para queries frecuentes
userSchema.index({ tipo: 1, region: 1 })
userSchema.index({ rut: 1 }, { sparse: true })  // sparse: ignora documentos sin rut

export default mongoose.model('User', userSchema)