import express from 'express'
import WorkerProfile from '../models/WorkerProfile.js'
import Booking       from '../models/Booking.js'
import User          from '../models/User.js'

const router = express.Router()

/**
 * @openapi
 * /api/stats/publicas:
 *   get:
 *     tags: [Stats]
 *     summary: Estadísticas agregadas públicas (sin datos personales)
 *     description: >
 *       Endpoint público. Útil para que las trabajadoras decidan en qué áreas
 *       enfocarse: categorías con más trabajadoras y regiones con más demanda.
 *     security: []
 *     responses:
 *       200:
 *         description: Métricas agregadas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 categoriasTrabajadoras:
 *                   allOf:
 *                     - { $ref: '#/components/schemas/AggregacionConteo' }
 *                   description: Categorías con más trabajadoras (top 10)
 *                 regionesDemanda:
 *                   allOf:
 *                     - { $ref: '#/components/schemas/AggregacionConteo' }
 *                   description: Regiones con más clientas registradas (top 8)
 *       500:
 *         description: Error al obtener estadísticas
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
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