// backend/src/utils/validators.js
//
// Funciones de validación de datos de usuario.
// Estas funciones deben tener su contraparte idéntica en
// frontend/src/lib/validators/ para que la validación sea consistente.

import { normalizarRut } from './normalize.js';

/**
 * Calcula el dígito verificador de un RUT chileno usando módulo 11.
 *
 * @param {string} rutSinDV - Los 7-8 dígitos del RUT sin verificador
 * @returns {string} El dígito verificador: '0'-'9' o 'K'
 */
function calcularDigitoVerificador(rutSinDV) {
  const reversed = rutSinDV.toString().split('').reverse();
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
 *
 * Ejemplos:
 *   validarRut("11.111.111-1")  → true
 *   validarRut("12345678-5")    → true (si el dígito es correcto)
 *   validarRut("99999999-9")    → false (dígito incorrecto)
 *   validarRut("abc")           → false
 *
 * @param {string} rut - RUT en cualquier formato razonable
 * @returns {boolean}
 */
export function validarRut(rut) {
  const normalizado = normalizarRut(rut);
  if (!normalizado) return false;

  const [numeros, dvIngresado] = normalizado.split('-');
  const dvCalculado = calcularDigitoVerificador(numeros);

  return dvIngresado === dvCalculado;
}

/**
 * Calcula la edad en años a partir de una fecha de nacimiento.
 *
 * @param {Date | string} fechaNacimiento
 * @returns {number} Edad en años
 */
export function calcularEdad(fechaNacimiento) {
  if (!fechaNacimiento) return 0;

  const nacimiento = new Date(fechaNacimiento);
  if (isNaN(nacimiento.getTime())) return 0;

  const hoy = new Date();
  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  const mes = hoy.getMonth() - nacimiento.getMonth();

  if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
    edad--;
  }

  return edad;
}

/** Edad mínima requerida para registrarse en Hana */
export const EDAD_MINIMA = 18;

/**
 * Verifica si una fecha de nacimiento corresponde a alguien mayor de edad.
 *
 * @param {Date | string} fechaNacimiento
 * @returns {boolean}
 */
export function esMayorDeEdad(fechaNacimiento) {
  return calcularEdad(fechaNacimiento) >= EDAD_MINIMA;
}

/**
 * Valida que una fecha de nacimiento sea razonable:
 * - No es del futuro
 * - No es más de 120 años atrás (probablemente typo)
 * - La persona es mayor de edad
 *
 * @param {Date | string} fechaNacimiento
 * @returns {{ valida: boolean, mensaje?: string }}
 */
export function validarFechaNacimiento(fechaNacimiento) {
  if (!fechaNacimiento) {
    return { valida: false, mensaje: 'La fecha de nacimiento es obligatoria' };
  }

  const fecha = new Date(fechaNacimiento);
  if (isNaN(fecha.getTime())) {
    return { valida: false, mensaje: 'Fecha de nacimiento inválida' };
  }

  const ahora = new Date();
  if (fecha > ahora) {
    return { valida: false, mensaje: 'La fecha no puede ser del futuro' };
  }

  const edad = calcularEdad(fecha);
  if (edad > 120) {
    return { valida: false, mensaje: 'Verifica la fecha de nacimiento' };
  }

  if (edad < EDAD_MINIMA) {
    return { valida: false, mensaje: `Debes tener al menos ${EDAD_MINIMA} años para registrarte` };
  }

  return { valida: true };
}