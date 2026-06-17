// backend/src/models/__tests__/User.test.js
//
// Pruebas unitarias del esquema User: setters automáticos (capitalizar nombre,
// normalizar RUT, lowercase email) y validators custom (RUT módulo 11,
// fecha de nacimiento). Se usa validateSync() — sin conexión a MongoDB.
// El reloj se congela para que el validator de edad sea determinista.
import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import mongoose from 'mongoose';
import User from '../User.js';

beforeAll(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-06-16T12:00:00'));
});
afterAll(() => vi.useRealTimers());

// Datos válidos base; los tests sobreescriben el campo bajo prueba.
function datosValidos(overrides = {}) {
  return {
    nombre: 'maria',
    apellido: 'perez',
    email: 'maria@test.cl',
    password: 'hashed',
    tipo: 'clienta',
    fechaNacimiento: '2000-01-01',
    ...overrides,
  };
}

describe('User — setters automáticos', () => {
  it('capitaliza nombre y apellido al asignarlos', () => {
    const u = new User(datosValidos({ nombre: 'maria de los angeles', apellido: 'de la fuente' }));
    expect(u.nombre).toBe('Maria de los Angeles');
    // "de" es primera palabra → se capitaliza; "la" queda en minúscula en el medio
    expect(u.apellido).toBe('De la Fuente');
  });

  it('pasa el email a minúsculas y recorta espacios', () => {
    const u = new User(datosValidos({ email: '  MARIA@Test.CL ' }));
    expect(u.email).toBe('maria@test.cl');
  });

  it('normaliza el RUT al formato sin puntos con guion', () => {
    const u = new User(datosValidos({ rut: '12.345.678-5' }));
    expect(u.rut).toBe('12345678-5');
  });

  it('deja el RUT vacío como string vacío', () => {
    const u = new User(datosValidos({ rut: '' }));
    expect(u.rut).toBe('');
  });
});

describe('User — validación de RUT (módulo 11)', () => {
  it('acepta un RUT con dígito verificador correcto', () => {
    const err = new User(datosValidos({ rut: '12.345.678-5' })).validateSync();
    expect(err?.errors?.rut).toBeUndefined();
  });

  it('acepta RUT vacío (es opcional)', () => {
    const err = new User(datosValidos({ rut: '' })).validateSync();
    expect(err?.errors?.rut).toBeUndefined();
  });

  it('rechaza un RUT con dígito verificador incorrecto', () => {
    const err = new User(datosValidos({ rut: '12345678-9' })).validateSync();
    expect(err).toBeDefined();
    expect(err.errors.rut).toBeDefined();
    expect(err.errors.rut.message).toMatch(/RUT inválido/);
  });
});

describe('User — validación de fecha de nacimiento', () => {
  it('acepta a una persona mayor de edad', () => {
    const err = new User(datosValidos({ fechaNacimiento: '2000-01-01' })).validateSync();
    expect(err?.errors?.fechaNacimiento).toBeUndefined();
  });

  it('rechaza a una menor de edad', () => {
    const err = new User(datosValidos({ fechaNacimiento: '2010-01-01' })).validateSync();
    expect(err).toBeDefined();
    expect(err.errors.fechaNacimiento).toBeDefined();
  });

  it('exige la fecha de nacimiento (campo requerido)', () => {
    const datos = datosValidos();
    delete datos.fechaNacimiento;
    const err = new User(datos).validateSync();
    expect(err.errors.fechaNacimiento).toBeDefined();
  });
});

describe('User — campos requeridos y enum de tipo', () => {
  it('exige nombre, apellido, email, password y tipo', () => {
    const err = new User({ fechaNacimiento: '2000-01-01' }).validateSync();
    expect(err.errors.nombre).toBeDefined();
    expect(err.errors.apellido).toBeDefined();
    expect(err.errors.email).toBeDefined();
    expect(err.errors.password).toBeDefined();
    expect(err.errors.tipo).toBeDefined();
  });

  it('rechaza un tipo fuera del enum', () => {
    const err = new User(datosValidos({ tipo: 'superusuaria' })).validateSync();
    expect(err.errors.tipo).toBeDefined();
  });

  it('fechaNacimientoCorregida y verificada tienen defaults', () => {
    const u = new User(datosValidos());
    expect(u.fechaNacimientoCorregida).toBe(true);
    expect(u.verificada).toBe(false);
  });
});