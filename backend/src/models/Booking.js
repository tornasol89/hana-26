import mongoose from 'mongoose'
import { ESTADOS_QUE_OCUPAN } from '../services/disponibilidad/estados.js'

const bookingSchema = new mongoose.Schema({
  clienta: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  trabajadora: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WorkerProfile',
    required: true,
  },
  servicio: {
    type: String,
    required: true,
    trim: true,
  },
  fecha: {
    type: Date,
    default: null,
  },
  descripcion: {
    type: String,
    default: '',
    trim: true,
  },
  estado: {
    type: String,
    enum: ['pendiente', 'aceptada', 'en_curso', 'completada', 'rechazada', 'cancelada', 'en_disputa'],
    default: 'pendiente',
  },
  regionServicio:    { type: String, default: '' },
  comunaServicio:    { type: String, default: '' },
  direccionServicio: { type: String, default: '' },

  // ── Confirmaciones dobles ──────────────────────────────────────────────────
  inicioConfirmadoPor: {
    trabajadora: { type: Date, default: null },
    clienta:     { type: Date, default: null },
  },
  finConfirmadoPor: {
    trabajadora: { type: Date, default: null },
    clienta:     { type: Date, default: null },
  },

  // ── Disputa ───────────────────────────────────────────────────────────────
  disputa: {
    activa:            { type: Boolean, default: false },
    fase:              { type: String, enum: ['inicio', 'fin', null], default: null },
    motivoTrabajadora: { type: String, default: '' },
    motivoClienta:     { type: String, default: '' },
    creadaEn:          { type: Date,    default: null },
  },
}, { timestamps: true })


// Backstop atómico anti-overbooking: MongoDB rechaza dos reservas activas
// para la misma trabajadora en el mismo slot. Usa la MISMA constante que el
// servicio → la app y la BD no pueden divergir.
bookingSchema.index(
  { trabajadora: 1, fecha: 1 },
  {
    unique: true,
    partialFilterExpression: {
      fecha: { $type: 'date' },
      estado: { $in: ESTADOS_QUE_OCUPAN },
    },
    name: 'idx_unico_trabajadora_fecha_activa',
  }
)

export default mongoose.model('Booking', bookingSchema)
