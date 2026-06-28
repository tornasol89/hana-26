// backend/scripts/check-rut-duplicates.js
//
// Antes de aplicar el índice unique en `rut`, hay que asegurarse de que no
// haya duplicados existentes en la BD — si los hay, MongoDB se negará a
// construir el índice y el modelo no levantará en producción.
//
// Uso:
//   node scripts/check-rut-duplicates.js
//
// El script es solo de lectura: no modifica nada. Imprime una lista de RUTs
// repetidos con los emails de cada cuenta que los comparte.

import mongoose from 'mongoose'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

// Cargar .env desde backend/ (un nivel arriba de scripts/)
const __dirname = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: join(__dirname, '..', '.env') })

async function main() {
  if (!process.env.MONGODB_URI) {
    console.error('❌ Falta MONGODB_URI en el .env')
    process.exit(1)
  }

  await mongoose.connect(process.env.MONGODB_URI)
  console.log('🔌 Conectado a MongoDB\n')

  // Trabajamos contra la colección directamente para no depender del schema
  const Users = mongoose.connection.collection('users')

  // Agregación: agrupar por rut, contar, filtrar grupos con >1 y rut no vacío
  const duplicados = await Users.aggregate([
    { $match: { rut: { $type: 'string', $ne: '' } } },
    {
      $group: {
        _id: '$rut',
        cantidad: { $sum: 1 },
        usuarias: {
          $push: { _id: '$_id', email: '$email', nombre: '$nombre', apellido: '$apellido' },
        },
      },
    },
    { $match: { cantidad: { $gt: 1 } } },
    { $sort: { cantidad: -1 } },
  ]).toArray()

  if (duplicados.length === 0) {
    console.log('✅ No hay RUTs duplicados. Es seguro aplicar el índice unique.\n')
  } else {
    console.log(`⚠️  ${duplicados.length} RUT(s) duplicado(s) encontrado(s):\n`)
    console.log('─────────────────────────────────────')
    for (const d of duplicados) {
      console.log(`\n🔁 RUT: ${d._id}  (${d.cantidad} cuentas)`)
      for (const u of d.usuarias) {
        console.log(`   • ${u.email}  —  ${u.nombre} ${u.apellido}  (${u._id})`)
      }
    }
    console.log('\n─────────────────────────────────────')
    console.log('\nAcciones sugeridas antes de aplicar el índice:')
    console.log('  1. Contactar a las usuarias para verificar cuál es la cuenta legítima.')
    console.log('  2. Vaciar el RUT (set rut="") en las cuentas duplicadas que NO sean la principal.')
    console.log('  3. Volver a correr este script hasta que dé OK.\n')
  }

  await mongoose.disconnect()
  console.log('👋 Desconectado.\n')
}

main().catch((err) => {
  console.error('❌ Error:', err)
  process.exit(1)
})