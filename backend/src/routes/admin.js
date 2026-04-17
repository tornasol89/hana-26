import express from 'express'
import bcrypt from 'bcryptjs'
import User from '../models/User.js'
import WorkerProfile from '../models/WorkerProfile.js'
import Booking from '../models/Booking.js'
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
      User.countDocuments({ estadoVerificacion: 'enviado' }),

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
    const actualizado = await WorkerProfile.findByIdAndUpdate(
      req.params.id, req.body, { new: true }
    )
    if (!actualizado) return res.status(404).json({ mensaje: 'Perfil no encontrado' })
    res.json(actualizado)
  } catch (e) {
    res.status(500).json({ mensaje: 'Error al actualizar perfil', error: e.message })
  }
})


export default router
