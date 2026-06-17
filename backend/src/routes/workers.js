import express from 'express'
import WorkerProfile from '../models/WorkerProfile.js'
import Review from '../models/Review.js'
import Booking from '../models/Booking.js'
import protegerRuta from '../middleware/auth.js'
import mongoose from 'mongoose'
import { uploadCertificado } from '../config/cloudinary.js'

function esChilevalora(institucion = '') {
  return institucion.trim().toLowerCase().includes('chilevalora')
}

const router = express.Router()

/**
 * @openapi
 * /api/workers:
 *   get:
 *     tags: [Workers]
 *     summary: Lista perfiles profesionales con filtros opcionales
 *     description: >
 *       Endpoint público. Filtra por categoría y subcategoría a nivel de query
 *       de Mongo, y por región en memoria. Excluye usuarias desactivadas (activa = false).
 *     security: []
 *     parameters:
 *       - in: query
 *         name: categoria
 *         schema: { type: string }
 *         description: Categoría exacta (ver enum en el schema WorkerProfile)
 *       - in: query
 *         name: subcategoria
 *         schema: { type: string }
 *       - in: query
 *         name: region
 *         schema: { type: string }
 *         description: Filtra por la región de la usuaria
 *     responses:
 *       200:
 *         description: Lista de perfiles (con usuario populado)
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/WorkerProfile' }
 */
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

