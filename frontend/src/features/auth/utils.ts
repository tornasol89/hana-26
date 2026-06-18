import type { ApiError } from "./types";

/** Extrae el mensaje de error del backend, con fallback genérico */
export function getErrorMessage(error: unknown): string {
  if (
    error &&
    typeof error === "object" &&
    "response" in error &&
    typeof (error as { response?: unknown }).response === "object"
  ) {
    const response = (error as { response: { data?: ApiError } }).response;
    if (response?.data?.mensaje) return response.data.mensaje;
  }
  return "Ocurrió un error inesperado. Intenta de nuevo.";
}