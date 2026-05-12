import { Calendar } from "lucide-react";

interface Props {
  /** Callback cuando la usuaria clickea "Corregir ahora" */
  onCorregir: () => void;
}

export function FechaNacimientoBanner({ onCorregir }: Props) {
  return (
    <div className="flex items-start gap-3 p-4 rounded-xl border border-amber-500/40 bg-amber-500/5">
      <Calendar className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
      <div className="flex-1">
        <p className="text-sm font-medium text-card-foreground">
          Completa tu fecha de nacimiento
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">
          Tu fecha de nacimiento actual es ficticia (asignada al migrar tu
          cuenta). Corregila para que aparezca tu edad real.
        </p>
        <button
          type="button"
          onClick={onCorregir}
          className="mt-2 text-sm text-primary font-medium hover:underline"
        >
          Corregir ahora
        </button>
      </div>
    </div>
  );
}
