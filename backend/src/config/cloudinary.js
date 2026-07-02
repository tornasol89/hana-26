import { v2 as cloudinary } from 'cloudinary'
import { CloudinaryStorage } from 'multer-storage-cloudinary'
import multer from 'multer'
import dotenv from 'dotenv'
dotenv.config()

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

// ── Límites y filtros de subida ───────────────────────────────────────────────
const MB = 1024 * 1024

const LIMITE_IMAGEN      = 5  * MB   // perfil y portafolio (se redimensionan igual)
const LIMITE_DOCUMENTO   = 8  * MB   // carnet: necesita legibilidad
const LIMITE_CERTIFICADO = 10 * MB   // acepta PDF, que pesa más

const MIME_IMAGEN      = ['image/jpeg', 'image/png']            // jpg y jpeg → image/jpeg
const MIME_CERTIFICADO = ['image/jpeg', 'image/png', 'application/pdf']

// Factory: rechaza tipos no permitidos con un error identificable en server.js
function crearFileFilter(mimesPermitidos) {
  return (req, file, cb) => {
    if (mimesPermitidos.includes(file.mimetype)) {
      cb(null, true)
    } else {
      const error = new Error('Tipo de archivo no permitido. Solo se aceptan: ' + mimesPermitidos.join(', '))
      error.code = 'TIPO_ARCHIVO_INVALIDO'
      cb(error, false)
    }
  }
}

// ── Storages ──────────────────────────────────────────────────────────────────

// Para fotos de perfil (recorte cuadrado 500×500)
const perfilStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder:           'hana_profiles',
    allowed_formats:  ['jpg', 'jpeg', 'png'],
    transformation:   [{ width: 500, height: 500, crop: 'fill' }],
  },
})

// Para documentos de identidad (sin recorte, alta resolución)
const documentoStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder:          'hana_carnets',
    allowed_formats: ['jpg', 'jpeg', 'png'],
  },
})

// Para certificados de trabajadoras (PDF o imagen)
const certificadoStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder:          'hana_certificados',
    allowed_formats: ['jpg', 'jpeg', 'png', 'pdf'],
    resource_type:   'auto',
  },
})

// Para fotos de portafolio (paisaje 4:3, buena resolución)
const portfolioStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder:          'hana_portfolio',
    allowed_formats: ['jpg', 'jpeg', 'png'],
    transformation:  [{ width: 900, height: 675, crop: 'fill' }],
  },
})

// ── Instancias multer (ahora con límites y filtro) ────────────────────────────
export const uploadFoto = multer({
  storage:    perfilStorage,
  limits:     { fileSize: LIMITE_IMAGEN, files: 1 },
  fileFilter: crearFileFilter(MIME_IMAGEN),
})

export const uploadDocumento = multer({
  storage:    documentoStorage,
  limits:     { fileSize: LIMITE_DOCUMENTO, files: 1 },
  fileFilter: crearFileFilter(MIME_IMAGEN),
})

export const uploadCertificado = multer({
  storage:    certificadoStorage,
  limits:     { fileSize: LIMITE_CERTIFICADO, files: 1 },
  fileFilter: crearFileFilter(MIME_CERTIFICADO),
})

export const uploadPortfolio = multer({
  storage:    portfolioStorage,
  limits:     { fileSize: LIMITE_IMAGEN, files: 1 },
  fileFilter: crearFileFilter(MIME_IMAGEN),
})

export default uploadFoto