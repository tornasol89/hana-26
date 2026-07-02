// backend/src/utils/__tests__/crypto.test.js

// La llave se lee de forma perezosa (dentro de obtenerLlave), así que basta
// con definirla antes de que corra el primer test. No hace falta beforeAll.
process.env.MESSAGE_ENCRYPTION_KEY =
  '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef'

import { describe, it, expect } from 'vitest'
import { cifrar, descifrar, pareceCifrado } from '../crypto.js'

describe('crypto (cifrado en reposo de mensajes)', () => {
  it('CP-CRYPTO-01: round-trip devuelve el texto original', () => {
    const t = 'Nos vemos a las 15:00 en Maipú'
    expect(descifrar(cifrar(t))).toBe(t)
  })

  it('CP-CRYPTO-02: el ciphertext no contiene el texto plano', () => {
    const cifrado = cifrar('información sensible')
    expect(cifrado).not.toContain('información')
    expect(pareceCifrado(cifrado)).toBe(true)
  })

  it('CP-CRYPTO-03: dos cifrados del mismo texto difieren (IV aleatorio)', () => {
    const a = cifrar('mismo texto')
    const b = cifrar('mismo texto')
    expect(a).not.toBe(b)
    expect(descifrar(a)).toBe(descifrar(b))
  })

  it('CP-CRYPTO-04: texto legacy (sin cifrar) se devuelve tal cual', () => {
    expect(descifrar('mensaje viejo en texto plano')).toBe('mensaje viejo en texto plano')
    expect(pareceCifrado('mensaje viejo')).toBe(false)
  })

  it('CP-CRYPTO-05: ciphertext manipulado no descifra (GCM detecta)', () => {
    const cifrado = cifrar('original')
    const roto = cifrado.slice(0, -4) + 'AAAA'
    expect(descifrar(roto)).toBe('[mensaje no disponible]')
  })
})