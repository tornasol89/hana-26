import mongoose from 'mongoose'

const reviewSchema = new mongoose.Schema({
  reserva: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
  autor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  destinataria: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  tipo: { type: String, enum: ['clienta_a_trabajadora', 'trabajadora_a_clienta'], required: true },
  estrellas: { type: Number, min: 1, max: 5, required: true },
  comentario: { type: String, default: '' },
  metricas: {
    puntualidad: { type: Number, min: 1, max: 5, default: 5 },
    confiabilidad: { type: Number, min: 1, max: 5, default: 5 },
    calidad: { type: Number, min: 1, max: 5, default: 5 },
    comunicacion: { type: Number, min: 1, max: 5, default: 5 },
    precio: { type: Number, min: 1, max: 5, default: 5 },
  },
}, { timestamps: true })

export default mongoose.model('Review', reviewSchema)