import crypto from 'crypto'

const HORAS_VERIFICACION = 24

/**
 * Genera token random de 64 chars hex con su fecha de expiración.
 */
export function generarTokenVerificacion(horas = HORAS_VERIFICACION) {
  return {
    token: crypto.randomBytes(32).toString('hex'),
    expira: new Date(Date.now() + horas * 60 * 60 * 1000),
  }
}