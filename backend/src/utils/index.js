// backend/src/utils/index.js
export { capitalizarNombre, normalizarRut } from './normalize.js';
export {
  validarRut,
  calcularEdad,
  esMayorDeEdad,
  validarFechaNacimiento,
  EDAD_MINIMA,
} from './validators.js';
export { aHoraLocalHHMM, rangoDiaLocalUTC, TIMEZONE_HANA } from './timezone.js';