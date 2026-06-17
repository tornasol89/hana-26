// Pruebas unitarias de normalización de datos (capitalizarNombre, normalizarRut).
// Estas funciones son espejo del frontend (frontend/src/lib/validators/).
import { describe, it, expect } from 'vitest';
import { capitalizarNombre, normalizarRut } from '../normalize.js';

describe('capitalizarNombre', () => {
  it('devuelve string vacío para entrada vacía, null o no-string', () => {
    expect(capitalizarNombre('')).toBe('');
    expect(capitalizarNombre(null)).toBe('');
    expect(capitalizarNombre(undefined)).toBe('');
    expect(capitalizarNombre(12345)).toBe('');
  });

  it('devuelve string vacío cuando solo hay espacios', () => {
    expect(capitalizarNombre('   ')).toBe('');
  });

  it('capitaliza un nombre simple', () => {
    expect(capitalizarNombre('maria')).toBe('Maria');
  });

  it('normaliza un nombre en mayúsculas', () => {
    expect(capitalizarNombre('MARIA')).toBe('Maria');
  });

  it('deja conectores en minúscula en el medio del nombre', () => {
    expect(capitalizarNombre('maria de los angeles')).toBe('Maria de los Angeles');
    expect(capitalizarNombre('JUAN DEL CASTILLO')).toBe('Juan del Castillo');
    expect(capitalizarNombre('JOSE DE LA CRUZ')).toBe('Jose de la Cruz');
  });

  it('capitaliza el conector si es la primera o última palabra', () => {
    expect(capitalizarNombre('de')).toBe('De');           // primera = última
    expect(capitalizarNombre('casa de')).toBe('Casa De');  // conector como última
  });

  it('reconoce partículas portuguesas y europeas', () => {
    expect(capitalizarNombre('joao da silva')).toBe('Joao da Silva');
    expect(capitalizarNombre('ludwig van beethoven')).toBe('Ludwig van Beethoven');
  });

  it('colapsa múltiples espacios y recorta los extremos', () => {
    expect(capitalizarNombre('  juan   perez  ')).toBe('Juan Perez');
  });

  it('respeta las tildes que escribió la usuaria (no las agrega ni quita)', () => {
    expect(capitalizarNombre('JOSÉ')).toBe('José');
    expect(capitalizarNombre('maria')).toBe('Maria'); // sin tilde queda sin tilde
  });
});

describe('normalizarRut', () => {
  it('devuelve string vacío para entrada vacía, null o no-string', () => {
    expect(normalizarRut('')).toBe('');
    expect(normalizarRut(null)).toBe('');
    expect(normalizarRut(undefined)).toBe('');
    expect(normalizarRut(12345678)).toBe('');
  });

  it('quita puntos y conserva el guion', () => {
    expect(normalizarRut('12.345.678-5')).toBe('12345678-5');
  });

  it('agrega el guion cuando no viene (último carácter es el DV)', () => {
    expect(normalizarRut('123456785')).toBe('12345678-5');
  });

  it('recorta espacios al inicio y final', () => {
    expect(normalizarRut('  12345678-5 ')).toBe('12345678-5');
  });

  it('pasa el dígito verificador K a mayúscula', () => {
    expect(normalizarRut('12.345.670-k')).toBe('12345670-K');
    expect(normalizarRut('12345670K')).toBe('12345670-K');
  });

  it('acepta RUT de 7 dígitos', () => {
    expect(normalizarRut('1234567-4')).toBe('1234567-4');
  });

  it('devuelve string vacío si el formato es inválido', () => {
    expect(normalizarRut('abc')).toBe('');
    expect(normalizarRut('123-4-5')).toBe('');   // más de un guion
    expect(normalizarRut('123-4')).toBe('');      // pocos dígitos
    expect(normalizarRut('123456789-5')).toBe(''); // 9 dígitos antes del guion
    expect(normalizarRut('12345678-XY')).toBe(''); // DV inválido
  });
});