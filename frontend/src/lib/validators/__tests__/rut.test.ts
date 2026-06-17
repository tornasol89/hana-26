// Pruebas unitarias de RUT en el frontend: normalizarRut, formatearRutVisual,
// validarRut. normalizarRut y validarRut son espejo del backend.
import { describe, it, expect } from 'vitest';
import { normalizarRut, formatearRutVisual, validarRut } from '../rut';

describe('normalizarRut', () => {
  it('devuelve string vacío para entrada vacía', () => {
    expect(normalizarRut('')).toBe('');
  });

  it('quita puntos y conserva el guion', () => {
    expect(normalizarRut('12.345.678-5')).toBe('12345678-5');
  });

  it('agrega el guion cuando no viene', () => {
    expect(normalizarRut('123456785')).toBe('12345678-5');
  });

  it('recorta espacios', () => {
    expect(normalizarRut('  12345678-5 ')).toBe('12345678-5');
  });

  it('pasa el DV K a mayúscula', () => {
    expect(normalizarRut('12.345.670-k')).toBe('12345670-K');
  });

  it('acepta RUT de 7 dígitos', () => {
    expect(normalizarRut('1234567-4')).toBe('1234567-4');
  });

  it('devuelve string vacío con formato inválido', () => {
    expect(normalizarRut('abc')).toBe('');
    expect(normalizarRut('123-4-5')).toBe('');
    expect(normalizarRut('123-4')).toBe('');
    expect(normalizarRut('12345678-XY')).toBe('');
  });
});

describe('formatearRutVisual', () => {
  it('agrega puntos cada tres dígitos (8 dígitos)', () => {
    expect(formatearRutVisual('12345678-5')).toBe('12.345.678-5');
  });

  it('formatea correctamente un RUT de 7 dígitos', () => {
    expect(formatearRutVisual('1234567-4')).toBe('1.234.567-4');
  });

  it('formatea aunque venga sin guion de entrada', () => {
    expect(formatearRutVisual('123456785')).toBe('12.345.678-5');
  });

  it('devuelve la entrada original si no se puede normalizar', () => {
    expect(formatearRutVisual('abc')).toBe('abc');
    expect(formatearRutVisual('')).toBe('');
  });
});

describe('validarRut (módulo 11)', () => {
  it('acepta RUTs con DV correcto', () => {
    expect(validarRut('11.111.111-1')).toBe(true);
    expect(validarRut('12345678-5')).toBe(true);
    expect(validarRut('1234567-4')).toBe(true);
  });

  it('acepta DV K en mayúscula o minúscula', () => {
    expect(validarRut('12.345.670-K')).toBe(true);
    expect(validarRut('12345670-k')).toBe(true);
  });

  it('acepta RUT con dígito verificador 0 (resto = 11)', () => {
    expect(validarRut('10.000.004-0')).toBe(true);
  });

  it('rechaza RUTs con DV incorrecto', () => {
    expect(validarRut('12345678-9')).toBe(false);
    expect(validarRut('11111111-2')).toBe(false);
  });

  it('rechaza entradas con formato inválido', () => {
    expect(validarRut('')).toBe(false);
    expect(validarRut('abc')).toBe(false);
  });
});