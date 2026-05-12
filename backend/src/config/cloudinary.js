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

export const uploadFoto          = multer({ storage: perfilStorage })
export const uploadDocumento     = multer({ storage: documentoStorage })
export const uploadCertificado   = multer({ storage: certificadoStorage })
export const uploadPortfolio     = multer({ storage: portfolioStorage })

export default uploadFoto
