// backend/src/routes/__tests__/bookings.test.js
//
// Pruebas de INTEGRACIÓN de las rutas de reservas.
// Usa mongodb-memory-server (Mongo en memoria) + supertest.
//
// ⚠️ Requisito: instalar las dev-deps de integración
//     npm install -D supertest mongodb-memory-server
//   La primera ejecución descarga el binario de mongod (~).
//
// Cobertura: POST / (crear + validaciones 400), GET /mis-reservas (clienta)
// y PUT /:id/completar (incluye el requisito de seguridad #B2, ver más abajo).
import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import express from 'express';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

import bookingRoutes from '../bookings.js';
import Booking from '../../models/Booking.js';

const SECRET = 'test-secret-hana'; // igual que config/env.js (stub de test)
const token = (payload) => jwt.sign(payload, SECRET, { expiresIn: '1h' });
const oid = () => new mongoose.Types.ObjectId().toString();

// App de prueba: solo monta el router de bookings.
function makeApp() {
  const app = express();
  app.use(express.json());
  app.use('/api/bookings', bookingRoutes);
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

describe('POST /api/bookings', () => {
  const clienta = () => ({ id: oid(), tipo: 'clienta' });

  it('crea una reserva (201) con los campos mínimos', async () => {
    const res = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${token(clienta())}`)
      .send({ trabajadora: oid(), regionServicio: 'Metropolitana', comunaServicio: 'Ñuñoa', servicio: 'Manicure' });

    expect(res.status).toBe(201);
    expect(res.body.estado).toBe('pendiente');
    expect(res.body.comunaServicio).toBe('Ñuñoa');
  });

  it('rechaza (400) si falta la trabajadora', async () => {
    const res = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${token(clienta())}`)
      .send({ regionServicio: 'Metropolitana', comunaServicio: 'Ñuñoa' });
    expect(res.status).toBe(400);
    expect(res.body.mensaje).toMatch(/trabajadora/i);
  });

  it('rechaza (400) si falta la región', async () => {
    const res = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${token(clienta())}`)
      .send({ trabajadora: oid(), comunaServicio: 'Ñuñoa' });
    expect(res.status).toBe(400);
    expect(res.body.mensaje).toMatch(/región|region/i);
  });

  it('rechaza (400) si falta la comuna', async () => {
    const res = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${token(clienta())}`)
      .send({ trabajadora: oid(), regionServicio: 'Metropolitana' });
    expect(res.status).toBe(400);
    expect(res.body.mensaje).toMatch(/comuna/i);
  });

  it('rechaza (401) sin token', async () => {
    const res = await request(app)
      .post('/api/bookings')
      .send({ trabajadora: oid(), regionServicio: 'X', comunaServicio: 'Y' });
    expect(res.status).toBe(401);
  });
});

describe('GET /api/bookings/mis-reservas (clienta)', () => {
  it('devuelve solo las reservas de la clienta logueada', async () => {
    const clientaId = oid();
    await Booking.create({ clienta: clientaId, trabajadora: oid(), servicio: 'A' });
    await Booking.create({ clienta: oid(), trabajadora: oid(), servicio: 'B' }); // de otra

    const res = await request(app)
      .get('/api/bookings/mis-reservas?modo=clienta')
      .set('Authorization', `Bearer ${token({ id: clientaId, tipo: 'clienta' })}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].servicio).toBe('A');
  });
});

describe('POST /api/bookings — anti-overbook (hallazgo: sin re-validación)', () => {
  const slot = '2026-07-01T14:00:00.000Z';
  const reservar = (trabajadora) =>
    request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${token({ id: oid(), tipo: 'clienta' })}`)
      .send({ trabajadora, fecha: slot, regionServicio: 'Metropolitana', comunaServicio: 'Ñuñoa' });

  it('ACTUAL: permite dos reservas en el mismo slot (documenta la race condition)', async () => {
    const trabajadora = oid();
    const r1 = await reservar(trabajadora);
    const r2 = await reservar(trabajadora);
    // Hoy ambas se crean: el handler no consulta reservas existentes antes de crear.
    expect(r1.status).toBe(201);
    expect(r2.status).toBe(201);
  });

  // ⛔ REQUISITO anti-overbook (aún no implementado en POST /bookings).
  // it.fails: HOY el segundo POST devuelve 201, por lo que el assert de 409 falla
  // y el test queda "verde". Cuando se agregue la validación de conflicto y el
  // segundo POST devuelva 409, este test empezará a "pasar" e it.fails lo marcará
  // en rojo, recordando convertirlo en un it() normal.
  it.fails('una segunda reserva en el mismo slot debería rechazarse con 409', async () => {
    const trabajadora = oid();
    await reservar(trabajadora);
    const r2 = await reservar(trabajadora);
    expect(r2.status).toBe(409);
  });
});

describe('PUT /api/bookings/:id/completar — seguridad (#B2)', () => {
  it('permite completar a una usuaria autenticada (comportamiento ACTUAL, sin chequeo de permiso)', async () => {
    const reserva = await Booking.create({ clienta: oid(), trabajadora: oid(), servicio: 'A', estado: 'en_curso' });
    const ajena = token({ id: oid(), tipo: 'clienta' }); // ni la clienta ni la trabajadora

    const res = await request(app)
      .put(`/api/bookings/${reserva._id}/completar`)
      .set('Authorization', `Bearer ${ajena}`);

    // Documenta la vulnerabilidad: hoy devuelve 200 aunque la usuaria no tenga relación con la reserva.
    expect(res.status).toBe(200);
    expect(res.body.estado).toBe('completada');
  });

  // ⛔ REQUISITO DE SEGURIDAD #B2 (aún no implementado).
  // Se marca con it.fails: HOY este assert falla (la ruta no valida permisos),
  // por lo que el test queda "verde". Cuando se corrija #B2 y la ruta devuelva 403,
  // este test empezará a "pasar" y it.fails lo marcará en rojo, recordando convertirlo
  // en un it() normal. Es la red de seguridad para el fix.
  it.fails('una usuaria ajena NO debería poder completar la reserva (debe ser 403)', async () => {
    const reserva = await Booking.create({ clienta: oid(), trabajadora: oid(), servicio: 'A', estado: 'en_curso' });
    const ajena = token({ id: oid(), tipo: 'clienta' });

    const res = await request(app)
      .put(`/api/bookings/${reserva._id}/completar`)
      .set('Authorization', `Bearer ${ajena}`);

    expect(res.status).toBe(403);
  });
});