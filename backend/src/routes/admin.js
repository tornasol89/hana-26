import express from 'express'
import bcrypt from 'bcryptjs'
import User from '../models/User.js'
import WorkerProfile from '../models/WorkerProfile.js'
import Booking from '../models/Booking.js'
import Suggestion from '../models/Suggestion.js'
import protegerRuta from '../middleware/auth.js'

const router = express.Router()

// ── Middleware exclusivo para admins ──────────────────────────────────────────
function soloAdmin(req, res, next) {
  if (req.usuario?.tipo !== 'admin') {
    return res.status(403).json({ mensaje: 'Acceso restringido a administradoras' })
  }
  next()
}

// Aplicar autenticación + rol admin a todas las rutas de este archivo
router.use(protegerRuta, soloAdmin)

// ── DISPUTAS ──────────────────────────────────────────────────────────────────

// GET /api/admin/disputas — listar todas las reservas en disputa
router.get('/disputas', async (req, res) => {
  try {
    const disputas = await Booking.find({ estado: 'en_disputa' })
      .populate('clienta', 'nombre apellido email foto')
      .populate({ path: 'trabajadora', populate: { path: 'usuario', select: 'nombre apellido email foto' } })
      .sort({ 'disputa.creadaEn': -1 })
    res.json(disputas)
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener disputas' })
  }
})

// PUT /api/admin/bookings/:id/resolver-disputa
// accion: 'confirmar_inicio' | 'confirmar_fin' | 'cancelar' | 'reactivar'
router.put('/bookings/:id/resolver-disputa', async (req, res) => {
  try {
    const { accion, nota } = req.body
    const reserva = await Booking.findById(req.params.id)
    if (!reserva) return res.status(404).json({ mensaje: 'Reserva no encontrada' })
    if (reserva.estado !== 'en_disputa') {
      return res.status(400).json({ mensaje: 'Solo se pueden resolver reservas en disputa' })
    }

    const ahora = new Date()

    switch (accion) {
      case 'confirmar_inicio':
        reserva.inicioConfirmadoPor.trabajadora = reserva.inicioConfirmadoPor.trabajadora || ahora
        reserva.inicioConfirmadoPor.clienta     = reserva.inicioConfirmadoPor.clienta     || ahora
        reserva.estado = 'en_curso'
        break
      case 'confirmar_fin':
        reserva.finConfirmadoPor.trabajadora = reserva.finConfirmadoPor.trabajadora || ahora
        reserva.finConfirmadoPor.clienta     = reserva.finConfirmadoPor.clienta     || ahora
        reserva.estado = 'completada'
        break
      case 'cancelar':
        reserva.estado = 'cancelada'
        break
      case 'reactivar':
        // Vuelve al estado antes de la disputa según la fase
        reserva.estado = reserva.disputa?.fase === 'fin' ? 'en_curso' : 'aceptada'
        break
      default:
        return res.status(400).json({ mensaje: 'Acción inválida' })
    }

    reserva.disputa.activa = false
    if (nota?.trim()) {
      // Guardamos la nota del admin en el campo motivoClienta si no hay (campo auxiliar)
      reserva.disputa.motivoClienta = reserva.disputa.motivoClienta || `[Admin] ${nota.trim()}`
    }

    await reserva.save()

    const reservaActualizada = await Booking.findById(reserva._id)
      .populate('clienta', 'nombre apellido email foto')
      .populate({ path: 'trabajadora', populate: { path: 'usuario', select: 'nombre apellido email foto' } })

    res.json(reservaActualizada)
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al resolver disputa' })
  }
})


// ── DASHBOARD ─────────────────────────────────────────────────────────────────

