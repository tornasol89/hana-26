import { useState } from "react";
import type { UserType } from "@/features/auth/types";

const DRAFT_KEY = "registro_draft";
const COMPROMISO_KEY = "aceptoCompromiso";
const FECHA_ACEPTACION_KEY = "fechaAceptacion";

export interface RegistroDraft {
  tipo: UserType;
  nombre: string;
  apellido: string;
  email: string;
  rut: string;
  fechaNacimiento: string;
  region: string;
  comuna: string;
  // ⚠️ no guardamos password ni confirmarPassword — por seguridad la persona los vuelve a tipear
}

const DRAFT_INICIAL: RegistroDraft = {
  tipo: "clienta",
  nombre: "",
  apellido: "",
  email: "",
  rut: "",
  fechaNacimiento: "",
  region: "",
  comuna: "",
};

function leerDraft(): RegistroDraft {
  try {
    const raw = sessionStorage.getItem(DRAFT_KEY);
    if (!raw) return DRAFT_INICIAL;
    const parsed = JSON.parse(raw) as Partial<RegistroDraft>;
    return { ...DRAFT_INICIAL, ...parsed };
  } catch {
    return DRAFT_INICIAL;
  }
}

export function useRegistroDraft() {
  // Valor inicial: lo que esté en sessionStorage al montar
  const [draftInicial] = useState<RegistroDraft>(leerDraft);

  function guardarDraft(data: RegistroDraft) {
    sessionStorage.setItem(DRAFT_KEY, JSON.stringify(data));
  }

  function limpiarDraft() {
    sessionStorage.removeItem(DRAFT_KEY);
    sessionStorage.removeItem(COMPROMISO_KEY);
    sessionStorage.removeItem(FECHA_ACEPTACION_KEY);
  }

  return { draftInicial, guardarDraft, limpiarDraft };
}