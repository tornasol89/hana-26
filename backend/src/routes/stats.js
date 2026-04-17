import express from 'express'
import WorkerProfile from '../models/WorkerProfile.js'
import Booking       from '../models/Booking.js'
import User          from '../models/User.js'

const router = express.Router()

/**
 * GET /api/stats/publicas
 * Estadísticas agregadas sin datos personales — visibles para trabajadoras logueadas y público.
 * Útil para que las trabajadoras decidan en qué áreas enfocarse.
 */
router.get('/publicas', async (req, res) => {
  try {
    const [categoriasTrabajadoras, regionesDemanda] = await Promise.all([
      // Qué categorías tienen más trabajadoras activas
      WorkerProfile.aggregate([
        { $group: { _id: '$categoria', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),

      // En qué regiones hay más clientas registradas
      User.aggregate([
        { $match: { tipo: 'clienta', region: { $ne: '' } } },
        { $group: { _id: '$region', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 8 },
      ]),
    ])

    res.json({ categoriasTrabajadoras, regionesDemanda })
  } catch (e) {
    res.status(500).json({ mensaje: 'Error al obtener estadísticas', error: e.message })
  }
})

export default router
