import Booking from '../../models/Booking.js'
import AppError from '../../utils/AppError.js'
import { rangoDiaLocalUTC, aHoraLocalHHMM } from '../../utils/timezone.js'
import { ESTADOS_QUE_OCUPAN } from './estados.js'

/**
 * Reserva que ocupa el slot exacto (trabajadora + fecha), o null.
 *
 * Hoy la ocupación es "match exacto de slot" porque el modelo solo guarda
 * la hora de inicio. Cuando exista duración (B9), ESTA es la única función
 * que cambia: pasa a detectar solape de intervalos. Rutas e índice no se enteran.
 */
export async function buscarConflicto({ trabajadora, fecha }) {
  if (!fecha) return null
  return Booking.findOne({
    trabajadora,
    fecha,
    estado: { $in: ESTADOS_QUE_OCUPAN },
  }).lean()
}

/**
 * Guard del camino de escritura: lanza AppError 409 si el slot está ocupado.
 * El errorHandler central lo traduce a la respuesta HTTP.
 */
export async function asegurarSlotLibre({ trabajadora, fecha }) {
  const conflicto = await buscarConflicto({ trabajadora, fecha })
  if (conflicto) {
    throw new AppError('Ese horario ya no está disponible. Elige otro.', 409)
  }
}

/**
 * Camino de lectura: horas HH:MM ocupadas de una trabajadora en un día
 * (en hora de Chile). Alimenta GET /workers/:id/horarios-ocupados.
 */
export async function obtenerHorasOcupadas({ trabajadora, fecha }) {
  const { inicio, fin } = rangoDiaLocalUTC(fecha)
  const reservas = await Booking.find({
    trabajadora,
    fecha: { $gte: inicio, $lte: fin },
    estado: { $in: ESTADOS_QUE_OCUPAN },
  }).select('fecha').lean()

  return reservas.map((r) => aHoraLocalHHMM(r.fecha)).filter(Boolean)
}