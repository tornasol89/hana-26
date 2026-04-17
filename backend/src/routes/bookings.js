import express from 'express'
import Booking from '../models/Booking.js'
import WorkerProfile from '../models/WorkerProfile.js'
import protegerRuta from '../middleware/auth.js'

const router = express.Router()

// POST /api/bookings — crear reserva (clienta logueada)
router.post('/', protegerRuta, async (req, res) => {
  try {
    const { trabajadora, servicio, fecha, notas } = req.body

    if (!trabajadora) {
      return res.status(400).json({ mensaje: 'Falta el ID del perfil de la trabajadora' })
    }

    const reserva = await Booking.create({
      clienta:     req.usuario.id,
      trabajadora: trabajadora,
      servicio:    servicio || 'Servicio Hana',
      fecha:       fecha || null,
      descripcion: notas || '',
      estado:      'pendiente',
    })

    // Populate para devolver datos completos
    const reservaCompleta = await Booking.findById(reserva._id)
      .populate('clienta', 'nombre apellido email foto')
      .populate({ path: 'trabajadora', populate: { path: 'usuario', select: 'nombre apellido email foto' } })

    res.status(201).json(reservaCompleta)
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al crear reserva', error: error.message })
  }
})

// GET /api/bookings/mis-reservas — reservas de la usuaria logueada
// ✅ CORREGIDO: busca correctamente según tipo de usuario
router.get('/mis-reservas', protegerRuta, async (req, res) => {
  try {
    let reservas = []

    if (req.usuario.tipo === 'clienta') {
      // Clienta: busca por su ID en campo 'clienta'
      reservas = await Booking.find({ clienta: req.usuario.id })
        .populate('clienta', 'nombre apellido foto')
        .populate({
          path: 'trabajadora',
          populate: { path: 'usuario', select: 'nombre apellido foto' }
        })
        .sort({ createdAt: -1 })

    } else if (req.usuario.tipo === 'trabajadora') {
      // Trabajadora: primero busca su WorkerProfile, luego busca reservas con ese ID
      const perfil = await WorkerProfile.findOne({ usuario: req.usuario.id })
      if (!perfil) return res.json([])

      reservas = await Booking.find({ trabajadora: perfil._id })
        .populate('clienta', 'nombre apellido foto email verificada estadoVerificacion')
        .populate({
          path: 'trabajadora',
          populate: { path: 'usuario', select: 'nombre apellido foto' }
        })
        .sort({ createdAt: -1 })
    }

    res.json(reservas)
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener reservas', error: error.message })
  }
})

// PUT /api/bookings/:id/aceptar — trabajadora acepta
router.put('/:id/aceptar', protegerRuta, async (req, res) => {
  try {
    const reserva = await Booking.findById(req.params.id)
      .populate('trabajadora')

    if (!reserva) return res.status(404).json({ mensaje: 'Reserva no encontrada' })

    // Verificar que la trabajadora logueada es la dueña
    const perfil = await WorkerProfile.findOne({ usuario: req.usuario.id })
    if (!perfil || reserva.trabajadora._id.toString() !== perfil._id.toString()) {
      return res.status(403).json({ mensaje: 'No tienes permiso para aceptar esta reserva' })
    }

    reserva.estado = 'aceptada'
    await reserva.save()
    res.json(reserva)
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al aceptar reserva', error: error.message })
  }
})

// PUT /api/bookings/:id/rechazar — trabajadora rechaza
router.put('/:id/rechazar', protegerRuta, async (req, res) => {
  try {
    const reserva = await Booking.findById(req.params.id)
      .populate('trabajadora')

    if (!reserva) return res.status(404).json({ mensaje: 'Reserva no encontrada' })

    const perfil = await WorkerProfile.findOne({ usuario: req.usuario.id })
    if (!perfil || reserva.trabajadora._id.toString() !== perfil._id.toString()) {
      return res.status(403).json({ mensaje: 'No tienes permiso para rechazar esta reserva' })
    }

    reserva.estado = 'rechazada'
    await reserva.save()
    res.json(reserva)
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al rechazar reserva', error: error.message })
  }
})

// PUT /api/bookings/:id/completar — marcar como completada
router.put('/:id/completar', protegerRuta, async (req, res) => {
  try {
    const reserva = await Booking.findById(req.params.id)
    if (!reserva) return res.status(404).json({ mensaje: 'Reserva no encontrada' })

    reserva.estado = 'completada'
    await reserva.save()
    res.json(reserva)
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al completar reserva', error: error.message })
  }
})

export default router
