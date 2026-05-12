// backend/src/utils/normalize.js
//
// Funciones de normalización de datos de usuario.
// Estas funciones deben tener su contraparte idéntica en
// frontend/src/lib/validators/ para que la validación sea consistente.

/**
 * Palabras que NO se capitalizan en el medio de un nombre compuesto.
 * Se mantienen capitalizadas si son la primera o última palabra.
 */
const PALABRAS_MINUSCULA = new Set([
  // preposiciones y artículos españoles
  'de', 'del', 'la', 'las', 'los', 'el',
  // conjunciones
  'y', 'e', 'o', 'u',
  // particles portuguesas (por si hay apellidos lusos)
  'da', 'do', 'das', 'dos',
  // particles europeas
  'van', 'von', 'di',
]);

/**
 * Capitaliza un nombre o apellido con manejo de preposiciones.
 *
 * Ejemplos:
 *   "maria"                 → "Maria"
 *   "MARIA"                 → "Maria"
 *   "maria de los angeles"  → "Maria de los Angeles"
 *   "juan del castillo"     → "Juan del Castillo"
 *   "JOSE DE LA CRUZ"       → "Jose de la Cruz"
 *
 * Reglas:
 *   - Primera palabra: siempre capitalizada
 *   - Última palabra: siempre capitalizada
 *   - Palabras en medio: minúscula si están en PALABRAS_MINUSCULA
 *
 * @param {string} texto
 * @returns {string}
 */
export function capitalizarNombre(texto) {
  if (!texto || typeof texto !== 'string') return '';

  const palabras = texto
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter(p => p.length > 0);

  if (palabras.length === 0) return '';

  return palabras
    .map((palabra, idx) => {
      const esPrimera = idx === 0;
      const esUltima = idx === palabras.length - 1;
      const esConector = PALABRAS_MINUSCULA.has(palabra);

      // Conectores en el medio quedan en minúscula
      if (esConector && !esPrimera && !esUltima) {
        return palabra;
      }

      // Resto: primera letra mayúscula, resto minúscula
      return palabra.charAt(0).toUpperCase() + palabra.slice(1);
    })
    .join(' ');
}

/**
 * Normaliza un RUT chileno al formato sin puntos, con guion y dígito verificador.
 *
 * Ejemplos:
 *   "12.345.678-9"  → "12345678-9"
 *   "12345678-9"    → "12345678-9"
 *   "123456789"     → "12345678-9"
 *   "12.345.678-K"  → "12345678-K"
 *   "  12345678-9 " → "12345678-9"
 *
 * @param {string} rut
 * @returns {string} RUT normalizado, o string vacío si no se pudo parsear
 */
export function normalizarRut(rut) {
  if (!rut || typeof rut !== 'string') return '';

  // Quitar puntos, espacios y pasar a mayúscula (para la K)
  const limpio = rut.replace(/[.\s]/g, '').toUpperCase();

  // Si ya tiene guion, validamos formato
  if (limpio.includes('-')) {
    const partes = limpio.split('-');
    if (partes.length !== 2) return '';
    const [numeros, dv] = partes;
    if (!/^\d{7,8}$/.test(numeros)) return '';
    if (!/^[\dK]$/.test(dv)) return '';
    return `${numeros}-${dv}`;
  }

  // Si no tiene guion, el último carácter es el DV
  if (!/^\d{7,8}[\dK]$/.test(limpio)) return '';
  const numeros = limpio.slice(0, -1);
  const dv = limpio.slice(-1);
  return `${numeros}-${dv}`;
}