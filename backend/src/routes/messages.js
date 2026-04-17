import express from 'express'
import Message from '../models/Message.js'
import Booking from '../models/Booking.js'
import WorkerProfile from '../models/WorkerProfile.js'
import protegerRuta from '../middleware/auth.js'

const router = express.Router()

// Verifica que el usuario autenticado sea participante de la reserva
async function esParticipante(reservaId, usuarioId) {
  const reserva = await Booking.findById(reservaId).populate('trabajadora')
  if (!reserva) return null
  const esClienta    = reserva.clienta.toString() === usuarioId
  const esTrabajadora = reserva.trabajadora?.usuario?.toString() === usuarioId
  if (!esClienta && !esTrabajadora) return null
  return reserva
}

// GET /api/messages/no-leidos — contador de mensajes no leídos del usuario logueado
// IMPORTANTE: debe ir ANTES de /:reservaId para que Express no la confunda con un ID
router.get('/no-leidos', protegerRuta, async (req, res) => {
  try {
    let filtroReservas = { clienta: req.usuario.id }

    if (req.usuario.tipo === 'trabajadora') {
      const perfil = await WorkerProfile.findOne({ usuario: req.usuario.id })
      if (!perfil) return res.json({ count: 0 })
      filtroReservas = { trabajadora: perfil._id }
    }

    const reservas    = await Booking.find(filtroReservas).select('_id')
    const reservaIds  = reservas.map(r => r._id)

    const count = await Message.countDocuments({
      reserva:  { $in: reservaIds },
      autor:    { $ne: req.usuario.id },
      leidoPor: { $not: { $elemMatch: { $eq: req.usuario.id } } },
    })

    res.json({ count })
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al contar no leídos', error: error.message })
  }
})

// GET /api/messages/:reservaId — obtener mensajes de una reserva
router.get('/:reservaId', protegerRuta, async (req, res) => {
  try {
    const reserva = await esParticipante(req.params.reservaId, req.usuario.id)
    if (!reserva) return res.status(403).json({ mensaje: 'No tienes acceso a esta conversación' })

    const mensajes = await Message.find({ reserva: req.params.reservaId })
      .populate('autor', 'nombre apellido foto tipo')
      .sort({ createdAt: 1 })

    res.json(mensajes)
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener mensajes', error: error.message })
  }
})

// POST /api/messages/:reservaId — enviar un mensaje
router.post('/:reservaId', protegerRuta, async (req, res) => {
  try {
    const { texto } = req.body
    if (!texto?.trim()) return res.status(400).json({ mensaje: 'El mensaje no puede estar vacío' })

    const reserva = await esParticipante(req.params.reservaId, req.usuario.id)
    if (!reserva) return res.status(403).json({ mensaje: 'No tienes acceso a esta conversación' })

    if (reserva.estado === 'rechazada') {
      return res.status(400).json({ mensaje: 'No se puede chatear en una reserva rechazada' })
    }
    if (reserva.estado === 'pendiente') {
      return res.status(400).json({ mensaje: 'El chat se habilita cuando la reserva sea aceptada' })
    }

    const mensaje = await Message.create({
      reserva: req.params.reservaId,
      autor:   req.usuario.id,
      texto:   texto.trim(),
    })

    const mensajePopulado = await mensaje.populate('autor', 'nombre apellido foto tipo')
    res.status(201).json(mensajePopulado)
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al enviar mensaje', error: error.message })
  }
})

// PUT /api/messages/:reservaId/leer — marcar todos los mensajes de la reserva como leídos
router.put('/:reservaId/leer', protegerRuta, async (req, res) => {
  try {
    const reserva = await esParticipante(req.params.reservaId, req.usuario.id)
    if (!reserva) return res.status(403).json({ mensaje: 'No tienes acceso a esta conversación' })

    await Message.updateMany(
      {
        reserva:  req.params.reservaId,
        autor:    { $ne: req.usuario.id },
        leidoPor: { $not: { $elemMatch: { $eq: req.usuario.id } } },
      },
      { $addToSet: { leidoPor: req.usuario.id } }
    )

    res.json({ ok: true })
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al marcar como leídos', error: error.message })
  }
})

export default router
