// backend/src/routes/__tests__/workers.test.js
//
// Pruebas de INTEGRACIÓN del endpoint GET /api/workers/:id/horarios-ocupados.
// Usa mongodb-memory-server + supertest.
//
// ⚠️ Requisito: npm install -D supertest mongodb-memory-server
//   La primera ejecución descarga el binario de mongod.
//
// Nota: workers.js importa config/cloudinary.js (uploadCertificado). Se mockea
// para que importar el router no dependa de credenciales de Cloudinary.
import { describe, it, expect, beforeAll, afterAll, afterEach, vi } from 'vitest';
import express from 'express';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

// Stub del middleware de subida (no se usa en horarios-ocupados, pero se importa).
vi.mock('../../config/cloudinary.js', () => ({
  uploadCertificado: { single: () => (req, res, next) => next() },
}));

import workerRoutes from '../workers.js';
import Booking from '../../models/Booking.js';

const oid = () => new mongoose.Types.ObjectId();

function makeApp() {
  const app = express();
  app.use(express.json());
  app.use('/api/workers', workerRoutes);
  return app;
}

let mongod;
let app;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());
  app = makeApp();
});
afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});
afterEach(async () => {
  await Booking.deleteMany({});
});

describe('GET /api/workers/:id/horarios-ocupados', () => {
  it('rechaza con 400 si falta el parámetro fecha', async () => {
    const res = await request(app).get(`/api/workers/${oid()}/horarios-ocupados`);
    expect(res.status).toBe(400);
    expect(res.body.mensaje).toMatch(/fecha/i);
  });

  it('rechaza con 400 si el id de trabajadora no es un ObjectId válido', async () => {
    const res = await request(app).get('/api/workers/abc/horarios-ocupados?fecha=2026-07-01');
    expect(res.status).toBe(400);
    expect(res.body.mensaje).toMatch(/inválid/i);
  });

  it('devuelve un arreglo vacío cuando no hay reservas ese día', async () => {
    const res = await request(app).get(`/api/workers/${oid()}/horarios-ocupados?fecha=2026-07-01`);
    expect(res.status).toBe(200);
    expect(res.body.horasOcupadas).toEqual([]);
  });

  it('devuelve las horas ocupadas convertidas a hora local Chile (UTC-3)', async () => {
    const trabajadora = oid();
    // 14:00 UTC → 11:00 local; 09:00 UTC → 06:00 local
    await Booking.create({ clienta: oid(), trabajadora, servicio: 'A', estado: 'aceptada', fecha: new Date('2026-07-01T14:00:00.000Z') });
    await Booking.create({ clienta: oid(), trabajadora, servicio: 'B', estado: 'pendiente', fecha: new Date('2026-07-01T09:00:00.000Z') });

    const res = await request(app).get(`/api/workers/${trabajadora}/horarios-ocupados?fecha=2026-07-01`);

    expect(res.status).toBe(200);
    expect(res.body.horasOcupadas).toEqual(expect.arrayContaining(['11:00', '06:00']));
    expect(res.body.horasOcupadas).toHaveLength(2);
  });

  it('ignora reservas rechazadas o canceladas (solo cuentan pendiente/aceptada/completada)', async () => {
    const trabajadora = oid();
    await Booking.create({ clienta: oid(), trabajadora, servicio: 'A', estado: 'completada', fecha: new Date('2026-07-01T09:00:00.000Z') }); // sí cuenta → 06:00
    await Booking.create({ clienta: oid(), trabajadora, servicio: 'B', estado: 'rechazada',  fecha: new Date('2026-07-01T14:00:00.000Z') }); // NO cuenta
    await Booking.create({ clienta: oid(), trabajadora, servicio: 'C', estado: 'cancelada',  fecha: new Date('2026-07-01T16:00:00.000Z') }); // NO cuenta

    const res = await request(app).get(`/api/workers/${trabajadora}/horarios-ocupados?fecha=2026-07-01`);

    expect(res.status).toBe(200);
    expect(res.body.horasOcupadas).toEqual(['06:00']);
  });

  it('no incluye reservas de otra trabajadora ni de otro día', async () => {
    const trabajadora = oid();
    await Booking.create({ clienta: oid(), trabajadora, servicio: 'A', estado: 'aceptada', fecha: new Date('2026-07-01T09:00:00.000Z') }); // sí
    await Booking.create({ clienta: oid(), trabajadora: oid(), servicio: 'B', estado: 'aceptada', fecha: new Date('2026-07-01T14:00:00.000Z') }); // otra trabajadora
    await Booking.create({ clienta: oid(), trabajadora, servicio: 'C', estado: 'aceptada', fecha: new Date('2026-07-02T14:00:00.000Z') }); // otro día

    const res = await request(app).get(`/api/workers/${trabajadora}/horarios-ocupados?fecha=2026-07-01`);

    expect(res.status).toBe(200);
    expect(res.body.horasOcupadas).toEqual(['06:00']);
  });
});