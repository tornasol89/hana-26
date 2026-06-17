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

/**
 * @openapi
 * /api/messages/no-leidos:
 *   get:
 *     tags: [Messages]
 *     summary: Contador y lista de reservas con mensajes no leídos
 *     description: >
 *       Devuelve el total de mensajes no leídos por la usuaria logueada y un
 *       desglose por reserva. Considera solo mensajes de otros participantes.
 *     responses:
 *       200:
 *         description: Resumen de no leídos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 count: { type: integer, example: 3 }
 *                 reservas:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:      { type: string, description: 'ObjectId de la reserva' }
 *                       servicio: { type: string }
 *                       count:    { type: integer }
 *       401:
 *         description: Token requerido o inválido
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.get('/no-leidos', protegerRuta, async (req, res) => {
  try {
    let filtroReservas = { clienta: req.usuario.id }

    if (req.usuario.tipo === 'trabajadora') {
      const perfil = await WorkerProfile.findOne({ usuario: req.usuario.id })
      if (!perfil) return res.json({ count: 0, reservas: [] })
      filtroReservas = { trabajadora: perfil._id }
    }

    const reservas   = await Booking.find(filtroReservas).select('_id servicio')
    const reservaIds = reservas.map(r => r._id)

    // Agrupar mensajes no leídos por reserva
    const grupos = await Message.aggregate([
      {
        $match: {
          reserva:  { $in: reservaIds },
          autor:    { $ne: req.usuario._id },
          leidoPor: { $not: { $elemMatch: { $eq: req.usuario._id } } },
        },
      },
      { $group: { _id: '$reserva', count: { $sum: 1 } } },
    ])

    // Mapear _id de reserva a su nombre de servicio
    const reservaMap = Object.fromEntries(reservas.map(r => [r._id.toString(), r.servicio]))
    const reservasConMensajes = grupos.map(g => ({
      _id:      g._id,
      servicio: reservaMap[g._id.toString()] ?? 'Reserva',
      count:    g.count,
    }))

    res.json({ count: grupos.reduce((s, g) => s + g.count, 0), reservas: reservasConMensajes })
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al contar no leídos', error: error.message })
  }
})

/**
 * @openapi
 * /api/messages/{reservaId}:
 *   get:
 *     tags: [Messages]
 *     summary: Obtiene los mensajes de una reserva
 *     description: Solo participantes (clienta o trabajadora) de la reserva. Orden cronológico ascendente.
 *     parameters:
 *       - in: path
 *         name: reservaId
 *         required: true
 *         schema: { type: string }
 *         description: ObjectId de la reserva
 *     responses:
 *       200:
 *         description: Lista de mensajes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/Message' }
 *       401:
 *         description: Token requerido o inválido
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       403:
 *         description: No tienes acceso a esta conversación
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
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

/**
 * @openapi
 * /api/messages/{reservaId}:
 *   post:
 *     tags: [Messages]
 *     summary: Envía un mensaje en una reserva
 *     description: >
 *       Solo participantes. El chat se habilita cuando la reserva está aceptada;
 *       no se puede chatear en reservas pendientes ni rechazadas.
 *     parameters:
 *       - in: path
 *         name: reservaId
 *         required: true
 *         schema: { type: string }
 *         description: ObjectId de la reserva
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [texto]
 *             properties:
 *               texto: { type: string, example: 'Hola, ¿confirmamos la hora?' }
 *     responses:
 *       201:
 *         description: Mensaje creado (con autor populado)
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Message' }
 *       400:
 *         description: Mensaje vacío, o reserva pendiente/rechazada
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       401:
 *         description: Token requerido o inválido
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       403:
 *         description: No tienes acceso a esta conversación
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
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

/**
 * @openapi
 * /api/messages/{reservaId}/leer:
 *   put:
 *     tags: [Messages]
 *     summary: Marca como leídos los mensajes de una reserva
 *     description: >
 *       Marca como leídos por el usuario logueado todos los mensajes de la reserva
 *       escritos por la otra parte que aún no estaban leídos.
 *     parameters:
 *       - in: path
 *         name: reservaId
 *         required: true
 *         schema: { type: string }
 *         description: ObjectId de la reserva
 *     responses:
 *       200:
 *         description: Mensajes marcados como leídos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok: { type: boolean, example: true }
 *       401:
 *         description: Token requerido o inválido
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       403:
 *         description: No tienes acceso a esta conversación
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
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