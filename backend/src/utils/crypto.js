// backend/src/utils/crypto.js
import crypto from 'crypto'

// AES-256-GCM: cifrado autenticado. IV de 96 bits (recomendado para GCM),
// authTag de 128 bits. Formato de salida versionado para futuras rotaciones:
//   v1:<iv_b64>:<tag_b64>:<ciphertext_b64>
const VERSION = 'v1'
const ALGO = 'aes-256-gcm'
const IV_BYTES = 12

// Validación perezosa: solo falla si realmente se intenta cifrar/descifrar,
// no al arrancar rutas que no tocan mensajes.
let _key = null
function obtenerLlave() {
  if (_key) return _key
  const hex = process.env.MESSAGE_ENCRYPTION_KEY
  if (!hex) {
    throw new Error('Falta MESSAGE_ENCRYPTION_KEY en el entorno')
  }
  const buf = Buffer.from(hex, 'hex')
  if (buf.length !== 32) {
    throw new Error('MESSAGE_ENCRYPTION_KEY debe ser 32 bytes en hex (64 caracteres)')
  }
  _key = buf
  return _key
}

/** Detecta si un valor ya viene cifrado (para compatibilidad con mensajes legacy). */
export function pareceCifrado(valor) {
  return typeof valor === 'string' && valor.startsWith(`${VERSION}:`) && valor.split(':').length === 4
}

/** Cifra un texto plano. Devuelve el paquete versionado como string. */
export function cifrar(textoPlano) {
  if (textoPlano == null || textoPlano === '') return textoPlano
  const iv = crypto.randomBytes(IV_BYTES)
  const cipher = crypto.createCipheriv(ALGO, obtenerLlave(), iv)
  const cifrado = Buffer.concat([cipher.update(String(textoPlano), 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()
  return `${VERSION}:${iv.toString('base64')}:${tag.toString('base64')}:${cifrado.toString('base64')}`
}

/** Descifra un paquete. Si no parece cifrado (legacy) o falla, devuelve el valor tal cual. */
export function descifrar(paquete) {
  if (!pareceCifrado(paquete)) return paquete // mensaje antiguo en texto plano
  try {
    const [, ivB64, tagB64, dataB64] = paquete.split(':')
    const decipher = crypto.createDecipheriv(ALGO, obtenerLlave(), Buffer.from(ivB64, 'base64'))
    decipher.setAuthTag(Buffer.from(tagB64, 'base64'))
    const plano = Buffer.concat([decipher.update(Buffer.from(dataB64, 'base64')), decipher.final()])
    return plano.toString('utf8')
  } catch {
    // No revientes el chat si un documento está corrupto o la llave rotó mal.
    return '[mensaje no disponible]'
  }
}