import express from 'express'
import PortfolioItem from '../models/PortfolioItem.js'
import WorkerProfile from '../models/WorkerProfile.js'
import Booking from '../models/Booking.js'
import protegerRuta from '../middleware/auth.js'
import { uploadPortfolio } from '../config/cloudinary.js'

const router = express.Router()

// ─── POST /api/portfolio ─────────────────────────────────────────────────────
// Trabajadora sube una foto de portafolio con título y descripción
// Campo imagen: "foto" (multipart/form-data)
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

// ─── GET /api/portfolio/mis-items ─────────────────────────────────────────────
// Trabajadora autenticada ve sus propios items (con estado de respaldo)
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

// ─── GET /api/portfolio/para-respaldar ────────────────────────────────────────
// Clienta autenticada ve los items que puede respaldar (vinculados a sus reservas completadas)
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

// ─── GET /api/portfolio/worker/:workerProfileId ───────────────────────────────
// Público: obtener portafolio de una trabajadora
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

// ─── DELETE /api/portfolio/:id ────────────────────────────────────────────────
// Trabajadora elimina su propio item
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

// ─── POST /api/portfolio/:id/respaldar ────────────────────────────────────────
// Clienta respalda un item del portafolio (debe tener reserva completada vinculada)
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
