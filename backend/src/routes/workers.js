import express from 'express'
import Booking from '../models/Booking.js'
import WorkerProfile from '../models/WorkerProfile.js'
import protegerRuta from '../middleware/auth.js'
import { asegurarSlotLibre } from '../services/disponibilidad/index.js'

const router = express.Router()

// POST /api/bookings — crear reserva (clienta logueada)
router.post('/', protegerRuta, async (req, res, next) => {
  try {
    const { trabajadora, servicio, fecha, notas, regionServicio, comunaServicio, direccionServicio } = req.body

    if (!trabajadora) {
      return res.status(400).json({ mensaje: 'Falta el ID del perfil de la trabajadora' })
    }

    if (!regionServicio) {
      return res.status(400).json({ mensaje: 'Debes indicar la región donde se realizará el servicio' })
    }

    if (!comunaServicio) {
      return res.status(400).json({ mensaje: 'Debes indicar la comuna donde se realizará el servicio' })
    }

    // Anti-overbooking (CP-RT-08b): guard de dominio antes de escribir.
    await asegurarSlotLibre({ trabajadora, fecha })

    const reserva = await Booking.create({
      clienta:           req.usuario.id,
      trabajadora:       trabajadora,
      servicio:          servicio || 'Servicio Hana',
      fecha:             fecha || null,
      descripcion:       notas || '',
      estado:            'pendiente',
      regionServicio:    regionServicio,
      comunaServicio:    comunaServicio,
      direccionServicio: direccionServicio || '',
    })

    // Populate para devolver datos completos
    const reservaCompleta = await Booking.findById(reserva._id)
      .populate('clienta', 'nombre apellido email foto')
      .populate({ path: 'trabajadora', populate: { path: 'usuario', select: 'nombre apellido email foto' } })

    res.status(201).json(reservaCompleta)
  } catch (error) {
    next(error) // AppError(409) del guard y duplicate-key (11000) del índice → los mapea errorHandler
  }
})

