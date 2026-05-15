import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { capitalizarNombre } from "@/lib/validators";

interface Props {
  nombre: string;
  apellido: string;
  onNombreChange: (value: string) => void;
  onApellidoChange: (value: string) => void;
  disabled?: boolean;
}

/**
 * Dos inputs (Nombre + Apellido) con capitalización automática al perder foco.
 */
export function NombreApellidoFields({
  nombre,
  apellido,
  onNombreChange,
  onApellidoChange,
  disabled,
}: Props) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="space-y-2">
        <Label htmlFor="nombre">Nombre</Label>
        <Input
          id="nombre"
          placeholder="Tu nombre"
          value={nombre}
          onChange={(e) => onNombreChange(e.target.value)}
          onBlur={() => {
            if (nombre) onNombreChange(capitalizarNombre(nombre));
          }}
          disabled={disabled}
          required
          className="h-11"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="apellido">Apellido</Label>
        <Input
          id="apellido"
          placeholder="Tu apellido"
          value={apellido}
          onChange={(e) => onApellidoChange(e.target.value)}
          onBlur={() => {
            if (apellido) onApellidoChange(capitalizarNombre(apellido));
          }}
          disabled={disabled}
          required
          className="h-11"
        />
      </div>
    </div>
  );
}