import express from 'express'
import Suggestion from '../models/Suggestion.js'
import { limiterPublico } from '../middleware/rateLimit.js'

const router = express.Router()

// POST /api/sugerencias — pública, no requiere autenticación
router.post('/',limiterPublico, async (req, res) => {
  try {
    const { tipo, nombre, email, categoria, mensaje, valoracion } = req.body

    if (!tipo || !nombre?.trim() || !email?.trim() || !mensaje?.trim()) {
      return res.status(400).json({ mensaje: 'Faltan campos obligatorios: tipo, nombre, email, mensaje' })
    }
    if (!['sugerencia', 'reclamo'].includes(tipo)) {
      return res.status(400).json({ mensaje: 'tipo debe ser sugerencia o reclamo' })
    }

    const nueva = await Suggestion.create({
      tipo,
      nombre: nombre.trim(),
      email: email.trim().toLowerCase(),
      categoria: categoria?.trim() ?? '',
      mensaje: mensaje.trim(),
      valoracion: tipo === 'sugerencia' && valoracion >= 1 && valoracion <= 5 ? valoracion : null,
    })

    res.status(201).json({ mensaje: 'Mensaje recibido', id: nueva._id })
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al guardar mensaje' })
  }
})

export default router
