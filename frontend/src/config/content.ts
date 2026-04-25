/**
 * Contenido estático de la plataforma (secciones legales, estadísticas, etc.)
 * Mantener este archivo separado facilita actualizaciones sin tocar componentes.
 */

// ─── Compromiso Hana ───────────────────────────────────────────

export interface SeccionCompromiso {
  titulo: string;
  contenido: string;
}

export const SECCIONES_COMPROMISO: SeccionCompromiso[] = [
  {
    titulo: "1. Quiénes somos",
    contenido:
      "Hana es una plataforma digital que conecta mujeres que ofrecen servicios profesionales con mujeres que los necesitan. Nuestro propósito es crear un espacio seguro, confiable y empoderador para todas las partes.",
  },
  {
    titulo: "2. Compromiso de respeto",
    contenido:
      "Todas las usuarias de Hana se comprometen a tratar a las demás con respeto, dignidad y cordialidad. Cualquier conducta discriminatoria, abusiva o irrespetuosa será motivo de suspensión inmediata de la cuenta.",
  },
  {
    titulo: "3. Veracidad de la información",
    contenido:
      "Las trabajadoras se comprometen a proporcionar información veraz sobre sus habilidades, experiencia y disponibilidad. Las clientas se comprometen a describir correctamente sus necesidades y a respetar los tiempos acordados.",
  },
  {
    titulo: "4. Seguridad y privacidad",
    contenido:
      "Hana protege los datos personales de sus usuarias conforme a la Ley 19.628 sobre protección de datos personales de Chile. No compartiremos tu información con terceros sin tu consentimiento explícito, salvo obligación legal.",
  },
  {
    titulo: "5. Sistema de verificación",
    contenido:
      "Las trabajadoras pasan por un proceso de verificación de identidad (carnet por ambos lados) antes de ser publicadas como profesionales activas. El estado de verificación es visible para las clientas.",
  },
  {
    titulo: "6. Sistema de evaluaciones",
    contenido:
      "Ambas partes pueden evaluarse mutuamente tras cada servicio. Las evaluaciones son públicas y contribuyen al Índice Hana de confianza. Está prohibido el intercambio de evaluaciones falsas o coaccionadas.",
  },
  {
    titulo: "7. Reservas y pagos",
    contenido:
      "Las condiciones de pago se acuerdan directamente entre clienta y trabajadora. Hana no intermedia pagos en esta etapa. Las disputas deben reportarse a través de los canales de soporte de la plataforma.",
  },
  {
    titulo: "8. Cancelaciones",
    contenido:
      "Se recomienda avisar con al menos 24 horas de anticipación ante una cancelación. Cancelaciones reiteradas sin aviso pueden afectar el Índice Hana de la usuaria.",
  },
  {
    titulo: "9. Uso aceptable",
    contenido:
      "Hana es una plataforma exclusiva para mujeres. Está prohibido el uso de la plataforma para ofrecer servicios ilegales, eludir el sistema de evaluaciones, o contactar a otras usuarias con fines distintos al servicio contratado.",
  },
  {
    titulo: "10. Modificaciones",
    contenido:
      "Hana puede actualizar estos términos. Las usuarias serán notificadas y deberán aceptar las nuevas condiciones para continuar usando la plataforma.",
  },
];

// ─── Impacto: estadísticas ────────────────────────────────────

export interface EstadisticaImpacto {
  num: string;
  label: string;
  fuente: string;
  tono: "primary" | "accent" | "success" | "warning";
}

export const ESTADISTICAS_PRINCIPALES: EstadisticaImpacto[] = [
  {
    num: "50%",
    label: "De los hogares en Chile está liderado por una mujer",
    fuente: "Fundación Sol, 2024",
    tono: "primary",
  },
  {
    num: "8/10",
    label: "Hogares monoparentales tienen jefatura femenina",
    fuente: "Censo INE, 2024",
    tono: "primary",
  },
  {
    num: "21,8%",
    label: "De los hogares son unipersonales — y sigue subiendo",
    fuente: "Censo INE, 2024",
    tono: "accent",
  },
  {
    num: "77%",
    label: "De las mujeres se ha sentido insegura en espacios públicos",
    fuente: "Encuesta Humanas, 2025",
    tono: "accent",
  },
];

export const ESTADISTICAS_FINALES: EstadisticaImpacto[] = [
  {
    num: "92%",
    label: "De las mujeres valora el trabajo como fuente de autonomía e independencia",
    fuente: "Humanas, 2025",
    tono: "success",
  },
  {
    num: "59%",
    label: "De las mujeres empleadas en el mundo trabaja en el sector servicios",
    fuente: "Banco Mundial, 2024",
    tono: "success",
  },
  {
    num: "2M",
    label: "De hogares liderados por mujeres en Chile hoy vs 642 mil en los 90s",
    fuente: "Fundación Sol, 2024",
    tono: "primary",
  },
  {
    num: "30+",
    label: "Años de transformación sostenida en la estructura familiar chilena",
    fuente: "INE / CASEN",
    tono: "accent",
  },
];

// ─── Impacto: series de datos ─────────────────────────────────

export const JEFATURA_FEMENINA = [
  { año: "1990", valor: 20 },
  { año: "2000", valor: 30 },
  { año: "2010", valor: 38 },
  { año: "2017", valor: 42 },
  { año: "2024", valor: 50 },
];

export const HOGARES_UNIPERSONALES = [
  { año: "2006", valor: 8.7 },
  { año: "2017", valor: 15.4 },
  { año: "2024", valor: 21.8 },
];

export const SEGURIDAD_MUJERES = [
  { label: "Espacio público", valor: 77 },
  { label: "Transporte público", valor: 69 },
  { label: "Plazas y parques", valor: 67 },
  { label: "Redes sociales", valor: 63 },
];