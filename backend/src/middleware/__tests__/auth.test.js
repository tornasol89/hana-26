// Pruebas unitarias del middleware protegerRuta (verifyToken).
// Se mockean req/res/next y se firman tokens reales con jsonwebtoken.
import { describe, it, expect, vi, beforeEach } from 'vitest';
import jwt from 'jsonwebtoken';
import protegerRuta from '../auth.js';

const SECRET = 'test-secret-hana'; // mismo valor que config/env.js (stub de test)

// Construye un res falso con status().json() encadenable y espías.
function mockRes() {
  const res = {};
  res.status = vi.fn(() => res);
  res.json = vi.fn(() => res);
  return res;
}

describe('protegerRuta (middleware de autenticación)', () => {
  let next;
  beforeEach(() => {
    next = vi.fn();
  });

  it('rechaza con 401 si no viene el header Authorization', () => {
    const req = { headers: {} };
    const res = mockRes();
    protegerRuta(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ mensaje: 'Acceso denegado, token requerido' });
    expect(next).not.toHaveBeenCalled();
  });

  it('rechaza con 401 si el header no tiene el esquema Bearer (sin token tras el espacio)', () => {
    const req = { headers: { authorization: 'Bearer' } };
    const res = mockRes();
    protegerRuta(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ mensaje: 'Acceso denegado, token requerido' });
    expect(next).not.toHaveBeenCalled();
  });

  it('acepta un token válido, setea req.usuario y llama a next()', () => {
    const payload = { id: 'user123', tipo: 'clienta' };
    const token = jwt.sign(payload, SECRET, { expiresIn: '1h' });
    const req = { headers: { authorization: `Bearer ${token}` } };
    const res = mockRes();

    protegerRuta(req, res, next);

    expect(next).toHaveBeenCalledOnce();
    expect(res.status).not.toHaveBeenCalled();
    expect(req.usuario.id).toBe('user123');
    expect(req.usuario.tipo).toBe('clienta');
  });

  it('rechaza con 401 un token con firma inválida (otro secreto)', () => {
    const token = jwt.sign({ id: 'x' }, 'OTRO-SECRETO');
    const req = { headers: { authorization: `Bearer ${token}` } };
    const res = mockRes();

    protegerRuta(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ mensaje: 'Token inválido o expirado' });
    expect(next).not.toHaveBeenCalled();
  });

  it('rechaza con 401 un token expirado', () => {
    // Firmamos un token que ya expiró (expiresIn negativo).
    const token = jwt.sign({ id: 'x' }, SECRET, { expiresIn: '-1s' });
    const req = { headers: { authorization: `Bearer ${token}` } };
    const res = mockRes();

    protegerRuta(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ mensaje: 'Token inválido o expirado' });
    expect(next).not.toHaveBeenCalled();
  });

  it('rechaza con 401 un token corrupto / no-JWT', () => {
    const req = { headers: { authorization: 'Bearer no-es-un-jwt-valido' } };
    const res = mockRes();

    protegerRuta(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });
});