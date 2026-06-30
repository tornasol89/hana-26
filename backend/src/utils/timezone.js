// backend/src/utils/timezone.js
//
// Single source of truth para conversiones de hora local en Hana.
// Reemplaza el offset fijo "UTC-3" (bug #B8) por una conversión real
// usando la base de datos de zonas horarias de Intl, que ya conoce
// los cambios de horario de verano/invierno de Chile (America/Santiago).
//
// Por qué importaba: en invierno Chile está en UTC-4, no UTC-3. El
// código viejo (`fecha.getTime() - 3 * 60 * 60 * 1000`) quedaba mal
// una hora durante esa parte del año.

export const TIMEZONE_HANA = 'America/Santiago'

/**
 * Offset (en minutos) entre UTC y la hora local de Chile, válido en el
 * instante dado. Negativo cuando Chile va atrás de UTC (-180 = UTC-3 en
 * verano, -240 = UTC-4 en invierno).
 */
function offsetMinutosEnInstante(instanteUTC) {
  const dtf = new Intl.DateTimeFormat('en-US', {
    timeZone: TIMEZONE_HANA,
    hourCycle: 'h23',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  })

  const partes = Object.fromEntries(
    dtf.formatToParts(instanteUTC)
      .filter(p => p.type !== 'literal')
      .map(p => [p.type, p.value])
  )

  const comoSiFueraUTC = Date.UTC(
    partes.year, partes.month - 1, partes.day,
    partes.hour, partes.minute, partes.second
  )

  return (comoSiFueraUTC - instanteUTC.getTime()) / 60000
}

/**
 * Dado un día calendario "YYYY-MM-DD" (el día tal como lo vive una
 * usuaria en Chile), devuelve el rango [inicio, fin] en UTC que cubre
 * ese día completo (00:00:00.000 a 23:59:59.999 hora local).
 *
 * Reemplaza el bug donde se usaba `${fecha}T00:00:00.000Z` /
 * `T23:59:59.999Z`, que en realidad delimita el día en UTC, no en hora
 * de Chile (con UTC-3/UTC-4 eso desplaza el rango varias horas).
 *
 * @param {string} fechaStr formato 'YYYY-MM-DD'
 * @returns {{ inicio: Date, fin: Date }}
 */
export function rangoDiaLocalUTC(fechaStr) {
  const [y, m, d] = fechaStr.split('-').map(Number)

  // Mediodía UTC cae siempre dentro del mismo día calendario en Chile
  // (con offset -3 u -4 nunca cruza al día anterior/siguiente), así
  // que es un ancla segura para detectar qué offset aplica ese día.
  const ancla = new Date(Date.UTC(y, m - 1, d, 12, 0, 0))
  const offsetMin = offsetMinutosEnInstante(ancla)

  const inicio = new Date(Date.UTC(y, m - 1, d, 0, 0, 0, 0) - offsetMin * 60000)
  const fin = new Date(Date.UTC(y, m - 1, d, 23, 59, 59, 999) - offsetMin * 60000)

  return { inicio, fin }
}

/**
 * Convierte una fecha en UTC (como las guarda Mongo) a "HH:MM" en hora
 * local de Chile.
 * hourCycle: 'h23' evita el bug conocido de Intl que devuelve "24:00"
 * en vez de "00:00" a la medianoche.
 *
 * @param {Date|string|number} fechaUTC
 * @returns {string|null} ej. "14:30", o null si no hay fecha
 */
export function aHoraLocalHHMM(fechaUTC) {
  if (!fechaUTC) return null

  return new Intl.DateTimeFormat('en-GB', {
    timeZone: TIMEZONE_HANA,
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).format(new Date(fechaUTC))
}