// backend/src/middleware/errorHandler.js
const esDesarrollo = process.env.NODE_ENV !== 'production';

/**
 * 404 para rutas no montadas. Va DESPUÉS de todas las rutas.
 */
export function notFound(req, res, next) {
  res.status(404).json({ error: 'Recurso no encontrado' });
}

/**
 * Manejador de errores centralizado (firma de 4 args → Express lo reconoce).
 * Va al final de la cadena, después de notFound.
 */
export function errorHandler(err, req, res, next) {
  console.error(`[ERROR] ${req.method} ${req.originalUrl}`, err);

  if (err.name === 'ValidationError') {
    const mensajes = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({
      error: 'Datos inválidos',
      detalles: mensajes,
    });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({ error: 'Identificador inválido' });
  }

  if (err.code === 11000) {
    return res.status(409).json({ error: 'El registro ya existe' });
  }

  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }

  if (err.esOperacional) {
    return res.status(err.statusCode).json({ mensaje: err.message });
  }

  return res.status(err.statusCode || 500).json({
    error: 'Error interno del servidor',
    ...(esDesarrollo && { _debug: err.message, _stack: err.stack }),
  });
}