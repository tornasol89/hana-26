import mongoose from 'mongoose'

const suggestionSchema = new mongoose.Schema({
  tipo:      { type: String, enum: ['sugerencia', 'reclamo'], required: true },
  nombre:    { type: String, required: true, trim: true, maxlength: 120 },
  email:     { type: String, required: true, trim: true, lowercase: true },
  categoria: { type: String, trim: true, default: '' },
  mensaje:   { type: String, required: true, trim: true, maxlength: 2000 },
  valoracion:{ type: Number, min: 1, max: 5, default: null },
  estado:    { type: String, enum: ['pendiente', 'leido', 'resuelto'], default: 'pendiente' },
}, { timestamps: { createdAt: 'creadoEn', updatedAt: 'actualizadoEn' } })

export default mongoose.model('Suggestion', suggestionSchema)
