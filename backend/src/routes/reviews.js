import express from 'express'
import Review  from '../models/Review.js'
import Booking from '../models/Booking.js'
import WorkerProfile from '../models/WorkerProfile.js'
import protegerRuta from '../middleware/auth.js'

const router = express.Router()

// POST /api/reviews — crear evaluación (requiere login y reserva completada)
router.post('/', protegerRuta, async (req, res) => {
  try {
    const { reserva, destinataria, tipo, estrellas, comentario, metricas } = req.body

    if (!reserva) return res.status(400).json({ mensaje: 'Debes indicar la reserva a evaluar' })

    // Verificar que la reserva existe y el usuario es participante
    const booking = await Booking.findById(reserva).populate('trabajadora')
    if (!booking) return res.status(404).json({ mensaje: 'Reserva no encontrada' })

    const esClienta     = booking.clienta.toString() === req.usuario.id
    const esTrabajadora = booking.trabajadora?.usuario?.toString() === req.usuario.id
    if (!esClienta && !esTrabajadora) {
      return res.status(403).json({ mensaje: 'No eres participante de esta reserva' })
    }

    // Solo se puede evaluar cuando la reserva está aceptada o completada
    if (booking.estado === 'pendiente' || booking.estado === 'rechazada') {
      return res.status(400).json({ mensaje: 'Solo puedes evaluar reservas aceptadas o completadas' })
    }

    // Evitar auto-evaluación (incluye perfiles duales: mismo _id)
    if (destinataria === req.usuario.id) {
      return res.status(400).json({ mensaje: 'No puedes evaluarte a ti misma' })
    }
    // Prevención adicional: si la destinataria tiene perfil de trabajadora, verificar que no sea la misma persona
    const perfilWorker = await WorkerProfile.findById(destinataria)
    if (perfilWorker && perfilWorker.usuario.toString() === req.usuario.id) {
      return res.status(400).json({ mensaje: 'No puedes evaluarte a ti misma' })
    }

    // Evitar evaluación duplicada para la misma reserva
    const yaEvaluo = await Review.findOne({ reserva, autor: req.usuario.id })
    if (yaEvaluo) {
      return res.status(400).json({ mensaje: 'Ya evaluaste esta reserva' })
    }

    const review = await Review.create({
      reserva,
      autor: req.usuario.id,
      destinataria,
      tipo,
      estrellas,
      comentario: comentario || '',
      metricas,
    })

    res.status(201).json(review)
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al crear evaluación', error: error.message })
  }
})

// GET /api/reviews/reserva/:reservaId — ver si el usuario ya evaluó esta reserva
router.get('/reserva/:reservaId', protegerRuta, async (req, res) => {
  try {
    const review = await Review.findOne({
      reserva: req.params.reservaId,
      autor:   req.usuario.id,
    })
    res.json({ yaEvaluo: !!review, review })
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al verificar evaluación', error: error.message })
  }
})

// GET /api/reviews/:usuarioId — ver evaluaciones de una usuaria
router.get('/:usuarioId', async (req, res) => {
  try {
    const reviews = await Review.find({ destinataria: req.params.usuarioId })
      .populate('autor', 'nombre apellido foto')
      .sort({ createdAt: -1 })

    const promedio = reviews.length
      ? (reviews.reduce((acc, r) => acc + r.estrellas, 0) / reviews.length).toFixed(1)
      : 0

    res.json({ promedio, total: reviews.length, reviews })
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener evaluaciones', error: error.message })
  }
})

export default router
