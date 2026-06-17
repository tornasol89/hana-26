import express from 'express'
import PortfolioItem from '../models/PortfolioItem.js'
import WorkerProfile from '../models/WorkerProfile.js'
import Booking from '../models/Booking.js'
import protegerRuta from '../middleware/auth.js'
import { uploadPortfolio } from '../config/cloudinary.js'

const router = express.Router()

/**
 * @openapi
 * /api/portfolio:
 *   post:
 *     tags: [Portfolio]
 *     summary: Sube un trabajo al portafolio (solo trabajadoras)
 *     description: >
 *       La imagen va en el campo "foto" (multipart). Opcionalmente se vincula a una
 *       reserva propia que esté completada. La imagen se almacena en Cloudinary.
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [foto, titulo]
 *             properties:
 *               foto:
 *                 type: string
 *                 format: binary
 *                 description: Imagen del trabajo (campo "foto")
 *               titulo:      { type: string, maxLength: 100 }
 *               descripcion: { type: string, maxLength: 300 }
 *               reservaId:   { type: string, description: 'ObjectId de una reserva propia completada (opcional)' }
 *     responses:
 *       201:
 *         description: Item creado (con reserva y respaldadaPor populados)
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/PortfolioItem' }
 *       400:
 *         description: Falta imagen o título, o la reserva no existe / no está completada
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       401:
 *         description: Token requerido o inválido
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       403:
 *         description: Solo las trabajadoras pueden subir portafolio
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       404:
 *         description: No tienes perfil de trabajadora
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.post('/', protegerRuta, uploadPortfolio.single('foto'), async (req, res) => {
  try {
    const rolesUsuario = [req.usuario.tipo, ...(req.usuario.rolesAdicionales || [])]
    if (!rolesUsuario.includes('trabajadora')) {
      return res.status(403).json({ mensaje: 'Solo las trabajadoras pueden subir portafolio' })
    }
    if (!req.file) {
      return res.status(400).json({ mensaje: 'Debes adjuntar una imagen' })
    }

    const { titulo, descripcion, reservaId } = req.body
    if (!titulo?.trim()) {
      return res.status(400).json({ mensaje: 'El título es obligatorio' })
    }

    const perfil = await WorkerProfile.findOne({ usuario: req.usuario.id })
    if (!perfil) {
      return res.status(404).json({ mensaje: 'No tienes perfil de trabajadora' })
    }

    // Validar reserva si se vincula
    let reservaValida = null
    if (reservaId) {
      const booking = await Booking.findOne({
        _id: reservaId,
        trabajadora: perfil._id,
        estado: 'completada',
      })
      if (!booking) {
        return res.status(400).json({ mensaje: 'Reserva no encontrada o no completada' })
      }
      reservaValida = reservaId
    }

    const item = await PortfolioItem.create({
      trabajadora: perfil._id,
      titulo: titulo.trim(),
      descripcion: descripcion?.trim() || '',
      fotoUrl: req.file.path,
      reserva: reservaValida,
    })

    const itemPoblado = await PortfolioItem.findById(item._id)
      .populate({ path: 'reserva', select: 'servicio clienta', populate: { path: 'clienta', select: 'nombre apellido foto verificada' } })
      .populate('respaldadaPor', 'nombre apellido foto verificada')

    res.status(201).json(itemPoblado)
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al subir portafolio', error: error.message })
  }
})

/**
 * @openapi
 * /api/portfolio/mis-items:
 *   get:
 *     tags: [Portfolio]
 *     summary: Items del portafolio de la trabajadora logueada
 *     description: Incluye el estado de respaldo de cada item. Ordenados por creación (desc).
 *     responses:
 *       200:
 *         description: Lista de items propios
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/PortfolioItem' }
 *       401:
 *         description: Token requerido o inválido
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.get('/mis-items', protegerRuta, async (req, res) => {
  try {
    const perfil = await WorkerProfile.findOne({ usuario: req.usuario.id })
    if (!perfil) return res.json([])

    const items = await PortfolioItem.find({ trabajadora: perfil._id })
      .populate({ path: 'reserva', select: 'servicio clienta', populate: { path: 'clienta', select: 'nombre apellido foto verificada' } })
      .populate('respaldadaPor', 'nombre apellido foto verificada')
      .sort({ createdAt: -1 })

    res.json(items)
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener portafolio', error: error.message })
  }
})

/**
 * @openapi
 * /api/portfolio/para-respaldar:
 *   get:
 *     tags: [Portfolio]
 *     summary: Items que la clienta logueada puede respaldar
 *     description: >
 *       Devuelve los items aún no respaldados que están vinculados a reservas
 *       completadas en las que la usuaria fue la clienta.
 *     responses:
 *       200:
 *         description: Lista de items pendientes de respaldo
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/PortfolioItem' }
 *       401:
 *         description: Token requerido o inválido
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.get('/para-respaldar', protegerRuta, async (req, res) => {
  try {
    // Obtener reservas completadas donde el usuario es la clienta
    const reservas = await Booking.find({
      clienta: req.usuario.id,
      estado: 'completada',
    }).select('_id')

    const ids = reservas.map(r => r._id)

    // Items vinculados a esas reservas y aún no respaldados
    const items = await PortfolioItem.find({
      reserva: { $in: ids },
      respaldada: false,
    })
      .populate({ path: 'reserva', select: 'servicio clienta fecha', populate: { path: 'clienta', select: 'nombre apellido' } })
      .populate({ path: 'trabajadora', populate: { path: 'usuario', select: 'nombre apellido foto' } })
      .sort({ createdAt: -1 })

    res.json(items)
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener items', error: error.message })
  }
})

/**
 * @openapi
 * /api/portfolio/worker/{workerProfileId}:
 *   get:
 *     tags: [Portfolio]
 *     summary: Portafolio público de una trabajadora
 *     description: Endpoint público. Los trabajos respaldados aparecen primero.
 *     security: []
 *     parameters:
 *       - in: path
 *         name: workerProfileId
 *         required: true
 *         schema: { type: string }
 *         description: ObjectId del WorkerProfile
 *     responses:
 *       200:
 *         description: Lista de items del portafolio
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/PortfolioItem' }
 */
