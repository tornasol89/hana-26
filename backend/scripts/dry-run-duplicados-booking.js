/**
 * DRY-RUN — solo lectura. No modifica nada en la base de datos.
 * Detecta reservas duplicadas (misma trabajadora + misma fecha) en estados
 * activos, ANTES de crear el índice único parcial. Si reporta 0, es seguro crear.
 *
 * Uso: node scripts/dry-run-duplicados-booking.js
 */
import mongoose from 'mongoose'
import dotenv from 'dotenv'

dotenv.config()

const ESTADOS_QUE_OCUPAN = ['pendiente', 'aceptada', 'en_curso', 'completada', 'en_disputa']

async function main() {
  const uri = process.env.MONGODB_URI
  if (!uri) {
    console.error('❌ No se encontró MONGODB_URI en el entorno. Revisa tu .env')
    process.exit(1)
  }

  await mongoose.connect(uri)
  console.log('✅ Conectado a MongoDB')

  const Booking = mongoose.connection.collection('bookings')

  const duplicados = await Booking.aggregate([
    { $match: { fecha: { $ne: null }, estado: { $in: ESTADOS_QUE_OCUPAN } } },
    { $group: {
        _id: { trabajadora: '$trabajadora', fecha: '$fecha' },
        count: { $sum: 1 },
        ids: { $push: '$_id' },
        estados: { $push: '$estado' },
    } },
    { $match: { count: { $gt: 1 } } },
  ]).toArray()

  console.log('\n========================================')
  console.log(`Grupos duplicados encontrados: ${duplicados.length}`)
  console.log('========================================\n')

  if (duplicados.length === 0) {
    console.log('✅ No hay duplicados. Es seguro crear el índice único parcial.')
  } else {
    console.log('⚠️  Conflictos a resolver ANTES de crear el índice:\n')
    duplicados.forEach((d, i) => {
      console.log(`--- Conflicto ${i + 1} ---`)
      console.log(`Trabajadora: ${d._id.trabajadora}`)
      console.log(`Fecha:       ${d._id.fecha}`)
      console.log(`Cantidad:    ${d.count}`)
      console.log(`IDs:         ${d.ids.join(', ')}`)
      console.log(`Estados:     ${d.estados.join(', ')}\n`)
    })
    console.log('Decidí cuál reserva de cada grupo es la válida y cancelá/reasigná las demás.')
  }

  await mongoose.disconnect()
  process.exit(duplicados.length > 0 ? 1 : 0)
}

main().catch((err) => {
  console.error('❌ Error ejecutando dry-run:', err)
  process.exit(1)
})
