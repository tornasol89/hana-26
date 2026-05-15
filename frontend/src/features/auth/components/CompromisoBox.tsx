import { CheckCircle2, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  aceptado: boolean;
  onIrACompromiso: () => void;
}

/**
 * Caja del Compromiso Hana. Dos estados:
 * - Aceptado: caja verde con opción de volver a leer.
 * - No aceptado: caja ámbar con botón para ir a leer y aceptar.
 */
export function CompromisoBox({ aceptado, onIrACompromiso }: Props) {
  if (aceptado) {
    return (
      <div className="pt-1">
        <div className="flex items-start gap-3 p-4 rounded-xl border border-green-500/40 bg-green-500/5">
          <CheckCircle2 className="h-5 w-5 text-success shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-card-foreground">
              Compromiso Hana aceptado
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Ya leíste y aceptaste los términos.{" "}
              <button
                type="button"
                onClick={onIrACompromiso}
                className="text-primary hover:underline"
              >
                Volver a leer
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-1">
      <div className="flex flex-col gap-3 p-4 rounded-xl border border-amber-500/40 bg-amber-500/5">
        <div className="flex items-start gap-3">
          <FileText className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-card-foreground">
              Lee el Compromiso Hana
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Para crear tu cuenta necesitas leer y aceptar nuestro compromiso de
              comunidad.
            </p>
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onIrACompromiso}
          className="self-start"
        >
          Leer y aceptar el Compromiso
        </Button>
      </div>
    </div>
  );
}