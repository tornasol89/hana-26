import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { validarRut, formatearRutVisual } from "@/lib/validators";

interface Props {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

/**
 * Input de RUT con:
 * - Formateo visual al perder foco
 * - Validación en vivo (rojo si inválido, verde si válido)
 * - Obligatorio
 */
export function RutInput({ value, onChange, disabled }: Props) {
  const rutValido = value.trim() ? validarRut(value) : null;

  return (
    <div className="space-y-2">
      <Label htmlFor="rut">RUT</Label>
      <Input
        id="rut"
        placeholder="12.345.678-9"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={() => {
          if (value) {
            const formateado = formatearRutVisual(value);
            if (formateado) onChange(formateado);
          }
        }}
        disabled={disabled}
        required
        aria-invalid={rutValido === false}
        className={`h-11 ${
          rutValido === false
            ? "border-destructive focus-visible:ring-destructive"
            : rutValido === true
              ? "border-green-500 focus-visible:ring-green-500"
              : ""
        }`}
      />
      {rutValido === false && (
        <p className="text-xs text-destructive">
          RUT inválido. Verifica el número y el dígito verificador.
        </p>
      )}
      {rutValido === true && (
        <p className="text-xs text-success">RUT válido ✓</p>
      )}
    </div>
  );
}