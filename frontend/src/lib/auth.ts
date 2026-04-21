import api from "./api";
import type {
  AuthResponse,
  LoginPayload,
  RegisterPayload,
  Usuario,
} from "@/types/auth";

const TOKEN_KEY = "hana_token";
const USER_KEY = "hana_user";

export const authService = {
  async login(payload: LoginPayload): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>("/auth/login", payload);
    saveSession(data);
    return data;
  },

  async register(payload: RegisterPayload): Promise<AuthResponse> {
    const body = {
      ...payload,
      fechaAceptacion: payload.fechaAceptacion ?? new Date().toISOString(),
    };
    const { data } = await api.post<AuthResponse>("/auth/register", body);
    saveSession(data);
    return data;
  },

  async updateProfile(payload: Partial<Usuario>): Promise<Usuario> {
    const { data } = await api.put<Usuario>("/auth/me", payload);
    localStorage.setItem(USER_KEY, JSON.stringify(data));
    return data;
  },

  async uploadPhoto(file: File): Promise<Usuario> {
    const formData = new FormData();
    formData.append("image", file);
    const { data } = await api.post<{ usuario: Usuario }>(
      "/auth/upload-photo",
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    localStorage.setItem(USER_KEY, JSON.stringify(data.usuario));
    return data.usuario;
  },

  async uploadCarnet(file: File, lado: "frente" | "dorso"): Promise<Usuario> {
    const formData = new FormData();
    formData.append("image", file);
    const { data } = await api.post<{ usuario: Usuario }>(
      `/auth/upload-carnet?lado=${lado}`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    localStorage.setItem(USER_KEY, JSON.stringify(data.usuario));
    return data.usuario;
  },

  logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  getStoredUser(): Usuario | null {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as Usuario;
    } catch {
      return null;
    }
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  },
};

function saveSession({ token, usuario }: AuthResponse) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(usuario));
}

// Helper para extraer el mensaje de error del backend
export function getErrorMessage(error: unknown): string {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    typeof (error as { response?: unknown }).response === "object"
  ) {
    const response = (error as { response: { data?: { mensaje?: string } } }).response;
    if (response?.data?.mensaje) return response.data.mensaje;
  }
  return "Ocurrió un error inesperado. Intenta de nuevo.";
}