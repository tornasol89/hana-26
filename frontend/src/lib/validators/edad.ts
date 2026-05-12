// frontend/src/lib/validators/edad.ts
//
// Cálculo y validación de edad.
// Espejo del backend: backend/src/utils/validators.js

export const EDAD_MINIMA = 18;

export function calcularEdad(fechaNacimiento: Date | string): number {
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

export function esMayorDeEdad(fechaNacimiento: Date | string): boolean {
  return calcularEdad(fechaNacimiento) >= EDAD_MINIMA;
}

interface ResultadoValidacionFecha {
  valida: boolean;
  mensaje?: string;
}

export function validarFechaNacimiento(
  fechaNacimiento: Date | string | null | undefined,
): ResultadoValidacionFecha {
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
    return {
      valida: false,
      mensaje: `Debes tener al menos ${EDAD_MINIMA} años para registrarte`,
    };
  }

  return { valida: true };
}

export function fechaAInputDate(fecha: Date | string | null | undefined): string {
  if (!fecha) return '';
  const d = new Date(fecha);
  if (isNaN(d.getTime())) return '';
  return d.toISOString().split('T')[0];
}
