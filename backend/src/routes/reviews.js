import express from 'express'
import Review  from '../models/Review.js'
import Booking from '../models/Booking.js'
import WorkerProfile from '../models/WorkerProfile.js'
import protegerRuta from '../middleware/auth.js'

const router = express.Router()

/**
 * @openapi
 * /api/reviews:
 *   post:
 *     tags: [Reviews]
 *     summary: Crea una evaluación de una reserva
 *     description: >
 *       Requiere ser participante de la reserva (clienta o trabajadora) y que la
 *       reserva esté aceptada o completada. No permite auto-evaluación (incluidos
 *       perfiles duales) ni evaluar dos veces la misma reserva.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [reserva, destinataria, tipo, estrellas]
 *             properties:
 *               reserva:      { type: string, description: 'ObjectId de la Booking a evaluar' }
 *               destinataria: { type: string, description: 'ObjectId del usuario evaluado' }
 *               tipo:
 *                 type: string
 *                 enum: [clienta_a_trabajadora, trabajadora_a_clienta]
 *               estrellas:    { type: integer, minimum: 1, maximum: 5, example: 5 }
 *               comentario:   { type: string }
 *               metricas:     { $ref: '#/components/schemas/Metricas' }
 *     responses:
 *       201:
 *         description: Evaluación creada
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Review' }
 *       400:
 *         description: >
 *           Falta la reserva, estado no evaluable, auto-evaluación o evaluación duplicada
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       401:
 *         description: Token requerido o inválido
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       403:
 *         description: No eres participante de esta reserva
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       404:
 *         description: Reserva no encontrada
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
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

/**
 * @openapi
 * /api/reviews/reserva/{reservaId}:
 *   get:
 *     tags: [Reviews]
 *     summary: Indica si el usuario logueado ya evaluó una reserva
 *     parameters:
 *       - in: path
 *         name: reservaId
 *         required: true
 *         schema: { type: string }
 *         description: ObjectId de la reserva
 *     responses:
 *       200:
 *         description: Estado de evaluación del usuario para esa reserva
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 yaEvaluo: { type: boolean }
 *                 review:
 *                   oneOf:
 *                     - { $ref: '#/components/schemas/Review' }
 *                     - { type: 'null' }
 *       401:
 *         description: Token requerido o inválido
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
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

/**
 * @openapi
 * /api/reviews/{usuarioId}:
 *   get:
 *     tags: [Reviews]
 *     summary: Evaluaciones recibidas por una usuaria, con promedio
 *     description: Endpoint público. Devuelve el promedio de estrellas, el total y la lista de reseñas.
 *     security: []
 *     parameters:
 *       - in: path
 *         name: usuarioId
 *         required: true
 *         schema: { type: string }
 *         description: ObjectId del usuario evaluado (destinataria)
 *     responses:
 *       200:
 *         description: Resumen de evaluaciones
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 promedio:
 *                   type: string
 *                   description: Promedio con un decimal (string), o 0 si no hay reseñas
 *                   example: '4.7'
 *                 total: { type: integer, example: 12 }
 *                 reviews:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Review' }
 */
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