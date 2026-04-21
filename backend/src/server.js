import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { connectDB } from './config/db.js'
import authRoutes    from './routes/auth.js'
import workerRoutes  from './routes/workers.js'
import bookingRoutes from './routes/bookings.js'
import reviewRoutes  from './routes/reviews.js'
import messageRoutes from './routes/messages.js'
import adminRoutes   from './routes/admin.js'
import statsRoutes   from './routes/stats.js'
import mongoose from 'mongoose'

dotenv.config()

const app = express()

const allowedOrigins = [
  'http://localhost:8080',
  'http://localhost:5173',
  process.env.FRONTEND_URL, // para producción
].filter(Boolean)

app.use(cors({
  origin: (origin, callback) => {
    // Permitir requests sin origin (Postman, curl, server-to-server)
    if (!origin) return callback(null, true)
    if (allowedOrigins.includes(origin)) return callback(null, true)
    return callback(new Error('Origen no permitido por CORS'))
  },
  credentials: true,
}))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Rutas
app.use('/api/auth',     authRoutes)
app.use('/api/workers',  workerRoutes)
app.use('/api/bookings', bookingRoutes)
app.use('/api/reviews',  reviewRoutes)
app.use('/api/messages', messageRoutes)
app.use('/api/admin',    adminRoutes)
app.use('/api/stats',    statsRoutes)

app.get('/', (req, res) => res.json({ mensaje: 'API de Hana funcionando ✅' }))

const PORT = process.env.PORT || 5000

connectDB()
  .then(() => {
    console.log('📦 Conectado a DB:', mongoose.connection.name)
    app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`))
  })
  .catch(error => {
    console.error('Error al conectar la base de datos:', error)
    process.exit(1)
  })
