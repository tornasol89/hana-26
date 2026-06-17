import dotenv from 'dotenv'

dotenv.config()

// ── Esquema de variables ──────────────────────────────────────────────
// required: si falta, el server no arranca.
// default:  valor usado cuando la variable opcional no está definida.
const schema = {
  MONGODB_URI:           { required: true,  description: 'Connection string de MongoDB Atlas' },
  JWT_SECRET:            { required: true,  description: 'Secreto para firmar y verificar los JWT' },

  // Cloudinary: temporalmente opcionales. ⚠️ Volver a required: true antes de
  // producción — sin estas, las subidas de imágenes fallan en runtime.
  CLOUDINARY_CLOUD_NAME: { required: false, description: 'Cloud name de Cloudinary' },
  CLOUDINARY_API_KEY:    { required: false, description: 'API key de Cloudinary' },
  CLOUDINARY_API_SECRET: { required: false, description: 'API secret de Cloudinary' },

  RESEND_API_KEY:        { required: true,  description: 'API key de Resend (envío de emails)' },
  EMAIL_FROM:            { required: true,  description: 'Remitente de los emails, ej. "Hana <no-reply@hana.cl>"' },
  FRONTEND_URL:          { required: true,  description: 'URL base del frontend: link de verificación de email + CORS' },
  PORT:                  { required: false, default: '5000', description: 'Puerto del servidor Express' },
}

// ── Validación fail-fast ──────────────────────────────────────────────
const faltantes = []
const env = {}

for (const [clave, regla] of Object.entries(schema)) {
  const valor = process.env[clave]
  const definida = valor !== undefined && valor !== ''

  if (!definida && regla.required) {
    faltantes.push(`  • ${clave} — ${regla.description}`)
    continue
  }

  env[clave] = definida ? valor : regla.default
}

if (faltantes.length > 0) {
  console.error(
    '\n❌ Faltan variables de entorno requeridas en backend/.env:\n\n' +
    faltantes.join('\n') +
    '\n\nRevisa backend/env.example y crea tu archivo .env antes de arrancar.\n'
  )
  process.exit(1)
}

// PORT como número, listo para usar directo en app.listen()
env.PORT = Number(env.PORT)

export default Object.freeze(env)