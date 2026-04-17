import mongoose from 'mongoose'

const alertSchema = new mongoose.Schema({
  trabajadora: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  clientaReportada: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  motivo: {
    type: String,
    enum: [
      'No se presentó', 'Comportamiento irrespetuoso',
      'No pagó', 'Información falsa', 'Otro'
    ],
    required: true
  },
  descripcion: { type: String, default: '' },
  visible: { type: Boolean, default: true },
}, { timestamps: true })

export default mongoose.model('Alert', alertSchema)