// GET /api/bookings/mis-reservas — reservas de la usuaria logueada
// Acepta ?modo=clienta|trabajadora para usuarios con perfil dual
router.get('/mis-reservas', protegerRuta, async (req, res) => {
  try {
    let reservas = []
    const rolesUsuario = [req.usuario.tipo, ...(req.usuario.rolesAdicionales || [])]
    const modo = req.query.modo || req.usuario.tipo

    if (modo === 'clienta' && rolesUsuario.includes('clienta')) {
      reservas = await Booking.find({ clienta: req.usuario.id })
        .populate('clienta', 'nombre apellido foto')
        .populate({
          path: 'trabajadora',
          populate: { path: 'usuario', select: 'nombre apellido foto' }
        })
        .sort({ createdAt: -1 })

    } else if (modo === 'trabajadora' && rolesUsuario.includes('trabajadora')) {
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
    res.status(500).json({ mensaje: 'Error al obtener reservas' })
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
    res.status(500).json({ mensaje: 'Error al aceptar reserva' })
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
    res.status(500).json({ mensaje: 'Error al rechazar reserva' })
  }
})

// ─── Helper: identificar rol del usuario logueado en una reserva ─────────────
async function identificarRol(reserva, usuarioId) {
  const { default: WorkerProfileModel } = await import('../models/WorkerProfile.js')
  const perfil = await WorkerProfileModel.findOne({ usuario: usuarioId })
  const esTrabajadora = perfil && reserva.trabajadora.toString() === perfil._id.toString()
  const esClienta = reserva.clienta.toString() === usuarioId
  return { esTrabajadora, esClienta, perfilId: perfil?._id }
}

// ─── Helper: populate completo de reserva ─────────────────────────────────────
async function populateReserva(id) {
  return Booking.findById(id)
    .populate('clienta', 'nombre apellido email foto verificada estadoVerificacion')
    .populate({ path: 'trabajadora', populate: { path: 'usuario', select: 'nombre apellido foto' } })
}

// PUT /api/bookings/:id/confirmar-inicio ──────────────────────────────────────
router.put('/:id/confirmar-inicio', protegerRuta, async (req, res) => {
  try {
    const reserva = await Booking.findById(req.params.id)
    if (!reserva) return res.status(404).json({ mensaje: 'Reserva no encontrada' })

    const estadosValidos = ['aceptada', 'en_disputa']
    if (!estadosValidos.includes(reserva.estado)) {
      return res.status(400).json({ mensaje: 'Solo se puede confirmar el inicio de reservas aceptadas' })
    }

    const { esTrabajadora, esClienta } = await identificarRol(reserva, req.usuario.id)
    if (!esTrabajadora && !esClienta) {
      return res.status(403).json({ mensaje: 'Sin permiso' })
    }

    if (esTrabajadora) reserva.inicioConfirmadoPor.trabajadora = new Date()
    else              reserva.inicioConfirmadoPor.clienta     = new Date()

    // Ambos confirmaron → en_curso (resuelve disputa de inicio si la había)
    if (reserva.inicioConfirmadoPor.trabajadora && reserva.inicioConfirmadoPor.clienta) {
      reserva.estado = 'en_curso'
      if (reserva.disputa?.fase === 'inicio') reserva.disputa.activa = false
    }

    await reserva.save()
    res.json(await populateReserva(reserva._id))
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al confirmar inicio' })
  }
})

// PUT /api/bookings/:id/confirmar-fin ─────────────────────────────────────────
router.put('/:id/confirmar-fin', protegerRuta, async (req, res) => {
  try {
    const reserva = await Booking.findById(req.params.id)
    if (!reserva) return res.status(404).json({ mensaje: 'Reserva no encontrada' })

    const estadosValidos = ['en_curso', 'en_disputa']
    if (!estadosValidos.includes(reserva.estado)) {
      return res.status(400).json({ mensaje: 'Solo se puede confirmar el fin de servicios en curso' })
    }

    const { esTrabajadora, esClienta } = await identificarRol(reserva, req.usuario.id)
    if (!esTrabajadora && !esClienta) {
      return res.status(403).json({ mensaje: 'Sin permiso' })
    }

    if (esTrabajadora) reserva.finConfirmadoPor.trabajadora = new Date()
    else              reserva.finConfirmadoPor.clienta     = new Date()

    // Ambos confirmaron → completada (resuelve disputa de fin si la había)
    if (reserva.finConfirmadoPor.trabajadora && reserva.finConfirmadoPor.clienta) {
      reserva.estado = 'completada'
      if (reserva.disputa?.fase === 'fin') reserva.disputa.activa = false
    }

    await reserva.save()
    res.json(await populateReserva(reserva._id))
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al confirmar fin' })
  }
})

// PUT /api/bookings/:id/disputar ──────────────────────────────────────────────
// Crea o actualiza una disputa. Se puede llamar en cualquier fase activa.
router.put('/:id/disputar', protegerRuta, async (req, res) => {
  try {
    const { fase, motivo } = req.body

    if (!['inicio', 'fin'].includes(fase)) {
      return res.status(400).json({ mensaje: 'fase debe ser "inicio" o "fin"' })
    }
    if (!motivo?.trim()) {
      return res.status(400).json({ mensaje: 'Debes explicar qué pasó' })
    }

    const reserva = await Booking.findById(req.params.id)
    if (!reserva) return res.status(404).json({ mensaje: 'Reserva no encontrada' })

    // Estados donde tiene sentido abrir una disputa
    const estadosPermitidos = ['aceptada', 'en_curso', 'en_disputa']
    if (!estadosPermitidos.includes(reserva.estado)) {
      return res.status(400).json({ mensaje: 'No se puede abrir una disputa en el estado actual' })
    }

    const { esTrabajadora, esClienta } = await identificarRol(reserva, req.usuario.id)
    if (!esTrabajadora && !esClienta) {
      return res.status(403).json({ mensaje: 'Sin permiso' })
    }

    reserva.estado             = 'en_disputa'
    reserva.disputa.activa     = true
    reserva.disputa.fase       = fase
    if (!reserva.disputa.creadaEn) reserva.disputa.creadaEn = new Date()

    if (esTrabajadora) reserva.disputa.motivoTrabajadora = motivo.trim()
    else              reserva.disputa.motivoClienta      = motivo.trim()

    await reserva.save()
    res.json(await populateReserva(reserva._id))
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al crear disputa' })
  }
})

// PUT /api/bookings/:id/completar — marcar como completada
router.put('/:id/completar', protegerRuta, async (req, res) => {
  try {
    const reserva = await Booking.findById(req.params.id)
    if (!reserva) return res.status(404).json({ mensaje: 'Reserva no encontrada' })

    const { esTrabajadora, esClienta } = await identificarRol(reserva, req.usuario.id)
    if (!esTrabajadora && !esClienta) {
      return res.status(403).json({ mensaje: 'No tienes permiso para completar esta reserva' })
    }

    reserva.estado = 'completada'
    await reserva.save()
    res.json(reserva)
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al completar reserva' })
  }
})


export default router