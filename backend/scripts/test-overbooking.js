/**
 * Verificación anti-overbooking (CP-RT-08b). No modifica datos reales:
 * crea documentos marcados con __TEST_OVERBOOKING__ y los borra al final.
 *
 * Uso:  node scripts/test-overbooking.js
 */
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import Booking from '../src/models/Booking.js'
import { asegurarSlotLibre } from '../src/services/disponibilidad/index.js'

dotenv.config()

const MARCADOR = '__TEST_OVERBOOKING__'
const oid = () => new mongoose.Types.ObjectId()

let pasaron = 0
let fallaron = 0
const ok  = (m) => { pasaron++;  console.log(`  ✅ ${m}`) }
const bad = (m) => { fallaron++; console.log(`  ❌ ${m}`) }

async function main() {
  if (!process.env.MONGODB_URI) {
    console.error('❌ Falta MONGODB_URI en el entorno (.env)')
    process.exit(1)
  }

  await mongoose.connect(process.env.MONGODB_URI)
  console.log(`✅ Conectado a: ${mongoose.connection.name}\n`)

  // Construye los índices definidos en el schema (incluye el único parcial).
  // Si esto lanza duplicate key, es que quedaron duplicados → corré el dry-run.
  await Booking.init()

  try {
    // --- TEST A: el índice único parcial existe ---
    console.log('TEST A — índice único parcial presente')
    const indices = await Booking.collection.indexes()
    const existe = indices.some((i) => i.name === 'idx_unico_trabajadora_fecha_activa')
    existe ? ok('idx_unico_trabajadora_fecha_activa creado') : bad('el índice NO existe')

    // --- TEST B: backstop atómico ante carrera (dos create simultáneos) ---
    console.log('\nTEST B — dos reservas simultáneas al mismo slot')
    const trabajadoraB = oid()
    const fechaB = new Date('2099-01-01T15:00:00.000Z') // fecha lejana, no choca con nada real
    const base = { trabajadora: trabajadoraB, servicio: MARCADOR, fecha: fechaB }

    const res = await Promise.allSettled([
      Booking.create({ ...base, clienta: oid() }),
      Booking.create({ ...base, clienta: oid() }),
    ])
    const exitos = res.filter((r) => r.status === 'fulfilled').length
    const rechazos = res.filter((r) => r.status === 'rejected')
    const porDuplicado = rechazos.some((r) => r.reason?.code === 11000)

    exitos === 1
      ? ok(`exactamente 1 reserva creada (la otra rechazada)`)
      : bad(`se crearon ${exitos} reservas — HAY OVERBOOKING`)
    porDuplicado
      ? ok('el rechazo fue por duplicate key (11000) del índice')
      : bad('el rechazo NO vino del índice único')

    // --- TEST C: el guard de la app tira 409 sobre slot ocupado ---
    console.log('\nTEST C — asegurarSlotLibre() detecta el conflicto')
    const trabajadoraC = oid()
    const fechaC = new Date('2099-01-02T10:00:00.000Z')
    await Booking.create({ clienta: oid(), trabajadora: trabajadoraC, servicio: MARCADOR, fecha: fechaC })

    try {
      await asegurarSlotLibre({ trabajadora: trabajadoraC, fecha: fechaC })
      bad('NO lanzó error sobre un slot ocupado')
    } catch (e) {
      e.statusCode === 409
        ? ok('lanzó AppError con statusCode 409')
        : bad(`lanzó error con statusCode ${e.statusCode} (esperado 409)`)
    }

    // --- TEST D: slot libre / sin fecha NO bloquea ---
    console.log('\nTEST D — slot libre y reserva sin fecha no bloquean')
    try {
      await asegurarSlotLibre({ trabajadora: trabajadoraC, fecha: new Date('2099-06-06T10:00:00.000Z') })
      ok('otro horario de la misma trabajadora queda libre')
    } catch { bad('bloqueó un horario que estaba libre') }

    try {
      await asegurarSlotLibre({ trabajadora: trabajadoraC, fecha: null })
      ok('reserva sin fecha no dispara chequeo')
    } catch { bad('bloqueó una reserva sin fecha') }

  } finally {
    // Cleanup: borra SOLO los documentos de prueba
    const del = await Booking.deleteMany({ servicio: MARCADOR })
    console.log(`\n🧹 Cleanup: ${del.deletedCount} documentos de prueba borrados`)
    await mongoose.disconnect()
  }

  console.log(`\n===== RESULTADO: ${pasaron} ok, ${fallaron} fallos =====`)
  process.exit(fallaron > 0 ? 1 : 0)
}

main().catch((err) => {
  console.error('❌ Error inesperado:', err)
  process.exit(1)
})