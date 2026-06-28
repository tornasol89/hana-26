import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { REGIONES_CHILE, COMUNAS_POR_REGION } from "@/config/constants";

interface Props {
  region: string;
  comuna: string;
  onRegionChange: (region: string) => void;
  onComunaChange: (comuna: string) => void;
  disabled?: boolean;
  errorRegion?: string;
  errorComuna?: string;
}

/**
 * Selects dependientes: al cambiar región, comuna se resetea automáticamente.
 */
export function UbicacionFields({
  region,
  comuna,
  onRegionChange,
  onComunaChange,
  disabled,
  errorRegion,
  errorComuna,
}: Props) {
  return (
    <>
      <div className="space-y-1.5">
        <Label htmlFor="region">Región</Label>
        <Select
          value={region}
          onValueChange={(v) => {
            onRegionChange(v);
            onComunaChange(""); // reset comuna al cambiar región
          }}
          disabled={disabled}
        >
          <SelectTrigger id="region" className="h-11">
            <SelectValue placeholder="Selecciona tu región" />
          </SelectTrigger>
          <SelectContent>
            {REGIONES_CHILE.map((r) => (
              <SelectItem key={r} value={r}>
                {r}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errorRegion && <p className="text-xs text-destructive">{errorRegion}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="comuna">
          Comuna
          {!region && (
            <span className="text-xs text-muted-foreground ml-1">
              (selecciona primero tu región)
            </span>
          )}
        </Label>
        <Select
          value={comuna}
          onValueChange={onComunaChange}
          disabled={disabled || !region}
        >
          <SelectTrigger id="comuna" className="h-11">
            <SelectValue
              placeholder={
                region
                  ? "Selecciona tu comuna"
                  : "Primero selecciona una región"
              }
            />
          </SelectTrigger>
          <SelectContent>
            {(COMUNAS_POR_REGION[region] ?? []).map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errorComuna && <p className="text-xs text-destructive">{errorComuna}</p>}
      </div>
    </>
  );
}