/**
 * Script único: crea el usuario admin en MongoDB Atlas.
 * Uso: node scripts/crear-admin.js
 * Solo necesita ejecutarse una vez.
 */

import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: join(__dirname, '..', '.env') })

// ── Esquema mínimo (debe coincidir con User.js) ───────────────────────────────
const userSchema = new mongoose.Schema({
  nombre:   { type: String, required: true },
  apellido: { type: String, required: true },
  email:    { type: String, required: true, unique: true },
  password: { type: String, required: true },
  tipo:     { type: String, enum: ['clienta', 'trabajadora', 'admin'], required: true },
  region:   { type: String, default: '' },
  comuna:   { type: String, default: '' },
  rut:      { type: String, default: '' },
  foto:     { type: String, default: null },
  verificada:         { type: Boolean, default: false },
  estadoVerificacion: { type: String, default: 'sin_enviar' },
  aceptoCompromiso:   { type: Boolean, default: true },
  activa:             { type: Boolean, default: true },
  rolesAdicionales:   [{ type: String }],
}, { timestamps: true })

const User = mongoose.model('User', userSchema)

// ── Config del admin ──────────────────────────────────────────────────────────
const ADMIN_EMAIL    = 'admin@hana.cl'
const ADMIN_PASSWORD = 'Hana2026!'
const ADMIN_NOMBRE   = 'Admin'
const ADMIN_APELLIDO = 'Hana'

async function main() {
  console.log('Conectando a MongoDB Atlas...')
  await mongoose.connect(process.env.MONGODB_URI)
  console.log('Conectado ✅')

  const existe = await User.findOne({ email: ADMIN_EMAIL })

  if (existe) {
    // Siempre actualizar tipo y contraseña para garantizar acceso
    existe.tipo     = 'admin'
    existe.password = await bcrypt.hash(ADMIN_PASSWORD, 10)
    await existe.save()
    console.log(`\nAdmin actualizado (contraseña reseteada): ${ADMIN_EMAIL}`)
  } else {
    const hash = await bcrypt.hash(ADMIN_PASSWORD, 10)
    await User.create({
      nombre:   ADMIN_NOMBRE,
      apellido: ADMIN_APELLIDO,
      email:    ADMIN_EMAIL,
      password: hash,
      tipo:     'admin',
    })
    console.log('\n✅ Admin creado exitosamente')
  }

  console.log(`\nCredenciales de acceso:`)
  console.log(`  Email:    ${ADMIN_EMAIL}`)
  console.log(`  Password: ${ADMIN_PASSWORD}`)

  await mongoose.disconnect()
  process.exit(0)
}

main().catch((err) => {
  console.error('Error:', err.message)
  process.exit(1)
})
