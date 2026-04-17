import mongoose from 'mongoose'

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
    enum: ['pendiente', 'aceptada', 'rechazada', 'completada'],
    default: 'pendiente',
  },
}, { timestamps: true })

export default mongoose.model('Booking', bookingSchema)
