import express from 'express'
import WorkerProfile from '../models/WorkerProfile.js'
import Review from '../models/Review.js'
import Booking from '../models/Booking.js'
import protegerRuta from '../middleware/auth.js'
import mongoose from 'mongoose'
import { uploadCertificado } from '../config/cloudinary.js'
import { aHoraLocalHHMM, rangoDiaLocalUTC } from '../utils/timezone.js'

function esChilevalora(institucion = '') {
  return institucion.trim().toLowerCase().includes('chilevalora')
}

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
    res.status(500).json({ mensaje: 'Error al obtener trabajadoras' })
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
    res.status(500).json({ mensaje: 'Error al obtener tu perfil' })
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
    res.status(500).json({ mensaje: 'Error al actualizar perfil' })
  }
})

// GET /api/workers/featured — top 5 trabajadoras por índice de confianza
router.get('/featured', async (req, res) => {
  try {
    const perfiles = await WorkerProfile.find({ disponible: true })
      .populate('usuario', 'nombre apellido foto region verificada activa')
      .sort({ indiceConfianza: -1 })
      .limit(5)

    const resultado = perfiles.filter(p => p.usuario?.activa !== false)
    res.json(resultado)
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener destacadas' })
  }
})

// GET /api/workers/mi-disponibilidad — obtener horario semanal propio
router.get('/mi-disponibilidad', protegerRuta, async (req, res) => {
  try {
    const perfil = await WorkerProfile.findOne({ usuario: req.usuario.id }).select('horarioSemanal diasBloqueados')
    if (!perfil) return res.status(404).json({ mensaje: 'Perfil no encontrado' })
    res.json({ horarioSemanal: perfil.horarioSemanal, diasBloqueados: perfil.diasBloqueados ?? [] })
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener disponibilidad' })
  }
})

// PUT /api/workers/mi-disponibilidad — guardar horario semanal y/o días bloqueados
router.put('/mi-disponibilidad', protegerRuta, async (req, res) => {
  try {
    const { horarioSemanal, diasBloqueados } = req.body
    const perfil = await WorkerProfile.findOne({ usuario: req.usuario.id })
    if (!perfil) return res.status(404).json({ mensaje: 'Perfil no encontrado' })

    if (horarioSemanal !== undefined) {
      if (!Array.isArray(horarioSemanal) || horarioSemanal.length !== 7) {
        return res.status(400).json({ mensaje: 'horarioSemanal debe ser un array de 7 días' })
      }
      perfil.horarioSemanal = horarioSemanal
    }

    if (diasBloqueados !== undefined) {
      if (!Array.isArray(diasBloqueados)) {
        return res.status(400).json({ mensaje: 'diasBloqueados debe ser un array' })
      }
      const hoy = new Date().toISOString().slice(0, 10)
      perfil.diasBloqueados = diasBloqueados.filter(d => d >= hoy)
    }

    await perfil.save()
    res.json({ horarioSemanal: perfil.horarioSemanal, diasBloqueados: perfil.diasBloqueados })
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al guardar disponibilidad' })
  }
})

// GET /api/workers/:id — perfil individual público con reseñas y métricas reales
router.get('/:id', async (req, res) => {
  if (!req.params.id.match(/^[0-9a-fA-F]{24}$/))
    return res.status(400).json({ mensaje: 'ID inválido' })
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

    const certificadaChilevalora = (perfil.certificados || []).some(c => esChilevalora(c.institucion))

    res.json({ perfil, reviews, promedio, metricasPromedio, serviciosCompletados, tasaRespuesta, certificadaChilevalora })
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener perfil' })
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

    // Validación de formato (se mantiene igual que antes)
    const fechaValidacion = new Date(`${fecha}T00:00:00.000Z`)
    if (isNaN(fechaValidacion.getTime())) {
      return res.status(400).json({ mensaje: 'Fecha inválida' })
    }

    // Rango del día calendario en hora de Chile (no medianoche-a-medianoche UTC)
    const { inicio, fin } = rangoDiaLocalUTC(fecha)

    const reservas = await Booking.find({
      trabajadora: new mongoose.Types.ObjectId(req.params.id),
      fecha: { $gte: inicio, $lte: fin },
      estado: { $in: ['pendiente', 'aceptada', 'completada'] },
    }).select('fecha').lean()

    const horasOcupadas = reservas
      .map(r => aHoraLocalHHMM(r.fecha))
      .filter(Boolean)

    res.json({ horasOcupadas })
  } catch (error) {
    console.error('Error en horarios-ocupados:', error)
    res.status(500).json({ mensaje: 'Error al obtener horarios ocupados' })
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
    res.status(500).json({ mensaje: 'Error al crear perfil' })
  }
})

// POST /api/workers/mi-perfil/certificados — subir certificado con imagen
router.post('/mi-perfil/certificados', protegerRuta, uploadCertificado.single('imagen'), async (req, res) => {
  try {
    const perfil = await WorkerProfile.findOne({ usuario: req.usuario.id })
    if (!perfil) return res.status(404).json({ mensaje: 'Perfil no encontrado' })

    const { nombre, institucion } = req.body
    if (!nombre || !institucion) {
      return res.status(400).json({ mensaje: 'Nombre e institución son obligatorios' })
    }

    const nuevoCert = {
      nombre:    nombre.trim(),
      institucion: institucion.trim(),
      urlImagen: req.file?.path ?? '',
    }

    perfil.certificados.push(nuevoCert)
    perfil.certificadaChilevalora = perfil.certificados.some(c => esChilevalora(c.institucion))
    await perfil.save()

    res.status(201).json(perfil)
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al subir certificado' })
  }
})

// DELETE /api/workers/mi-perfil/certificados/:certId — eliminar certificado propio
router.delete('/mi-perfil/certificados/:certId', protegerRuta, async (req, res) => {
  try {
    const perfil = await WorkerProfile.findOne({ usuario: req.usuario.id })
    if (!perfil) return res.status(404).json({ mensaje: 'Perfil no encontrado' })

    const antes = perfil.certificados.length
    perfil.certificados = perfil.certificados.filter(
      c => c._id.toString() !== req.params.certId
    )

    if (perfil.certificados.length === antes) {
      return res.status(404).json({ mensaje: 'Certificado no encontrado' })
    }

    perfil.certificadaChilevalora = perfil.certificados.some(c => esChilevalora(c.institucion))
    await perfil.save()

    res.json(perfil)
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al eliminar certificado' })
  }
})



export default router