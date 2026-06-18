// frontend/src/lib/validators/nombre.ts
//
// Normalización de nombres y apellidos.
// Espejo del backend: backend/src/utils/normalize.js

const PALABRAS_MINUSCULA = new Set([
  'de', 'del', 'la', 'las', 'los', 'el',
  'y', 'e', 'o', 'u',
  'da', 'do', 'das', 'dos',
  'van', 'von', 'di',
]);

/**
 * Capitaliza un nombre o apellido con manejo de preposiciones.
 *
 * Ejemplos:
 *   "maria de los angeles"  → "Maria de los Angeles"
 *   "JUAN DEL CASTILLO"     → "Juan del Castillo"
 */
export function capitalizarNombre(texto: string): string {
  if (!texto) return '';

  const palabras = texto
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter((p) => p.length > 0);

  if (palabras.length === 0) return '';

  return palabras
    .map((palabra, idx) => {
      const esPrimera = idx === 0;
      const esUltima = idx === palabras.length - 1;
      const esConector = PALABRAS_MINUSCULA.has(palabra);

      if (esConector && !esPrimera && !esUltima) {
        return palabra;
      }

      return palabra.charAt(0).toUpperCase() + palabra.slice(1);
    })
    .join(' ');
}