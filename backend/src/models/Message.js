// backend/src/models/Message.js
import mongoose from 'mongoose'
import { cifrar, descifrar } from '../utils/index.js'

const messageSchema = new mongoose.Schema({
  reserva: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
  autor:   { type: mongoose.Schema.Types.ObjectId, ref: 'User',    required: true },
  texto: {
    type: String,
    required: true,
    // Se cifra al asignar y se descifra al leer, de forma transparente.
    set: (v) => cifrar(v),
    get: (v) => descifrar(v),
  },
  // IDs de usuarios que ya leyeron este mensaje
  leidoPor: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, {
  timestamps: true,
  toJSON:   { getters: true },
  toObject: { getters: true },
})

export default mongoose.model('Message', messageSchema)