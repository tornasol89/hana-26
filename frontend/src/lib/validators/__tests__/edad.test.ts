// Pruebas unitarias de edad: calcularEdad, esMayorDeEdad, validarFechaNacimiento,
// fechaAInputDate. Regla de negocio: EDAD_MINIMA = 18.
import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import {
  calcularEdad,
  esMayorDeEdad,
  validarFechaNacimiento,
  fechaAInputDate,
  EDAD_MINIMA,
} from '../edad';

describe('EDAD_MINIMA', () => {
  it('es 18', () => {
    expect(EDAD_MINIMA).toBe(18);
  });
});

describe('calcularEdad', () => {
  beforeAll(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-16T12:00:00'));
  });
  afterAll(() => vi.useRealTimers());

  it('devuelve 0 para entrada vacía o inválida', () => {
    expect(calcularEdad('')).toBe(0);
    expect(calcularEdad('no-es-fecha')).toBe(0);
  });

  it('calcula la edad cuando el cumpleaños ya pasó', () => {
    expect(calcularEdad('2000-01-01')).toBe(26);
  });

  it('resta un año si el cumpleaños aún no llega', () => {
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
  afterAll(() => vi.useRealTimers());

  it('es true al cumplir la edad mínima', () => {
    expect(esMayorDeEdad('2008-06-16')).toBe(true);
  });

  it('es false un día antes', () => {
    expect(esMayorDeEdad('2008-06-17')).toBe(false);
  });
});

describe('validarFechaNacimiento', () => {
  beforeAll(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-16T12:00:00'));
  });
  afterAll(() => vi.useRealTimers());

  it('rechaza fecha ausente', () => {
    expect(validarFechaNacimiento(null)).toEqual({
      valida: false,
      mensaje: 'La fecha de nacimiento es obligatoria',
    });
  });

  it('rechaza fecha inválida', () => {
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

  it('rechaza edad mayor a 120 años', () => {
    expect(validarFechaNacimiento('1850-01-01')).toEqual({
      valida: false,
      mensaje: 'Verifica la fecha de nacimiento',
    });
  });

  it('rechaza a menores de edad', () => {
    expect(validarFechaNacimiento('2010-01-01')).toEqual({
      valida: false,
      mensaje: `Debes tener al menos ${EDAD_MINIMA} años para registrarte`,
    });
  });

  it('acepta una fecha válida de mayor de edad', () => {
    expect(validarFechaNacimiento('2000-01-01')).toEqual({ valida: true });
  });
});

describe('fechaAInputDate', () => {
  it('devuelve string vacío para entrada vacía o inválida', () => {
    expect(fechaAInputDate(null)).toBe('');
    expect(fechaAInputDate('')).toBe('');
    expect(fechaAInputDate('no-es-fecha')).toBe('');
  });

  it('convierte a formato YYYY-MM-DD para el input date', () => {
    expect(fechaAInputDate('2000-01-15')).toBe('2000-01-15');
  });
});