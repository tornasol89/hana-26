// Pruebas unitarias del esquema Booking. Se usa validateSync() de Mongoose,
// que valida required/enum/defaults SIN necesidad de conectar a MongoDB.
import { describe, it, expect } from 'vitest';
import mongoose from 'mongoose';
import Booking from '../Booking.js';

const oid = () => new mongoose.Types.ObjectId();

// Datos mínimos para una reserva válida.
function reservaValida(overrides = {}) {
  return new Booking({
    clienta: oid(),
    trabajadora: oid(),
    servicio: 'Manicure',
    ...overrides,
  });
}

describe('Booking — campos requeridos', () => {
  it('exige clienta, trabajadora y servicio', () => {
    const err = new Booking({}).validateSync();
    expect(err).toBeDefined();
    expect(err.errors.clienta).toBeDefined();
    expect(err.errors.trabajadora).toBeDefined();
    expect(err.errors.servicio).toBeDefined();
  });

  it('no arroja error con los campos mínimos válidos', () => {
    expect(reservaValida().validateSync()).toBeUndefined();
  });
});

describe('Booking — valores por defecto', () => {
  it('estado por defecto es "pendiente"', () => {
    expect(reservaValida().estado).toBe('pendiente');
  });

  it('fecha y descripción tienen defaults seguros', () => {
    const r = reservaValida();
    expect(r.fecha).toBeNull();
    expect(r.descripcion).toBe('');
  });

  it('inicializa las confirmaciones dobles en null', () => {
    const r = reservaValida();
    expect(r.inicioConfirmadoPor.trabajadora).toBeNull();
    expect(r.inicioConfirmadoPor.clienta).toBeNull();
    expect(r.finConfirmadoPor.trabajadora).toBeNull();
    expect(r.finConfirmadoPor.clienta).toBeNull();
  });

  it('inicializa la disputa inactiva, sin fase', () => {
    const r = reservaValida();
    expect(r.disputa.activa).toBe(false);
    expect(r.disputa.fase).toBeNull();
    expect(r.disputa.motivoTrabajadora).toBe('');
    expect(r.disputa.motivoClienta).toBe('');
  });
});

describe('Booking — enum de estado', () => {
  it.each(['pendiente', 'aceptada', 'en_curso', 'completada', 'rechazada', 'cancelada', 'en_disputa'])(
    'acepta el estado válido "%s"',
    (estado) => {
      expect(reservaValida({ estado }).validateSync()).toBeUndefined();
    },
  );

  it('rechaza un estado fuera del enum', () => {
    const err = reservaValida({ estado: 'inventado' }).validateSync();
    expect(err).toBeDefined();
    expect(err.errors.estado).toBeDefined();
  });
});

describe('Booking — enum de fase de disputa', () => {
  it('acepta fase "inicio" y "fin"', () => {
    expect(reservaValida({ disputa: { fase: 'inicio' } }).validateSync()).toBeUndefined();
    expect(reservaValida({ disputa: { fase: 'fin' } }).validateSync()).toBeUndefined();
  });

  it('rechaza una fase de disputa inválida', () => {
    const err = reservaValida({ disputa: { fase: 'mitad' } }).validateSync();
    expect(err).toBeDefined();
    expect(err.errors['disputa.fase']).toBeDefined();
  });

  it('recorta los espacios de servicio (trim)', () => {
    expect(reservaValida({ servicio: '  Corte de pelo  ' }).servicio).toBe('Corte de pelo');
  });
});