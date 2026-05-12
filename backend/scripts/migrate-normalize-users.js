// backend/scripts/migrate-normalize-users.js
//
// Migración de usuarios existentes:
//   1. Capitaliza nombre y apellido (de "MARIA" → "Maria")
//   2. Normaliza RUT (de "12.345.678-9" → "12345678-9")
//   3. Asigna fecha ficticia 2000-01-01 a quien no tenga fechaNacimiento
//   4. Marca fechaNacimientoCorregida: false (para mostrar banner)
//
// IMPORTANTE: hace dry-run primero. Para aplicar de verdad usar --apply
//
// Uso:
//   node scripts/migrate-normalize-users.js          ← dry-run (solo muestra)
//   node scripts/migrate-normalize-users.js --apply  ← aplica cambios

import mongoose from 'mongoose'
import dotenv from 'dotenv'
import { capitalizarNombre, normalizarRut } from '../src/utils/normalize.js'
import { validarRut } from '../src/utils/validators.js'

dotenv.config()

const APLICAR = process.argv.includes('--apply')
const FECHA_FICTICIA = new Date('2000-01-01')

async function main() {
  await mongoose.connect(process.env.MONGODB_URI)
  console.log('✅ Conectado a MongoDB\n')

  // Usar la colección directamente para evitar que los setters del schema
  // se ejecuten antes de tiempo (queremos ver el estado actual)
  const User = mongoose.connection.collection('users')

  const usuarios = await User.find({}).toArray()
  console.log(`📊 Total de usuarios: ${usuarios.length}\n`)

  const cambios = []
  const rutsInvalidos = []

  for (const u of usuarios) {
    const update = {}
    const log = []

    // 1. Nombre
    const nombreNuevo = capitalizarNombre(u.nombre || '')
    if (nombreNuevo !== u.nombre) {
      update.nombre = nombreNuevo
      log.push(`nombre: "${u.nombre}" → "${nombreNuevo}"`)
    }

    // 2. Apellido
    const apellidoNuevo = capitalizarNombre(u.apellido || '')
    if (apellidoNuevo !== u.apellido) {
      update.apellido = apellidoNuevo
      log.push(`apellido: "${u.apellido}" → "${apellidoNuevo}"`)
    }

    // 3. RUT
    if (u.rut) {
      const rutNuevo = normalizarRut(u.rut)

      if (rutNuevo && validarRut(rutNuevo)) {
        // RUT válido: lo normalizamos al formato sin puntos
        if (rutNuevo !== u.rut) {
          update.rut = rutNuevo
          log.push(`rut: "${u.rut}" → "${rutNuevo}"`)
        }
      } else {
        // RUT inválido: lo vaciamos para que la usuaria lo complete con uno real
        update.rut = ''
        rutsInvalidos.push({ id: u._id, email: u.email, rut: u.rut })
        log.push(`rut: "${u.rut}" → "" (inválido, se vacía para que la usuaria lo corrija)`)
      }
    }

    // 4. Fecha de nacimiento ficticia para quien no la tenga
    if (!u.fechaNacimiento) {
      update.fechaNacimiento = FECHA_FICTICIA
      update.fechaNacimientoCorregida = false // banner activo
      log.push(`fechaNacimiento: (vacía) → 2000-01-01 (ficticia, banner activo)`)
    }

    if (Object.keys(update).length > 0) {
      cambios.push({ id: u._id, email: u.email, update, log })
    }
  }

  console.log(`📝 Usuarios a modificar: ${cambios.length}\n`)
  console.log('─────────────────────────────────────')

  for (const c of cambios) {
    console.log(`\n👤 ${c.email} (${c.id})`)
    for (const l of c.log) {
      console.log(`   • ${l}`)
    }
  }

  if (rutsInvalidos.length > 0) {
    console.log('\n\n⚠️  RUTs INVÁLIDOS DETECTADOS (no se modifican):')
    console.log('─────────────────────────────────────')
    for (const r of rutsInvalidos) {
      console.log(`   ${r.email}: "${r.rut}"`)
    }
    console.log('\nEstos usuarios necesitarán corregir su RUT manualmente desde MiPerfil.')
  }

  console.log('\n─────────────────────────────────────')

  if (!APLICAR) {
    console.log('\n🔍 DRY-RUN: ningún cambio fue aplicado.')
    console.log('Para aplicar de verdad: node scripts/migrate-normalize-users.js --apply\n')
  } else {
    console.log('\n🚀 APLICANDO CAMBIOS...\n')
    let exitos = 0
    for (const c of cambios) {
      await User.updateOne({ _id: c.id }, { $set: c.update })
      exitos++
    }
    console.log(`✅ ${exitos} usuarios actualizados.\n`)
  }

  await mongoose.disconnect()
  console.log('👋 Desconectado.\n')
}

main().catch((err) => {
  console.error('❌ Error en migración:', err)
  process.exit(1)
})