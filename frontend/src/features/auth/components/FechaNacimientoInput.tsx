import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EDAD_MINIMA } from "@/lib/validators";

interface Props {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  error?: string;
}

/** Fecha máxima permitida: exactamente EDAD_MINIMA años atrás desde hoy. */
function getFechaMaxima(): string {
  const hoy = new Date();
  const max = new Date(
    hoy.getFullYear() - EDAD_MINIMA,
    hoy.getMonth(),
    hoy.getDate(),
  );
  return max.toISOString().split("T")[0];
}

/** Fecha mínima razonable: hace 120 años. */
function getFechaMinima(): string {
  const hoy = new Date();
  const min = new Date(hoy.getFullYear() - 120, hoy.getMonth(), hoy.getDate());
  return min.toISOString().split("T")[0];
}

export function FechaNacimientoInput({ value, onChange, disabled, error }: Props) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor="fechaNacimiento">Fecha de nacimiento</Label>
      <Input
        id="fechaNacimiento"
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        min={getFechaMinima()}
        max={getFechaMaxima()}
        className={`h-11 ${error ? "border-destructive focus-visible:ring-destructive/30" : ""}`}
      />
      {error ? (
        <p className="text-xs text-destructive">{error}</p>
      ) : (
        <p className="text-xs text-muted-foreground">
          Debes tener al menos {EDAD_MINIMA} años para registrarte.
        </p>
      )}
    </div>
  );
}