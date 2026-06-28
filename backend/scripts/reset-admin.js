/**
 * Script para resetear (o crear) el usuario admin.
 * Uso: node scripts/reset-admin.js
 * Debe ejecutarse desde la carpeta backend/.
 */
import dotenv from 'dotenv'
import bcrypt from 'bcryptjs'
import mongoose from 'mongoose'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: resolve(__dirname, '../.env') })

const uri = process.env.MONGODB_URI
if (!uri) {
  console.error('❌ MONGODB_URI no está definida en .env')
  process.exit(1)
}

// Schema mínimo (no importamos el modelo completo para evitar dependencias)
const userSchema = new mongoose.Schema({
  nombre:    String,
  apellido:  String,
  email:     { type: String, lowercase: true, trim: true },
  password:  String,
  tipo:      String,
  activa:    { type: Boolean, default: true },
  fechaNacimiento: { type: Date, default: new Date('1990-01-01') },
  fechaNacimientoCorregida: { type: Boolean, default: true },
  aceptoCompromiso: { type: Boolean, default: true },
}, { strict: false, timestamps: true })

const User = mongoose.models.User || mongoose.model('User', userSchema)

const NUEVA_PASSWORD = 'Admin1234!'

async function main() {
  await mongoose.connect(uri)
  console.log('✅ Conectado a MongoDB\n')

  let admin = await User.findOne({ tipo: 'admin' })

  if (admin) {
    const hash = await bcrypt.hash(NUEVA_PASSWORD, 10)
    admin.password = hash
    await admin.save()
    console.log(`✅ Contraseña reseteada para: ${admin.email}`)
    console.log(`   Nueva contraseña: ${NUEVA_PASSWORD}`)
  } else {
    // No existe ningún admin — crear uno nuevo
    const hash = await bcrypt.hash(NUEVA_PASSWORD, 10)
    admin = await User.create({
      nombre:    'Admin',
      apellido:  'Hana',
      email:     'admin@hana.cl',
      password:  hash,
      tipo:      'admin',
      activa:    true,
      fechaNacimiento: new Date('1990-01-01'),
      fechaNacimientoCorregida: true,
      aceptoCompromiso: true,
    })
    console.log(`✅ Admin creado: ${admin.email}`)
    console.log(`   Contraseña: ${NUEVA_PASSWORD}`)
  }

  await mongoose.disconnect()
  process.exit(0)
}

main().catch(e => {
  console.error('❌ Error:', e.message)
  process.exit(1)
})
