cd import mongoose from 'mongoose'
import dotenv from 'dotenv'

dotenv.config()

const APLICAR = process.argv.includes('--apply')

// Fuente de verdad: debe coincidir con frontend/src/config/constants.ts (REGIONES_CHILE)
const REGIONES_VALIDAS = [
  'Arica y Parinacota', 'Tarapacá', 'Antofagasta', 'Atacama', 'Coquimbo',
  'Valparaíso', 'Metropolitana de Santiago', "O'Higgins", 'Maule', 'Ñuble',
  'Biobío', 'La Araucanía', 'Los Ríos', 'Los Lagos', 'Aysén', 'Magallanes',
]

// Variantes conocidas → valor canónico. Si el reporte muestra un "DESCONOCIDO"
// nuevo, agregalo acá y volvé a correr.
const ALIAS_REGION = {
  'región metropolitana': 'Metropolitana de Santiago',
  'region metropolitana': 'Metropolitana de Santiago',
  'rm': 'Metropolitana de Santiago',
  'metropolitana': 'Metropolitana de Santiago',
  'santiago': 'Metropolitana de Santiago',
}

function resolverRegion(valor) {
  if (!valor) return null // vacío: no es el bug, se ignora
  if (REGIONES_VALIDAS.includes(valor)) return null // ya está bien
  return ALIAS_REGION[valor.trim().toLowerCase()] || 'DESCONOCIDO'
}

async function migrarColeccion(nombreColeccion, campo) {
  const coleccion = mongoose.connection.collection(nombreColeccion)
  const docs = await coleccion.find({ [campo]: { $exists: true, $ne: '' } }).toArray()

  const cambios = []
  const desconocidos = []

  for (const doc of docs) {
    const resultado = resolverRegion(doc[campo])
    if (!resultado) continue
    if (resultado === 'DESCONOCIDO') {
      desconocidos.push({ id: doc._id, valor: doc[campo] })
    } else {
      cambios.push({ id: doc._id, antes: doc[campo], despues: resultado })
    }
  }

  console.log(`\n📦 "${nombreColeccion}.${campo}" — documentos no vacíos: ${docs.length}`)
  console.log(`   A corregir: ${cambios.length}`)
  for (const c of cambios) console.log(`   • ${c.id}: "${c.antes}" → "${c.despues}"`)

  if (desconocidos.length > 0) {
    console.log(`   ⚠️  Valores desconocidos (NO se tocan):`)
    for (const d of desconocidos) console.log(`      ${d.id}: "${d.valor}"`)
  }

  if (APLICAR && cambios.length > 0) {
    for (const c of cambios) {
      await coleccion.updateOne({ _id: c.id }, { $set: { [campo]: c.despues } })
    }
    console.log(`   ✅ ${cambios.length} documentos actualizados.`)
  }

  return { corregidos: cambios.length, desconocidos: desconocidos.length }
}

async function main() {
  await mongoose.connect(process.env.MONGODB_URI)
  console.log('✅ Conectado a MongoDB')

  const resultados = await Promise.all([
    migrarColeccion('users', 'region'),
    migrarColeccion('bookings', 'regionServicio'),
  ])

  const totalCorregidos = resultados.reduce((a, r) => a + r.corregidos, 0)
  const totalDesconocidos = resultados.reduce((a, r) => a + r.desconocidos, 0)

  console.log('\n─────────────────────────────────────')
  if (!APLICAR) {
    console.log(`🔍 DRY-RUN: ${totalCorregidos} se corregirían, ${totalDesconocidos} valores desconocidos detectados.`)
    console.log('Para aplicar: node scripts/migrate-region-metropolitana.js --apply\n')
  } else {
    console.log(`🚀 Migración aplicada: ${totalCorregidos} documentos actualizados.`)
    if (totalDesconocidos > 0) console.log(`⚠️  Quedan ${totalDesconocidos} sin tocar — revisar manualmente.`)
  }

  await mongoose.disconnect()
  console.log('👋 Desconectado.\n')
}

main().catch((err) => {
  console.error('❌ Error en migración:', err)
  process.exit(1)
})