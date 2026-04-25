import express from 'express'
import WorkerProfile from '../models/WorkerProfile.js'
import Review from '../models/Review.js'
import Booking from '../models/Booking.js'
import protegerRuta from '../middleware/auth.js'
import mongoose from 'mongoose'

const router = express.Router()

// GET /api/workers — listar con filtros opcionales
router.get('/', async (req, res) => {
  try {
    const { categoria, subcategoria, region } = req.query
    const filtro = {}
    if (categoria)    filtro.categoria    = categoria
    if (subcategoria) filtro.subcategoria = subcategoria

    const perfiles = await WorkerProfile.find(filtro)
      .populate('usuario', 'nombre apellido foto region comuna verificada activa')

    const resultado = region
      ? perfiles.filter(p => p.usuario?.region === region && p.usuario?.activa !== false)
      : perfiles.filter(p => p.usuario?.activa !== false)

    res.json(resultado)
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener trabajadoras', error: error.message })
  }
})

// ✅ NUEVA: GET /api/workers/mi-perfil — perfil de la trabajadora logueada
// Debe ir ANTES de /:id para que Express no confunda "mi-perfil" con un ID
router.get('/mi-perfil', protegerRuta, async (req, res) => {
  try {
    const perfil = await WorkerProfile.findOne({ usuario: req.usuario.id })
      .populate('usuario', 'nombre apellido foto region comuna verificada email rut')

    if (!perfil) {
      return res.status(404).json({ mensaje: 'No tienes un perfil profesional creado aún' })
    }
    res.json(perfil)
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener tu perfil', error: error.message })
  }
})

// ✅ NUEVA: PUT /api/workers/mi-perfil — actualizar perfil propio
router.put('/mi-perfil', protegerRuta, async (req, res) => {
  try {
    const perfil = await WorkerProfile.findOne({ usuario: req.usuario.id })
    if (!perfil) return res.status(404).json({ mensaje: 'Perfil no encontrado' })

    const { categoria, subcategoria, descripcion, tarifaHora, modalidad, nivelExperiencia, disponible } = req.body

    const actualizado = await WorkerProfile.findByIdAndUpdate(
      perfil._id,
      { categoria, subcategoria, descripcion, tarifaHora, modalidad, nivelExperiencia, disponible },
      { new: true }
    ).populate('usuario', 'nombre apellido foto region comuna verificada email')

    res.json(actualizado)
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al actualizar perfil', error: error.message })
  }
})

// GET /api/workers/:id — perfil individual público con reseñas y métricas reales
router.get('/:id', async (req, res) => {
  try {
    const perfil = await WorkerProfile.findById(req.params.id)
      .populate('usuario', 'nombre apellido foto region comuna verificada')

    if (!perfil) return res.status(404).json({ mensaje: 'Perfil no encontrado' })

    // Reseñas recibidas por esta trabajadora (solo clienta→trabajadora)
    const reviews = await Review.find({
      destinataria: perfil.usuario._id,
      tipo: 'clienta_a_trabajadora',
    })
      .populate('autor', 'nombre apellido foto')
      .sort({ createdAt: -1 })

    const promedio = reviews.length
      ? parseFloat((reviews.reduce((acc, r) => acc + r.estrellas, 0) / reviews.length).toFixed(1))
      : 0

    // Promedios por métrica (en porcentaje sobre 100 para las barras)
    const metricasPromedio = { puntualidad: 0, confiabilidad: 0, calidad: 0, comunicacion: 0, precio: 0 }
    if (reviews.length > 0) {
      const keys = Object.keys(metricasPromedio)
      keys.forEach(k => {
        const vals = reviews.map(r => r.metricas?.[k] || 0).filter(v => v > 0)
        if (vals.length) {
          metricasPromedio[k] = Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 20)
        }
      })
    }

    // Servicios completados reales
    const serviciosCompletados = await Booking.countDocuments({
      trabajadora: perfil._id,
      estado: 'completada',
    })

    // Tasa de respuesta: reservas respondidas (aceptadas+rechazadas) / total recibidas
    const totalReservas = await Booking.countDocuments({ trabajadora: perfil._id })
    const respondidas   = await Booking.countDocuments({ trabajadora: perfil._id, estado: { $in: ['aceptada', 'rechazada', 'completada'] } })
    const tasaRespuesta = totalReservas > 0 ? Math.round((respondidas / totalReservas) * 100) : 100

    res.json({ perfil, reviews, promedio, metricasPromedio, serviciosCompletados, tasaRespuesta })
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener perfil', error: error.message })
  }
}) 

// GET /api/workers/:id/horarios-ocupados?fecha=YYYY-MM-DD
router.get('/:id/horarios-ocupados', async (req, res) => {
  try {
    const { fecha } = req.query
    if (!fecha) {
      return res.status(400).json({ mensaje: 'Falta el parámetro fecha (YYYY-MM-DD)' })
    }

    // Validar el id antes de query a Mongo
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ mensaje: 'ID de trabajadora inválido' })
    }

    const inicio = new Date(`${fecha}T00:00:00.000Z`)
    const fin    = new Date(`${fecha}T23:59:59.999Z`)
    if (isNaN(inicio.getTime())) {
      return res.status(400).json({ mensaje: 'Fecha inválida' })
    }

    const reservas = await Booking.find({
      trabajadora: new mongoose.Types.ObjectId(req.params.id),
      fecha: { $gte: inicio, $lte: fin },
      estado: { $in: ['pendiente', 'aceptada', 'completada'] },
    }).select('fecha').lean()

    const horasOcupadas = reservas
      .map(r => {
        if (!r.fecha) return null
        const local = new Date(r.fecha.getTime() - 3 * 60 * 60 * 1000)
        return local.toISOString().slice(11, 16)
      })
      .filter(Boolean)

    res.json({ horasOcupadas })
  } catch (error) {
    console.error('Error en horarios-ocupados:', error)
    res.status(500).json({ mensaje: 'Error al obtener horarios ocupados', error: error.message })
  }
})

// POST /api/workers — crear perfil (requiere login)
router.post('/', protegerRuta, async (req, res) => {
  try {
    const { categoria, subcategoria, descripcion, tarifaHora, modalidad, nivelExperiencia } = req.body

    const perfilExiste = await WorkerProfile.findOne({ usuario: req.usuario.id })
    if (perfilExiste) {
      return res.status(400).json({ mensaje: 'Ya tienes un perfil de trabajadora' })
    }

    const perfil = await WorkerProfile.create({
      usuario:          req.usuario.id,
      categoria,
      subcategoria:     subcategoria     || '',
      descripcion:      descripcion      || '',
      tarifaHora:       tarifaHora       || 0,
      modalidad:        modalidad        || '',
      nivelExperiencia: nivelExperiencia || '',
    })

    res.status(201).json(perfil)
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al crear perfil', error: error.message })
  }
})

// PUT /api/workers/:id — actualizar por ID (requiere ser dueña)
router.put('/:id', protegerRuta, async (req, res) => {
  try {
    const perfil = await WorkerProfile.findById(req.params.id)
    if (!perfil) return res.status(404).json({ mensaje: 'Perfil no encontrado' })

    if (perfil.usuario.toString() !== req.usuario.id) {
      return res.status(403).json({ mensaje: 'No tienes permiso para editar este perfil' })
    }

    const actualizado = await WorkerProfile.findByIdAndUpdate(req.params.id, req.body, { new: true })
    res.json(actualizado)
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al actualizar perfil', error: error.message })
  }
})

export default router
