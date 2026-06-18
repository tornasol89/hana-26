import mongoose from 'mongoose'

const portfolioItemSchema = new mongoose.Schema({
  trabajadora: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WorkerProfile',
    required: true,
  },
  titulo: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
  },
  descripcion: {
    type: String,
    default: '',
    trim: true,
    maxlength: 300,
  },
  fotoUrl: {
    type: String,
    required: true,
  },
  // Reserva completada a la que está vinculado este trabajo (opcional)
  reserva: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    default: null,
  },
  // Respaldo de la clienta
  respaldada: { type: Boolean, default: false },
  respaldadaPor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  fechaRespaldo: { type: Date, default: null },
}, { timestamps: true })

export default mongoose.model('PortfolioItem', portfolioItemSchema)
