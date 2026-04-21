/**
 * Variables de entorno centralizadas.
 * Todo import.meta.env debería pasar por acá.
 */
export const env = {
  API_URL: import.meta.env.VITE_API_URL ?? "http://localhost:5001/api",
} as const;