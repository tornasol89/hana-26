import {
  validarRut,
  validarFechaNacimiento,
} from "@/lib/validators";

export interface RegistroFormData {
  nombre: string;
  apellido: string;
  email: string;
  password: string;
  confirmarPassword: string;
  rut: string;
  fechaNacimiento: string;
  region: string;
  comuna: string;
  aceptoCompromiso: boolean;
}

/**
 * Valida un formulario de registro completo.
 * Retorna null si todo está OK, o un mensaje de error legible para mostrar en toast.
 *
 * El orden de las validaciones es intencional y replica el comportamiento original
 * de Registro.tsx para no romper UX (el primer error que ve la persona es el mismo).
 */
export function validarRegistro(data: RegistroFormData): string | null {
  if (!data.nombre.trim() || !data.apellido.trim()) {
    return "Completa tu nombre y apellido";
  }

  if (data.password.length < 6) {
    return "La contraseña debe tener al menos 6 caracteres";
  }

  if (data.password !== data.confirmarPassword) {
    return "Las contraseñas no coinciden";
  }

  if (!data.region || !data.comuna.trim()) {
    return "Selecciona tu región y comuna";
  }

  const resFecha = validarFechaNacimiento(data.fechaNacimiento);
  if (!resFecha.valida) {
    return resFecha.mensaje ?? "Fecha de nacimiento inválida";
  }

  // RUT es opcional: solo se valida si tiene contenido
  if (data.rut.trim() && !validarRut(data.rut)) {
    return "RUT inválido. Verifica el número y el dígito verificador.";
  }

  if (!data.aceptoCompromiso) {
    return "Debes leer y aceptar el Compromiso Hana";
  }

  return null;
}