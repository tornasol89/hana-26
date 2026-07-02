import express from 'express'
import AppError from '../src/utils/AppError.js'
import { errorHandler, notFound } from '../src/middleware/errorHandler.js'

const app = express()

app.get('/simular-conflicto', (req, res, next) => {
  next(new AppError('Ese horario ya no está disponible. Elige otro.', 409))
})

app.use(notFound)
app.use(errorHandler)

const PORT = 5099
app.listen(PORT, () => {
  console.log(`✅ Servidor de prueba en http://localhost:${PORT}`)
  console.log(`   Corré en otra terminal: curl -i http://localhost:${PORT}/simular-conflicto`)
  console.log(`   Esperado: HTTP 409 y body { "mensaje": "Ese horario ya no está disponible. Elige otro." }`)
  console.log(`   Ctrl+C para cerrar.`)
})