// GET /api/admin/stats — resumen general + métricas de negocio para el dashboard
router.get('/stats', async (req, res) => {
  try {
    const [
      totalUsuarias, totalTrabajadoras, totalClientas, totalReservas, pendientesVerif,
      reservasPorEstado, categoriasTrabajadoras, categoriasReservas, regionesDemanda, regionesTrabajadoras,
      reservasUltimos30,
    ] = await Promise.all([
      User.countDocuments({ tipo: { $ne: 'admin' } }),
      User.countDocuments({ tipo: 'trabajadora' }),
      User.countDocuments({ tipo: 'clienta' }),
      Booking.countDocuments(),
      User.countDocuments({ estadoVerificacion: { $ne: 'aprobado' }, tipo: { $ne: 'admin' } }),

      // Reservas agrupadas por estado
      Booking.aggregate([
        { $group: { _id: '$estado', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),

      // Categorías con más trabajadoras registradas
      WorkerProfile.aggregate([
        { $group: { _id: '$categoria', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 8 },
      ]),

      // Categorías con más reservas solicitadas
      Booking.aggregate([
        { $group: { _id: '$servicio', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 8 },
      ]),

      // Regiones con más clientas (demanda)
      User.aggregate([
        { $match: { tipo: 'clienta', region: { $ne: '' } } },
        { $group: { _id: '$region', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 6 },
      ]),

      // Regiones con más trabajadoras (oferta)
      User.aggregate([
        { $match: { tipo: 'trabajadora', region: { $ne: '' } } },
        { $group: { _id: '$region', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 6 },
      ]),

      // Reservas en los últimos 30 días
      Booking.countDocuments({ createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } }),
    ])

    res.json({
      totalUsuarias, totalTrabajadoras, totalClientas, totalReservas, pendientesVerif,
      reservasPorEstado, categoriasTrabajadoras, categoriasReservas,
      regionesDemanda, regionesTrabajadoras, reservasUltimos30,
    })
  } catch (e) {
    res.status(500).json({ mensaje: 'Error al obtener estadísticas', error: e.message })
  }
})


// ── USUARIAS ──────────────────────────────────────────────────────────────────

// GET /api/admin/usuarias — listar todas con filtros opcionales
// Query: ?tipo=clienta|trabajadora&verificacion=enviado&activa=true&q=nombre
router.get('/usuarias', async (req, res) => {
  try {
    const { tipo, verificacion, activa, q } = req.query
    const filtro = { tipo: { $ne: 'admin' } }

    if (tipo)         filtro.tipo = tipo
    if (verificacion) filtro.estadoVerificacion = verificacion
    if (activa !== undefined) filtro.activa = activa === 'true'
    if (q) {
      filtro.$or = [
        { nombre:   { $regex: q, $options: 'i' } },
        { apellido: { $regex: q, $options: 'i' } },
        { email:    { $regex: q, $options: 'i' } },
        { rut:      { $regex: q, $options: 'i' } },
      ]
    }

    const usuarias = await User.find(filtro)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(100)

    res.json(usuarias)
  } catch (e) {
    res.status(500).json({ mensaje: 'Error al listar usuarias', error: e.message })
  }
})

// GET /api/admin/usuarias/:id — detalle de una usuaria
router.get('/usuarias/:id', async (req, res) => {
  try {
    const usuaria = await User.findById(req.params.id).select('-password')
    if (!usuaria) return res.status(404).json({ mensaje: 'Usuaria no encontrada' })

    // Si es trabajadora, incluir su perfil profesional
    let perfil = null
    if (usuaria.tipo === 'trabajadora') {
      perfil = await WorkerProfile.findOne({ usuario: usuaria._id })
    }

    res.json({ usuaria, perfil })
  } catch (e) {
    res.status(500).json({ mensaje: 'Error', error: e.message })
  }
})

// PATCH /api/admin/usuarias/:id — editar campos de una usuaria
router.patch('/usuarias/:id', async (req, res) => {
  try {
    // Campos editables por el admin
    const { nombre, apellido, region, comuna, activa, notasAdmin, estadoVerificacion } = req.body

    const actualizada = await User.findByIdAndUpdate(
      req.params.id,
      { nombre, apellido, region, comuna, activa, notasAdmin, estadoVerificacion },
      { new: true }
    ).select('-password')

    if (!actualizada) return res.status(404).json({ mensaje: 'Usuaria no encontrada' })
    res.json(actualizada)
  } catch (e) {
    res.status(500).json({ mensaje: 'Error al actualizar', error: e.message })
  }
})

// PATCH /api/admin/usuarias/:id/verificar — aprobar o rechazar verificación
router.patch('/usuarias/:id/verificar', async (req, res) => {
  try {
    const { decision } = req.body // 'aprobado' | 'rechazado'
    if (!['aprobado', 'rechazado'].includes(decision)) {
      return res.status(400).json({ mensaje: "decision debe ser 'aprobado' o 'rechazado'" })
    }

    const usuaria = await User.findByIdAndUpdate(
      req.params.id,
      {
        estadoVerificacion: decision,
        verificada: decision === 'aprobado',
      },
      { new: true }
    ).select('-password')

    if (!usuaria) return res.status(404).json({ mensaje: 'Usuaria no encontrada' })
    res.json({ mensaje: `Verificación ${decision}`, usuaria })
  } catch (e) {
    res.status(500).json({ mensaje: 'Error al verificar', error: e.message })
  }
})

// DELETE /api/admin/usuarias/:id — eliminar cuenta (soft delete = desactivar)
// Nunca borramos permanentemente, solo desactivamos
router.delete('/usuarias/:id', async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.params.id, { activa: false })
    res.json({ mensaje: 'Cuenta desactivada correctamente' })
  } catch (e) {
    res.status(500).json({ mensaje: 'Error al desactivar cuenta', error: e.message })
  }
})


// ── RESERVAS ──────────────────────────────────────────────────────────────────

// GET /api/admin/reservas — ver todas las reservas
router.get('/reservas', async (req, res) => {
  try {
    const reservas = await Booking.find()
      .populate('clienta', 'nombre apellido email')
      .populate({ path: 'trabajadora', populate: { path: 'usuario', select: 'nombre apellido email' } })
      .sort({ createdAt: -1 })
      .limit(200)
    res.json(reservas)
  } catch (e) {
    res.status(500).json({ mensaje: 'Error al obtener reservas', error: e.message })
  }
})


// ── PERFILES DE TRABAJADORAS ──────────────────────────────────────────────────

// GET /api/admin/perfiles — listar perfiles profesionales
router.get('/perfiles', async (req, res) => {
  try {
    const perfiles = await WorkerProfile.find()
      .populate('usuario', 'nombre apellido email verificada estadoVerificacion activa')
      .sort({ createdAt: -1 })
    res.json(perfiles)
  } catch (e) {
    res.status(500).json({ mensaje: 'Error al listar perfiles', error: e.message })
  }
})

// PATCH /api/admin/perfiles/:id — editar perfil profesional
router.patch('/perfiles/:id', async (req, res) => {
  try {
    // Único set editable por el admin. NUNCA: usuario (dueño), indiceConfianza,
    // serviciosCompletados, tasaRespuesta, certificadaChilevalora, metricas
    // → son derivados/calculados por el sistema.
    const CAMPOS_EDITABLES = [
      'categoria', 'subcategoria', 'descripcion',
      'tarifaHora', 'modalidad', 'nivelExperiencia', 'disponible',
    ]

    const cambios = {}
    for (const campo of CAMPOS_EDITABLES) {
      if (req.body[campo] !== undefined) cambios[campo] = req.body[campo]
    }

    const actualizado = await WorkerProfile.findByIdAndUpdate(
      req.params.id,
      cambios,
      { new: true, runValidators: true }
    )
    if (!actualizado) return res.status(404).json({ mensaje: 'Perfil no encontrado' })
    res.json(actualizado)
  } catch (e) {
    if (e.name === 'ValidationError') {
      const primerError = Object.values(e.errors)[0]
      return res.status(400).json({ mensaje: primerError.message })
    }
    res.status(500).json({ mensaje: 'Error al actualizar perfil', error: e.message })
  }
})


// ── SUGERENCIAS Y RECLAMOS ────────────────────────────────────────────────────

// GET /api/admin/sugerencias — listar todos los mensajes
router.get('/sugerencias', async (req, res) => {
  try {
    const items = await Suggestion.find().sort({ creadoEn: -1 }).limit(500)
    res.json(items)
  } catch (e) {
    res.status(500).json({ mensaje: 'Error al obtener sugerencias', error: e.message })
  }
})

// PUT /api/admin/sugerencias/:id/leido — marcar como leído
router.put('/sugerencias/:id/leido', async (req, res) => {
  try {
    const item = await Suggestion.findByIdAndUpdate(
      req.params.id,
      { estado: 'leido' },
      { new: true }
    )
    if (!item) return res.status(404).json({ mensaje: 'Mensaje no encontrado' })
    res.json(item)
  } catch (e) {
    res.status(500).json({ mensaje: 'Error al actualizar estado', error: e.message })
  }
})

// PUT /api/admin/sugerencias/:id/resuelto — marcar como resuelto
router.put('/sugerencias/:id/resuelto', async (req, res) => {
  try {
    const item = await Suggestion.findByIdAndUpdate(
      req.params.id,
      { estado: 'resuelto' },
      { new: true }
    )
    if (!item) return res.status(404).json({ mensaje: 'Mensaje no encontrado' })
    res.json(item)
  } catch (e) {
    res.status(500).json({ mensaje: 'Error al actualizar estado', error: e.message })
  }
})


export default router
