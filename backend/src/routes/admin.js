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

// ── DISPUTAS ──────────────────────────────────────────────────────────────────

/**
 * @openapi
 * /api/admin/disputas:
 *   get:
 *     tags: [Admin]
 *     summary: Lista todas las reservas en disputa
 *     description: Requiere rol admin. Ordenadas por fecha de creación de la disputa (desc).
 *     responses:
 *       200:
 *         description: Reservas en disputa
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/Booking' }
 *       401:
 *         description: Token requerido o inválido
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       403:
 *         description: Acceso restringido a administradoras
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.get('/disputas', async (req, res) => {
  try {
    const disputas = await Booking.find({ estado: 'en_disputa' })
      .populate('clienta', 'nombre apellido email foto')
      .populate({ path: 'trabajadora', populate: { path: 'usuario', select: 'nombre apellido email foto' } })
      .sort({ 'disputa.creadaEn': -1 })
    res.json(disputas)
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener disputas', error: error.message })
  }
})

/**
 * @openapi
 * /api/admin/bookings/{id}/resolver-disputa:
 *   put:
 *     tags: [Admin]
 *     summary: Resuelve una disputa de una reserva
 *     description: >
 *       Requiere rol admin. Según la acción, fuerza el estado de la reserva.
 *       Solo aplica sobre reservas en estado "en_disputa".
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: ObjectId de la reserva
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [accion]
 *             properties:
 *               accion:
 *                 type: string
 *                 enum: [confirmar_inicio, confirmar_fin, cancelar, reactivar]
 *                 description: >
 *                   confirmar_inicio → en_curso; confirmar_fin → completada;
 *                   cancelar → cancelada; reactivar → vuelve al estado previo según la fase
 *               nota:
 *                 type: string
 *                 description: Nota opcional del admin (se guarda como motivoClienta si está vacío)
 *     responses:
 *       200:
 *         description: Disputa resuelta (reserva actualizada y populada)
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Booking' }
 *       400:
 *         description: Acción inválida o la reserva no está en disputa
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       401:
 *         description: Token requerido o inválido
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       403:
 *         description: Acceso restringido a administradoras
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       404:
 *         description: Reserva no encontrada
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
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
    res.status(500).json({ mensaje: 'Error al resolver disputa', error: error.message })
  }
})

// ── DASHBOARD ─────────────────────────────────────────────────────────────────

/**
 * @openapi
 * /api/admin/stats:
 *   get:
 *     tags: [Admin]
 *     summary: Resumen general y métricas de negocio para el dashboard
 *     description: Requiere rol admin. Combina conteos y agregaciones en una sola respuesta.
 *     responses:
 *       200:
 *         description: Estadísticas del dashboard
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalUsuarias:      { type: integer }
 *                 totalTrabajadoras:  { type: integer }
 *                 totalClientas:      { type: integer }
 *                 totalReservas:      { type: integer }
 *                 pendientesVerif:    { type: integer }
 *                 reservasUltimos30:  { type: integer }
 *                 reservasPorEstado:      { $ref: '#/components/schemas/AggregacionConteo' }
 *                 categoriasTrabajadoras: { $ref: '#/components/schemas/AggregacionConteo' }
 *                 categoriasReservas:     { $ref: '#/components/schemas/AggregacionConteo' }
 *                 regionesDemanda:        { $ref: '#/components/schemas/AggregacionConteo' }
 *                 regionesTrabajadoras:   { $ref: '#/components/schemas/AggregacionConteo' }
 *       401:
 *         description: Token requerido o inválido
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       403:
 *         description: Acceso restringido a administradoras
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
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

/**
 * @openapi
 * /api/admin/usuarias:
 *   get:
 *     tags: [Admin]
 *     summary: Lista usuarias con filtros opcionales
 *     description: Requiere rol admin. Excluye admins. Máximo 100 resultados.
 *     parameters:
 *       - in: query
 *         name: tipo
 *         schema: { type: string, enum: [clienta, trabajadora] }
 *       - in: query
 *         name: verificacion
 *         schema: { type: string, example: enviado }
 *         description: Filtra por estadoVerificacion
 *       - in: query
 *         name: activa
 *         schema: { type: boolean }
 *       - in: query
 *         name: q
 *         schema: { type: string }
 *         description: Búsqueda por nombre, apellido, email o RUT (case-insensitive)
 *     responses:
 *       200:
 *         description: Lista de usuarias (sin password)
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/Usuario' }
 *       401:
 *         description: Token requerido o inválido
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       403:
 *         description: Acceso restringido a administradoras
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
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

/**
 * @openapi
 * /api/admin/usuarias/{id}:
 *   get:
 *     tags: [Admin]
 *     summary: Detalle de una usuaria (incluye su perfil si es trabajadora)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Detalle de la usuaria
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 usuaria: { $ref: '#/components/schemas/Usuario' }
 *                 perfil:
 *                   oneOf:
 *                     - { $ref: '#/components/schemas/WorkerProfile' }
 *                     - { type: 'null' }
 *       401:
 *         description: Token requerido o inválido
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       403:
 *         description: Acceso restringido a administradoras
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       404:
 *         description: Usuaria no encontrada
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
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

/**
 * @openapi
 * /api/admin/usuarias/{id}:
 *   patch:
 *     tags: [Admin]
 *     summary: Edita campos de una usuaria
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:             { type: string }
 *               apellido:           { type: string }
 *               region:             { type: string }
 *               comuna:             { type: string }
 *               activa:             { type: boolean }
 *               notasAdmin:         { type: string }
 *               estadoVerificacion: { type: string }
 *     responses:
 *       200:
 *         description: Usuaria actualizada (sin password)
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Usuario' }
 *       401:
 *         description: Token requerido o inválido
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       403:
 *         description: Acceso restringido a administradoras
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       404:
 *         description: Usuaria no encontrada
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
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

/**
 * @openapi
 * /api/admin/usuarias/{id}/verificar:
 *   patch:
 *     tags: [Admin]
 *     summary: Aprueba o rechaza la verificación de una usuaria
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [decision]
 *             properties:
 *               decision:
 *                 type: string
 *                 enum: [aprobado, rechazado]
 *     responses:
 *       200:
 *         description: Verificación actualizada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje: { type: string, example: 'Verificación aprobado' }
 *                 usuaria: { $ref: '#/components/schemas/Usuario' }
 *       400:
 *         description: decision debe ser 'aprobado' o 'rechazado'
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       401:
 *         description: Token requerido o inválido
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       403:
 *         description: Acceso restringido a administradoras
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       404:
 *         description: Usuaria no encontrada
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
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

/**
 * @openapi
 * /api/admin/usuarias/{id}:
 *   delete:
 *     tags: [Admin]
 *     summary: Desactiva una cuenta (soft delete)
 *     description: Nunca borra permanentemente; solo marca activa = false.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Cuenta desactivada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje: { type: string, example: 'Cuenta desactivada correctamente' }
 *       401:
 *         description: Token requerido o inválido
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       403:
 *         description: Acceso restringido a administradoras
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.delete('/usuarias/:id', async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.params.id, { activa: false })
    res.json({ mensaje: 'Cuenta desactivada correctamente' })
  } catch (e) {
    res.status(500).json({ mensaje: 'Error al desactivar cuenta', error: e.message })
  }
})

// ── RESERVAS ──────────────────────────────────────────────────────────────────

/**
 * @openapi
 * /api/admin/reservas:
 *   get:
 *     tags: [Admin]
 *     summary: Lista todas las reservas
 *     description: Requiere rol admin. Máximo 200 resultados, ordenadas por creación (desc).
 *     responses:
 *       200:
 *         description: Lista de reservas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/Booking' }
 *       401:
 *         description: Token requerido o inválido
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       403:
 *         description: Acceso restringido a administradoras
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
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

/**
 * @openapi
 * /api/admin/perfiles:
 *   get:
 *     tags: [Admin]
 *     summary: Lista los perfiles profesionales
 *     responses:
 *       200:
 *         description: Lista de perfiles (con usuario populado)
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/WorkerProfile' }
 *       401:
 *         description: Token requerido o inválido
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       403:
 *         description: Acceso restringido a administradoras
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
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

/**
 * @openapi
 * /api/admin/perfiles/{id}:
 *   patch:
 *     tags: [Admin]
 *     summary: Edita un perfil profesional
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/WorkerProfile' }
 *     responses:
 *       200:
 *         description: Perfil actualizado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/WorkerProfile' }
 *       401:
 *         description: Token requerido o inválido
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       403:
 *         description: Acceso restringido a administradoras
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       404:
 *         description: Perfil no encontrado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
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