import mongoose from 'mongoose'

const messageSchema = new mongoose.Schema({
  reserva:  { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
  autor:    { type: mongoose.Schema.Types.ObjectId, ref: 'User',    required: true },
  texto:    { type: String, required: true, trim: true, maxlength: 1000 },
  // IDs de usuarios que ya leyeron este mensaje
  leidoPor: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true })

export default mongoose.model('Message', messageSchema)
