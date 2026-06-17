import express from 'express'
import Booking from '../models/Booking.js'
import WorkerProfile from '../models/WorkerProfile.js'
import protegerRuta from '../middleware/auth.js'

const router = express.Router()

/**
 * @openapi
 * /api/bookings:
 *   post:
 *     tags: [Bookings]
 *     summary: Crea una reserva (clienta logueada)
 *     description: >
 *       La reserva nace en estado "pendiente". Requiere indicar la trabajadora
 *       (ObjectId de su WorkerProfile), la región y la comuna del servicio.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [trabajadora, regionServicio, comunaServicio]
 *             properties:
 *               trabajadora:       { type: string, description: 'ObjectId del WorkerProfile' }
 *               servicio:          { type: string, example: 'Limpieza profunda', default: 'Servicio Hana' }
 *               fecha:             { type: string, format: date-time, nullable: true }
 *               notas:             { type: string, description: 'Se guarda en el campo descripcion' }
 *               regionServicio:    { type: string, example: 'Región Metropolitana' }
 *               comunaServicio:    { type: string, example: 'Ñuñoa' }
 *               direccionServicio: { type: string }
 *     responses:
 *       201:
 *         description: Reserva creada (con clienta y trabajadora populadas)
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Booking' }
 *       400:
 *         description: Falta trabajadora, región o comuna
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       401:
 *         description: Token requerido o inválido
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.post('/', protegerRuta, async (req, res) => {
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
    res.status(500).json({ mensaje: 'Error al crear reserva', error: error.message })
  }
})

/**
 * @openapi
 * /api/bookings/mis-reservas:
 *   get:
 *     tags: [Bookings]
 *     summary: Reservas de la usuaria logueada
 *     description: >
 *       Devuelve las reservas según el rol. Para perfiles duales se puede forzar
 *       la vista con ?modo=clienta|trabajadora. Si no se envía, usa el tipo del usuario.
 *     parameters:
 *       - in: query
 *         name: modo
 *         required: false
 *         schema:
 *           type: string
 *           enum: [clienta, trabajadora]
 *         description: Vista a usar para perfiles duales
 *     responses:
 *       200:
 *         description: Lista de reservas (ordenadas por fecha de creación desc)
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
 */
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
    res.status(500).json({ mensaje: 'Error al obtener reservas', error: error.message })
  }
})

/**
 * @openapi
 * /api/bookings/{id}/aceptar:
 *   put:
 *     tags: [Bookings]
 *     summary: La trabajadora acepta una reserva
 *     description: Solo la trabajadora dueña del perfil asociado puede aceptar. Pasa el estado a "aceptada".
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: ObjectId de la reserva
 *     responses:
 *       200:
 *         description: Reserva aceptada
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Booking' }
 *       401:
 *         description: Token requerido o inválido
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       403:
 *         description: No tienes permiso para aceptar esta reserva
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       404:
 *         description: Reserva no encontrada
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
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

/**
 * @openapi
 * /api/bookings/{id}/rechazar:
 *   put:
 *     tags: [Bookings]
 *     summary: La trabajadora rechaza una reserva
 *     description: Solo la trabajadora dueña del perfil asociado puede rechazar. Pasa el estado a "rechazada".
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: ObjectId de la reserva
 *     responses:
 *       200:
 *         description: Reserva rechazada
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Booking' }
 *       401:
 *         description: Token requerido o inválido
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       403:
 *         description: No tienes permiso para rechazar esta reserva
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       404:
 *         description: Reserva no encontrada
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
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

/**
 * @openapi
 * /api/bookings/{id}/confirmar-inicio:
 *   put:
 *     tags: [Bookings]
 *     summary: Confirma el inicio del servicio (confirmación doble)
 *     description: >
 *       La trabajadora o la clienta confirman el inicio. Cuando ambas confirman,
 *       la reserva pasa a "en_curso" y se resuelve una eventual disputa de inicio.
 *       Solo válido sobre reservas en estado "aceptada" o "en_disputa".
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: ObjectId de la reserva
 *     responses:
 *       200:
 *         description: Inicio confirmado por la parte que llama
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Booking' }
 *       400:
 *         description: La reserva no está en un estado que permita confirmar inicio
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       401:
 *         description: Token requerido o inválido
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       403:
 *         description: El usuario no es participante de la reserva
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       404:
 *         description: Reserva no encontrada
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
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
    res.status(500).json({ mensaje: 'Error al confirmar inicio', error: error.message })
  }
})

/**
 * @openapi
 * /api/bookings/{id}/confirmar-fin:
 *   put:
 *     tags: [Bookings]
 *     summary: Confirma el fin del servicio (confirmación doble)
 *     description: >
 *       La trabajadora o la clienta confirman el fin. Cuando ambas confirman,
 *       la reserva pasa a "completada" y se resuelve una eventual disputa de fin.
 *       Solo válido sobre reservas en estado "en_curso" o "en_disputa".
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: ObjectId de la reserva
 *     responses:
 *       200:
 *         description: Fin confirmado por la parte que llama
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Booking' }
 *       400:
 *         description: La reserva no está en un estado que permita confirmar fin
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       401:
 *         description: Token requerido o inválido
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       403:
 *         description: El usuario no es participante de la reserva
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       404:
 *         description: Reserva no encontrada
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
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
    res.status(500).json({ mensaje: 'Error al confirmar fin', error: error.message })
  }
})

/**
 * @openapi
 * /api/bookings/{id}/disputar:
 *   put:
 *     tags: [Bookings]
 *     summary: Abre o actualiza una disputa sobre la reserva
 *     description: >
 *       Marca la reserva como "en_disputa" y registra el motivo según quién llama
 *       (clienta o trabajadora). Solo válido en estados "aceptada", "en_curso" o "en_disputa".
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
 *             required: [fase, motivo]
 *             properties:
 *               fase:
 *                 type: string
 *                 enum: [inicio, fin]
 *                 description: Etapa del servicio en disputa
 *               motivo:
 *                 type: string
 *                 description: Explicación de lo ocurrido
 *     responses:
 *       200:
 *         description: Disputa creada o actualizada
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Booking' }
 *       400:
 *         description: fase inválida, motivo vacío o estado no permitido
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       401:
 *         description: Token requerido o inválido
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       403:
 *         description: El usuario no es participante de la reserva
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       404:
 *         description: Reserva no encontrada
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
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
    res.status(500).json({ mensaje: 'Error al crear disputa', error: error.message })
  }
})

/**
 * @openapi
 * /api/bookings/{id}/completar:
 *   put:
 *     tags: [Bookings]
 *     summary: Marca una reserva como completada
 *     description: >
 *       Cambia el estado a "completada".
 *       NOTA (deuda técnica #B2): actualmente no verifica que quien llama sea
 *       participante de la reserva. Documentado por el test CP-RT-07b.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: ObjectId de la reserva
 *     responses:
 *       200:
 *         description: Reserva completada
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Booking' }
 *       401:
 *         description: Token requerido o inválido
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       404:
 *         description: Reserva no encontrada
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
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