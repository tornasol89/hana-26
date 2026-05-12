import api from "@/lib/api";
import type {
  AuthResponse,
  LoginPayload,
  RegisterPayload,
  UpdateProfilePayload,  
  Usuario,
} from "./types";

export const authApi = {
  login: async (payload: LoginPayload): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>("/auth/login", payload);
    return data;
  },

  register: async (payload: RegisterPayload): Promise<AuthResponse> => {
    const body = {
      ...payload,
      fechaAceptacion: payload.fechaAceptacion ?? new Date().toISOString(),
    };
    const { data } = await api.post<AuthResponse>("/auth/register", body);
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
};