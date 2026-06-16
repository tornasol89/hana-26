import api from "@/lib/api";
import type {
  AuthResponse,
  LoginPayload,
  RegisterPayload,
  RegisterResponse,
  UpdateProfilePayload,
  Usuario,
  UserType,
} from "./types";

export const authApi = {
  login: async (payload: LoginPayload): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>("/auth/login", payload);
    return data;
  },

  // Ahora devuelve RegisterResponse (sin token): la usuaria debe verificar antes de entrar
  register: async (payload: RegisterPayload): Promise<RegisterResponse> => {
    const body = {
      ...payload,
      fechaAceptacion: payload.fechaAceptacion ?? new Date().toISOString(),
    };
    const { data } = await api.post<RegisterResponse>("/auth/register", body);
    return data;
  },

  updateProfile: async (payload: UpdateProfilePayload): Promise<Usuario> => {
    const { data } = await api.put<Usuario>("/auth/me", payload);
    return data;
  },

  uploadPhoto: async (file: File): Promise<Usuario> => {
    const formData = new FormData();
    formData.append("image", file);
    const { data } = await api.post<{ usuario: Usuario }>(
      "/auth/upload-photo",
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return data.usuario;
  },

  uploadCarnet: async (
    file: File,
    lado: "frente" | "dorso"
  ): Promise<Usuario> => {
    const formData = new FormData();
    formData.append("image", file);
    const { data } = await api.post<{ usuario: Usuario }>(
      `/auth/upload-carnet?lado=${lado}`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return data.usuario;
  },

  agregarRol: async (rol: UserType): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>("/auth/agregar-rol", { rol });
    return data;
  },

  getClientaPublico: async (id: string): Promise<Partial<Usuario>> => {
    const { data } = await api.get<Partial<Usuario>>(`/auth/clienta/${id}`);
    return data;
  },

  // ── Verificación de email (router montado en /api/email-verification) ──

  // Verifica el email a partir del token del link (público)
  verifyEmail: async (
    token: string
  ): Promise<{ mensaje: string; email: string }> => {
    const { data } = await api.get<{ mensaje: string; email: string }>(
      "/email-verification/verify",
      { params: { token } }
    );
    return data;
  },

  // Reenvía la verificación para la usuaria logueada (requiere JWT)
  resendVerification: async (): Promise<{ mensaje: string }> => {
    const { data } = await api.post<{ mensaje: string }>(
      "/email-verification/resend"
    );
    return data;
  },

  // Reenvía la verificación desde el login / pantalla de "email enviado" (público,
  // responde igual exista o no la cuenta para no filtrar si un email está registrado)
  resendVerificationPublic: async (
    email: string
  ): Promise<{ mensaje: string }> => {
    const { data } = await api.post<{ mensaje: string }>(
      "/email-verification/resend-public",
      { email }
    );
    return data;
  },
};