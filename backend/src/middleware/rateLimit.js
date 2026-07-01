import rateLimit from 'express-rate-limit'

// Config común: headers RateLimit-* estándar (draft-7), sin los legacy X-RateLimit-*
const base = {
  standardHeaders: 'draft-7',
  legacyHeaders: false,
}

// Login — anti fuerza bruta. Estricto.
// skipSuccessfulRequests: solo cuentan los intentos FALLIDOS, así una usuaria
// legítima que entra y sale varias veces no se autobloquea.
export const limiterLogin = rateLimit({
  ...base,
  windowMs: 15 * 60 * 1000, // 15 min
  limit: 10,                // 10 intentos fallidos por IP por ventana
  skipSuccessfulRequests: true,
  message: { mensaje: 'Demasiados intentos de inicio de sesión. Intenta de nuevo en unos minutos.' },
})

// Registro — anti spam de cuentas. Moderado.
export const limiterRegistro = rateLimit({
  ...base,
  windowMs: 60 * 60 * 1000, // 1 hora
  limit: 5,                 // 5 registros por IP por hora
  message: { mensaje: 'Demasiadas cuentas creadas desde esta conexión. Intenta más tarde.' },
})

// Endpoints públicos sin auth (sugerencias, contacto, resend-public) — anti flooding de DB.
export const limiterPublico = rateLimit({
  ...base,
  windowMs: 60 * 60 * 1000, // 1 hora
  limit: 10,
  message: { mensaje: 'Has enviado demasiados mensajes. Intenta más tarde.' },
})

// Red de seguridad global para toda la API. Holgado: no molesta el uso normal.
export const limiterGeneral = rateLimit({
  ...base,
  windowMs: 15 * 60 * 1000,
  limit: 300,
  message: { mensaje: 'Demasiadas solicitudes. Baja el ritmo e intenta de nuevo.' },
})