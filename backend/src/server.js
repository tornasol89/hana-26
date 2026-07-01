import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import helmet from 'helmet'
import dotenv from 'dotenv'
import { connectDB } from './config/db.js'
import authRoutes    from './routes/auth.js'
import workerRoutes  from './routes/workers.js'
import bookingRoutes from './routes/bookings.js'
import reviewRoutes  from './routes/reviews.js'
import messageRoutes from './routes/messages.js'
import adminRoutes       from './routes/admin.js'
import statsRoutes       from './routes/stats.js'
import portfolioRoutes   from './routes/portfolio.js'
import sugerenciasRoutes from './routes/sugerencias.js'
import { limiterGeneral } from './middleware/rateLimit.js'
import { notFound, errorHandler } from './middleware/errorHandler.js';

dotenv.config()

const app = express()

app.set('trust proxy', 1)

app.set('trust proxy', 1)

const allowedOrigins = [
  'http://localhost:8080',
  'http://localhost:5173',
  process.env.FRONTEND_URL, // para producción
].filter(Boolean) 



app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}))


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

app.use(notFound);      // 404 para rutas no existentes
app.use(errorHandler);

app.use('/api', limiterGeneral)

// Rutas
app.use('/api/auth',     authRoutes)
app.use('/api/workers',  workerRoutes)
app.use('/api/bookings', bookingRoutes)
app.use('/api/reviews',  reviewRoutes)
app.use('/api/messages', messageRoutes)
app.use('/api/admin',       adminRoutes)
app.use('/api/stats',       statsRoutes)
app.use('/api/portfolio',   portfolioRoutes)
app.use('/api/sugerencias', sugerenciasRoutes)

app.get('/', (req, res) => res.json({ mensaje: 'API de Hana funcionando ✅' }))

app.get('/api/health', (req, res) => {
  const dbState = mongoose.connection.readyState
  // 0=desconectado, 1=conectado, 2=conectando, 3=desconectando
  res.json({
    status: dbState === 1 ? 'ok' : 'error',
    db: dbState === 1 ? 'connected' : 'disconnected',
    dbState,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  })
})

const PORT = process.env.PORT || 5000

connectDB()
  .then(() => {
    console.log('📦 Conectado a DB:', mongoose.connection.name)
    const server = app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT} ✅`))
    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`\n❌ Puerto ${PORT} ya está en uso. Cierra el proceso que lo ocupa y reinicia.\n`)
      } else {
        console.error('Error del servidor:', err)
      }
      process.exit(1)
    })
  })
  .catch(error => {
    console.error('Error al conectar la base de datos:', error)
    process.exit(1)
  })
