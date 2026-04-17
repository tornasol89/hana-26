import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
  nombre:   { type: String, required: true, trim: true },
  apellido: { type: String, required: true, trim: true },
  email:    { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },

  // ✅ ACTUALIZADO: agrega 'admin' al enum
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

  rut:        { type: String, default: '' },
  verificada: { type: Boolean, default: false },
  disponible: { type: Boolean, default: true },
  region:     { type: String, default: '' },
  comuna:     { type: String, default: '' },

  aceptoCompromiso: { type: Boolean, default: false },
  fechaAceptacion:  { type: Date, default: null },

  // ✅ NUEVO: categorías de interés (solo clientas — para personalización futura)
  categoriasInteres: [{ type: String }],

  // ✅ NUEVO: flag para desactivar cuenta sin borrarla (lo usa el admin)
  activa: { type: Boolean, default: true },

  // ✅ NUEVO: notas internas del admin (no visibles para la usuaria)
  notasAdmin: { type: String, default: '' },

}, { timestamps: true })

export default mongoose.model('User', userSchema)
