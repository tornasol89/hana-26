import { useRef } from "react";
import { FileCheck, IdCard, Loader2, Upload } from "lucide-react";

interface Props {
  titulo: string;
  descripcion: string;
  urlActual?: string | null;
  uploading: boolean;
  onFileSelected: (file: File) => void;
  disabled?: boolean;
}

const MAX_SIZE_MB = 10;

export function CarnetUploader({
  titulo,
  descripcion,
  urlActual,
  uploading,
  onFileSelected,
  disabled = false,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const tieneImagen = Boolean(urlActual);
  const isDisabled = disabled || uploading;

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      alert(`El documento no puede pesar más de ${MAX_SIZE_MB} MB`);
      return;
    }
    onFileSelected(file);
    e.target.value = "";
  }

  const containerClass = isDisabled
    ? "border-primary/20 cursor-wait"
    : tieneImagen
    ? "border-green-500/40 bg-green-500/5 hover:border-green-500/60 cursor-pointer"
    : "border-primary/30 bg-primary/5 hover:border-primary hover:bg-primary/10 cursor-pointer";

  return (
    <>
      <div
        onClick={() => !isDisabled && inputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-4 transition-all ${containerClass}`}
      >
        <div className="flex items-center gap-4">
          {urlActual ? (
            <img
              src={urlActual}
              alt={titulo}
              className="h-20 w-32 object-cover rounded-lg border border-border"
            />
          ) : (
            <div className="h-20 w-32 rounded-lg bg-muted flex items-center justify-center">
              <IdCard className="h-8 w-8 text-muted-foreground" />
            </div>
          )}
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <p className="font-medium text-card-foreground">{titulo}</p>
              {tieneImagen && !uploading && <FileCheck className="h-4 w-4 text-green-600" />}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">{descripcion}</p>
            <p className="text-xs text-primary mt-1 flex items-center gap-1">
              {uploading ? (
                <>
                  <Loader2 className="h-3 w-3 animate-spin" /> Subiendo...
                </>
              ) : (
                <>
                  <Upload className="h-3 w-3" />
                  {tieneImagen ? "Cambiar imagen" : "Seleccionar archivo"}
                </>
              )}
            </p>
          </div>
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/jpg"
        className="hidden"
        onChange={handleChange}
      />
    </>
  );
}