router.get('/worker/:workerProfileId', async (req, res) => {
  try {
    const items = await PortfolioItem.find({ trabajadora: req.params.workerProfileId })
      .populate('respaldadaPor', 'nombre apellido foto verificada')
      .sort({ respaldada: -1, createdAt: -1 }) // respaldados primero

    res.json(items)
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener portafolio', error: error.message })
  }
})

/**
 * @openapi
 * /api/portfolio/{id}:
 *   delete:
 *     tags: [Portfolio]
 *     summary: Elimina un item del portafolio propio
 *     description: Solo la trabajadora dueña del item puede eliminarlo.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: ObjectId del item
 *     responses:
 *       200:
 *         description: Item eliminado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje: { type: string, example: 'Item eliminado' }
 *       401:
 *         description: Token requerido o inválido
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       403:
 *         description: Sin permiso (no tienes perfil de trabajadora)
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       404:
 *         description: Item no encontrado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.delete('/:id', protegerRuta, async (req, res) => {
  try {
    const perfil = await WorkerProfile.findOne({ usuario: req.usuario.id })
    if (!perfil) return res.status(403).json({ mensaje: 'Sin permiso' })

    const item = await PortfolioItem.findOne({ _id: req.params.id, trabajadora: perfil._id })
    if (!item) return res.status(404).json({ mensaje: 'Item no encontrado' })

    await item.deleteOne()
    res.json({ mensaje: 'Item eliminado' })
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al eliminar', error: error.message })
  }
})

/**
 * @openapi
 * /api/portfolio/{id}/respaldar:
 *   post:
 *     tags: [Portfolio]
 *     summary: La clienta respalda un trabajo del portafolio
 *     description: >
 *       El item debe tener una reserva completada vinculada y la usuaria debe ser
 *       la clienta de esa reserva. No se puede respaldar dos veces.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: ObjectId del item
 *     responses:
 *       200:
 *         description: Item respaldado (con respaldadaPor y reserva populados)
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/PortfolioItem' }
 *       400:
 *         description: Ya respaldado, sin reserva vinculada o reserva no completada
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       401:
 *         description: Token requerido o inválido
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       403:
 *         description: No eres la clienta de esta reserva
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       404:
 *         description: Item no encontrado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.post('/:id/respaldar', protegerRuta, async (req, res) => {
  try {
    const item = await PortfolioItem.findById(req.params.id).populate('reserva')
    if (!item) return res.status(404).json({ mensaje: 'Item no encontrado' })

    if (item.respaldada) {
      return res.status(400).json({ mensaje: 'Este trabajo ya fue respaldado' })
    }

    // Verificar que la clienta está vinculada a la reserva
    if (!item.reserva) {
      return res.status(400).json({ mensaje: 'Este item no está vinculado a ninguna reserva' })
    }

    if (item.reserva.clienta.toString() !== req.usuario.id) {
      return res.status(403).json({ mensaje: 'No eres la clienta de esta reserva' })
    }

    if (item.reserva.estado !== 'completada') {
      return res.status(400).json({ mensaje: 'Solo puedes respaldar trabajos de reservas completadas' })
    }

    item.respaldada = true
    item.respaldadaPor = req.usuario.id
    item.fechaRespaldo = new Date()
    await item.save()

    const itemActualizado = await PortfolioItem.findById(item._id)
      .populate('respaldadaPor', 'nombre apellido foto verificada')
      .populate({ path: 'reserva', select: 'servicio clienta', populate: { path: 'clienta', select: 'nombre apellido' } })

    res.json(itemActualizado)
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al respaldar', error: error.message })
  }
})

export default router