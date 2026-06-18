// frontend/src/lib/validators/rut.ts
//
// Validación y formateo de RUT chileno.
// Espejo del backend: backend/src/utils/{normalize,validators}.js

/**
 * Normaliza un RUT al formato sin puntos, con guion y dígito verificador.
 *
 * Ejemplos:
 *   "12.345.678-9" → "12345678-9"
 *   "12345678-9"   → "12345678-9"
 *   "123456789"    → "12345678-9"
 */
export function normalizarRut(rut: string): string {
  if (!rut) return '';

  const limpio = rut.replace(/[.\s]/g, '').toUpperCase();

  if (limpio.includes('-')) {
    const partes = limpio.split('-');
    if (partes.length !== 2) return '';
    const [numeros, dv] = partes;
    if (!/^\d{7,8}$/.test(numeros)) return '';
    if (!/^[\dK]$/.test(dv)) return '';
    return `${numeros}-${dv}`;
  }

  if (!/^\d{7,8}[\dK]$/.test(limpio)) return '';
  const numeros = limpio.slice(0, -1);
  const dv = limpio.slice(-1);
  return `${numeros}-${dv}`;
}

/**
 * Formatea un RUT para mostrar al usuario con puntos.
 *
 * Ejemplo:
 *   "12345678-9" → "12.345.678-9"
 */
export function formatearRutVisual(rut: string): string {
  const normalizado = normalizarRut(rut);
  if (!normalizado) return rut;

  const [numeros, dv] = normalizado.split('-');
  // Agregar puntos cada 3 dígitos de derecha a izquierda
  const conPuntos = numeros.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${conPuntos}-${dv}`;
}

function calcularDigitoVerificador(rutSinDV: string): string {
  const reversed = rutSinDV.split('').reverse();
  let suma = 0;
  let multiplicador = 2;

  for (const digito of reversed) {
    suma += parseInt(digito, 10) * multiplicador;
    multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
  }

  const resto = 11 - (suma % 11);
  if (resto === 11) return '0';
  if (resto === 10) return 'K';
  return resto.toString();
}

/**
 * Valida un RUT chileno con algoritmo módulo 11.
 */
export function validarRut(rut: string): boolean {
  const normalizado = normalizarRut(rut);
  if (!normalizado) return false;

  const [numeros, dvIngresado] = normalizado.split('-');
  const dvCalculado = calcularDigitoVerificador(numeros);

  return dvIngresado === dvCalculado;
}