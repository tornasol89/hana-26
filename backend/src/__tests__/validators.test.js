// Pruebas unitarias de validación (validarRut, calcularEdad, esMayorDeEdad,
// validarFechaNacimiento). Reglas de negocio: RUT módulo 11 y edad mínima 18.
import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import {
  validarRut,
  calcularEdad,
  esMayorDeEdad,
  validarFechaNacimiento,
  EDAD_MINIMA,
} from '../validators.js';

describe('validarRut (módulo 11)', () => {
  it('acepta RUTs con dígito verificador correcto', () => {
    expect(validarRut('11.111.111-1')).toBe(true);
    expect(validarRut('12345678-5')).toBe(true);
    expect(validarRut('1234567-4')).toBe(true);   // 7 dígitos
  });

  it('acepta RUT con dígito verificador K', () => {
    expect(validarRut('12.345.670-K')).toBe(true);
    expect(validarRut('12345670-k')).toBe(true);  // minúscula se normaliza
  });

  it('acepta RUT con dígito verificador 0 (resto = 11)', () => {
    expect(validarRut('10.000.004-0')).toBe(true);
  });

  it('rechaza RUTs con dígito verificador incorrecto', () => {
    expect(validarRut('12345678-9')).toBe(false); // el correcto es 5
    expect(validarRut('11111111-2')).toBe(false); // el correcto es 1
  });

  it('rechaza entradas con formato inválido', () => {
    expect(validarRut('')).toBe(false);
    expect(validarRut('abc')).toBe(false);
    expect(validarRut('123-4')).toBe(false);
  });
});

describe('calcularEdad', () => {
  beforeAll(() => {
    // Congelamos el reloj para que los tests de edad sean deterministas.
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-16T12:00:00'));
  });
  afterAll(() => {
    vi.useRealTimers();
  });

  it('devuelve 0 para entrada vacía o inválida', () => {
    expect(calcularEdad('')).toBe(0);
    expect(calcularEdad(null)).toBe(0);
    expect(calcularEdad('no-es-fecha')).toBe(0);
  });

  it('calcula la edad cuando el cumpleaños ya pasó este año', () => {
    expect(calcularEdad('2000-01-01')).toBe(26);
  });

  it('resta un año si el cumpleaños aún no llega', () => {
    // cumple el 17/06, hoy es 16/06 → todavía no cumplió
    expect(calcularEdad('2008-06-17')).toBe(17);
  });

  it('cuenta el año el mismo día del cumpleaños', () => {
    expect(calcularEdad('2008-06-16')).toBe(18);
  });
});

describe('esMayorDeEdad', () => {
  beforeAll(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-16T12:00:00'));
  });
  afterAll(() => {
    vi.useRealTimers();
  });

  it('es true justo al cumplir la edad mínima', () => {
    expect(esMayorDeEdad('2008-06-16')).toBe(true); // cumple 18 hoy
  });

  it('es false un día antes de cumplir la edad mínima', () => {
    expect(esMayorDeEdad('2008-06-17')).toBe(false); // cumple 18 mañana
  });
});

describe('validarFechaNacimiento', () => {
  beforeAll(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-16T12:00:00'));
  });
  afterAll(() => {
    vi.useRealTimers();
  });

  it('rechaza fecha ausente con mensaje de obligatoriedad', () => {
    expect(validarFechaNacimiento(null)).toEqual({
      valida: false,
      mensaje: 'La fecha de nacimiento es obligatoria',
    });
  });

  it('rechaza fecha con formato inválido', () => {
    expect(validarFechaNacimiento('no-es-fecha')).toEqual({
      valida: false,
      mensaje: 'Fecha de nacimiento inválida',
    });
  });

  it('rechaza fecha futura', () => {
    expect(validarFechaNacimiento('2030-01-01')).toEqual({
      valida: false,
      mensaje: 'La fecha no puede ser del futuro',
    });
  });

  it('rechaza edad mayor a 120 años (probable typo)', () => {
    expect(validarFechaNacimiento('1850-01-01')).toEqual({
      valida: false,
      mensaje: 'Verifica la fecha de nacimiento',
    });
  });

  it('rechaza a menores de edad con el mensaje correcto', () => {
    expect(validarFechaNacimiento('2010-01-01')).toEqual({
      valida: false,
      mensaje: `Debes tener al menos ${EDAD_MINIMA} años para registrarte`,
    });
  });

  it('acepta una fecha válida de una persona mayor de edad', () => {
    expect(validarFechaNacimiento('2000-01-01')).toEqual({ valida: true });
  });
});