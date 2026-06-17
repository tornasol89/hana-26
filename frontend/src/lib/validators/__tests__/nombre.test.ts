// frontend/src/lib/validators/__tests__/nombre.test.ts
//
// Pruebas unitarias de capitalizarNombre (espejo del backend).
import { describe, it, expect } from 'vitest';
import { capitalizarNombre } from '../nombre';

describe('capitalizarNombre', () => {
  it('devuelve string vacío para entrada vacía', () => {
    expect(capitalizarNombre('')).toBe('');
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

  it('deja conectores en minúscula en el medio', () => {
    expect(capitalizarNombre('maria de los angeles')).toBe('Maria de los Angeles');
    expect(capitalizarNombre('JUAN DEL CASTILLO')).toBe('Juan del Castillo');
    expect(capitalizarNombre('JOSE DE LA CRUZ')).toBe('Jose de la Cruz');
  });

  it('capitaliza el conector si es primera o última palabra', () => {
    expect(capitalizarNombre('de')).toBe('De');
    expect(capitalizarNombre('casa de')).toBe('Casa De');
  });

  it('reconoce partículas portuguesas y europeas', () => {
    expect(capitalizarNombre('joao da silva')).toBe('Joao da Silva');
    expect(capitalizarNombre('ludwig van beethoven')).toBe('Ludwig van Beethoven');
  });

  it('colapsa múltiples espacios y recorta extremos', () => {
    expect(capitalizarNombre('  juan   perez  ')).toBe('Juan Perez');
  });

  it('respeta las tildes que escribió la usuaria', () => {
    expect(capitalizarNombre('JOSÉ')).toBe('José');
  });
});