/**
 * @openapi
 * /api/workers/{id}/horarios-ocupados:
 *   get:
 *     tags: [Workers]
 *     summary: Horas ya reservadas de una trabajadora en una fecha
 *     description: >
 *       Endpoint público de solo lectura. Devuelve las horas tomadas (estados
 *       pendiente/aceptada/completada) en hora local de Chile (UTC-3). No impide
 *       crear reservas en conflicto (ver deuda anti-overbook).
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: ObjectId del WorkerProfile
 *       - in: query
 *         name: fecha
 *         required: true
 *         schema: { type: string, format: date }
 *         description: Día a consultar en formato YYYY-MM-DD
 *     responses:
 *       200:
 *         description: Horas ocupadas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 horasOcupadas:
 *                   type: array
 *                   items: { type: string, example: '14:00' }
 *       400:
 *         description: Falta fecha, fecha inválida o ID inválido
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.get('/:id/horarios-ocupados', async (req, res) => {
  try {
    const { fecha } = req.query
    if (!fecha) {
      return res.status(400).json({ mensaje: 'Falta el parámetro fecha (YYYY-MM-DD)' })
    }

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

/**
 * @openapi
 * /api/workers/mi-perfil:
 *   get:
 *     tags: [Workers]
 *     summary: Perfil profesional de la trabajadora logueada
 *     responses:
 *       200:
 *         description: Perfil propio (con usuario populado)
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/WorkerProfile' }
 *       401:
 *         description: Token requerido o inválido
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       404:
 *         description: No tienes un perfil profesional creado aún
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
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

/**
 * @openapi
 * /api/workers/mi-perfil:
 *   put:
 *     tags: [Workers]
 *     summary: Actualiza el perfil profesional propio
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               categoria:        { type: string }
 *               subcategoria:     { type: string }
 *               descripcion:      { type: string }
 *               tarifaHora:       { type: number }
 *               modalidad:        { type: string, enum: ['A domicilio', 'Remoto', 'Retiro y entrega', ''] }
 *               nivelExperiencia: { type: string, enum: ['Menos de 1 año', '1 a 3 años', '3 a 5 años', 'Más de 5 años', ''] }
 *               disponible:       { type: boolean }
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
 *       404:
 *         description: Perfil no encontrado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
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

/**
 * @openapi
 * /api/workers:
 *   post:
 *     tags: [Workers]
 *     summary: Crea el perfil profesional de la usuaria logueada
 *     description: Una usuaria solo puede tener un perfil de trabajadora.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [categoria]
 *             properties:
 *               categoria:        { type: string }
 *               subcategoria:     { type: string }
 *               descripcion:      { type: string }
 *               tarifaHora:       { type: number }
 *               modalidad:        { type: string }
 *               nivelExperiencia: { type: string }
 *     responses:
 *       201:
 *         description: Perfil creado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/WorkerProfile' }
 *       400:
 *         description: Ya tienes un perfil de trabajadora
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

/**
 * @openapi
 * /api/workers/mi-perfil/certificados:
 *   post:
 *     tags: [Workers]
 *     summary: Sube un certificado (con imagen) al perfil propio
 *     description: >
 *       La imagen se almacena en Cloudinary. Si la institución contiene
 *       "Chilevalora", el perfil se marca como certificadaChilevalora.
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [nombre, institucion]
 *             properties:
 *               nombre:      { type: string, example: 'Manicure profesional' }
 *               institucion: { type: string, example: 'Chilevalora' }
 *               imagen:
 *                 type: string
 *                 format: binary
 *                 description: Imagen del certificado (campo "imagen")
 *     responses:
 *       201:
 *         description: Certificado agregado (devuelve el perfil completo)
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/WorkerProfile' }
 *       400:
 *         description: Nombre e institución son obligatorios
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       401:
 *         description: Token requerido o inválido
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       404:
 *         description: Perfil no encontrado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
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
    res.status(500).json({ mensaje: 'Error al subir certificado', error: error.message })
  }
})

/**
 * @openapi
 * /api/workers/mi-perfil/certificados/{certId}:
 *   delete:
 *     tags: [Workers]
 *     summary: Elimina un certificado del perfil propio
 *     parameters:
 *       - in: path
 *         name: certId
 *         required: true
 *         schema: { type: string }
 *         description: ObjectId del certificado dentro del perfil
 *     responses:
 *       200:
 *         description: Certificado eliminado (devuelve el perfil actualizado)
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/WorkerProfile' }
 *       401:
 *         description: Token requerido o inválido
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       404:
 *         description: Perfil o certificado no encontrado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
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
    res.status(500).json({ mensaje: 'Error al eliminar certificado', error: error.message })
  }
})

/**
 * @openapi
 * /api/workers/{id}:
 *   get:
 *     tags: [Workers]
 *     summary: Perfil público de una trabajadora con reseñas y métricas
 *     description: >
 *       Endpoint público. Devuelve el perfil junto con las reseñas recibidas
 *       (solo clienta→trabajadora), el promedio de estrellas, los promedios por
 *       métrica (escalados a 0–100), servicios completados y tasa de respuesta.
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: ObjectId del WorkerProfile
 *     responses:
 *       200:
 *         description: Detalle del perfil
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 perfil:  { $ref: '#/components/schemas/WorkerProfile' }
 *                 reviews:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Review' }
 *                 promedio: { type: number, example: 4.7 }
 *                 metricasPromedio:
 *                   type: object
 *                   description: Promedios por métrica escalados a 0–100
 *                   properties:
 *                     puntualidad:   { type: integer }
 *                     confiabilidad: { type: integer }
 *                     calidad:       { type: integer }
 *                     comunicacion:  { type: integer }
 *                     precio:        { type: integer }
 *                 serviciosCompletados:   { type: integer }
 *                 tasaRespuesta:          { type: integer, example: 95 }
 *                 certificadaChilevalora: { type: boolean }
 *       404:
 *         description: Perfil no encontrado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
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

    const certificadaChilevalora = (perfil.certificados || []).some(c => esChilevalora(c.institucion))

    res.json({ perfil, reviews, promedio, metricasPromedio, serviciosCompletados, tasaRespuesta, certificadaChilevalora })
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener perfil', error: error.message })
  }
})

/**
 * @openapi
 * /api/workers/{id}:
 *   put:
 *     tags: [Workers]
 *     summary: Actualiza un perfil por ID (solo la dueña)
 *     description: Solo la usuaria dueña del perfil puede editarlo. Aplica req.body tal cual.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: ObjectId del WorkerProfile
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
 *         description: No tienes permiso para editar este perfil
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       404:
 *         description: Perfil no encontrado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
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