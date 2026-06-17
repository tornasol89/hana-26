// @vitest-environment jsdom
// frontend/src/features/auth/__tests__/hooks.test.tsx
//
// Pruebas unitarias de los hooks de mutación de auth (useLogin, useRegister,
// useLogout). Se mockea la capa de red (authApi), la sesión, el contexto de
// auth y los toasts; TanStack Query se usa real con un QueryClient de prueba.
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// ── Mocks de dependencias ───────────────────────────────────────────────────
const refreshUser = vi.fn();
const logout = vi.fn();
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ refreshUser, logout, user: null, isAuthenticated: false }),
}));

const login = vi.fn();
const register = vi.fn();
vi.mock('../api', () => ({ authApi: { login: (p: unknown) => login(p), register: (p: unknown) => register(p) } }));

const sessionSave = vi.fn();
vi.mock('../session', () => ({ session: { save: (d: unknown) => sessionSave(d), clear: vi.fn() } }));

vi.mock('../utils', () => ({ getErrorMessage: (e: Error) => e.message }));

const toastError = vi.fn();
const toastSuccess = vi.fn();
vi.mock('sonner', () => ({ toast: { error: (m: string) => toastError(m), success: (m: string) => toastSuccess(m) } }));

import { useLogin, useRegister, useLogout } from '../hooks';

// Wrapper con un QueryClient que no reintenta (para que onError dispare ya).
function wrapper({ children }: { children: React.ReactNode }) {
  const client = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
});

describe('useLogin', () => {
  it('en éxito guarda la sesión y refresca el usuario', async () => {
    const usuario = { id: 'u1', nombre: 'Maria' };
    login.mockResolvedValue({ token: 'jwt-abc', usuario });

    const { result } = renderHook(() => useLogin(), { wrapper });
    await act(async () => {
      await result.current.mutateAsync({ email: 'a@b.cl', password: 'x' });
    });

    expect(login).toHaveBeenCalledWith({ email: 'a@b.cl', password: 'x' });
    expect(sessionSave).toHaveBeenCalledWith({ token: 'jwt-abc', usuario });
    expect(refreshUser).toHaveBeenCalledWith(usuario);
  });

  it('en error muestra un toast con el mensaje y no guarda sesión', async () => {
    login.mockRejectedValue(new Error('Credenciales inválidas'));

    const { result } = renderHook(() => useLogin(), { wrapper });
    await act(async () => {
      await result.current.mutateAsync({ email: 'a@b.cl', password: 'mal' }).catch(() => {});
    });

    await waitFor(() => expect(toastError).toHaveBeenCalledWith('Credenciales inválidas'));
    expect(sessionSave).not.toHaveBeenCalled();
    expect(refreshUser).not.toHaveBeenCalled();
  });
});

describe('useRegister', () => {
  // Payload completo que satisface RegisterPayload (valores de relleno; register está mockeado)
  const registerPayload = {
    email: 'n@b.cl',
    password: 'x',
    nombre: 'Ana',
    apellido: 'Pérez',
    tipo: 'clienta',
    aceptoCompromiso: true,
    fechaNacimiento: '2000-01-01',
  };

  it('en éxito llama a authApi.register con el payload', async () => {
    register.mockResolvedValue({ id: 'u2' });

    const { result } = renderHook(() => useRegister(), { wrapper });
    await act(async () => { await result.current.mutateAsync(registerPayload); });

    expect(register).toHaveBeenCalledWith(registerPayload);
    expect(toastError).not.toHaveBeenCalled();
  });

  it('en error muestra un toast', async () => {
    register.mockRejectedValue(new Error('El email ya está registrado'));

    const { result } = renderHook(() => useRegister(), { wrapper });
    await act(async () => {
      await result.current.mutateAsync(registerPayload).catch(() => {});
    });

    await waitFor(() => expect(toastError).toHaveBeenCalledWith('El email ya está registrado'));
  });
});

describe('useLogout', () => {
  it('limpia contexto, cache y los flags del compromiso en localStorage', () => {
    localStorage.setItem('aceptoCompromiso', 'true');
    localStorage.setItem('fechaAceptacion', '2026-06-16');

    const { result } = renderHook(() => useLogout(), { wrapper });
    act(() => { result.current(); });

    expect(logout).toHaveBeenCalledOnce();
    expect(localStorage.getItem('aceptoCompromiso')).toBeNull();
    expect(localStorage.getItem('fechaAceptacion')).toBeNull();
  });
});