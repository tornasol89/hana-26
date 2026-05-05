import { useRef } from "react";
import { Award, FileCheck, FileText, Loader2, Upload } from "lucide-react";

interface Props {
  archivo: File | null;
  urlActual?: string;
  uploading: boolean;
  onFileSelected: (file: File) => void;
  disabled?: boolean;
}

const MAX_SIZE_MB = 10;

export function CertificadoUploader({
  archivo,
  urlActual,
  uploading,
  onFileSelected,
  disabled = false,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const isDisabled = disabled || uploading;

  const esImagen =
    archivo
      ? archivo.type.startsWith("image/")
      : urlActual
      ? /\.(jpe?g|png)$/i.test(urlActual)
      : false;

  const previewUrl = archivo && esImagen
    ? URL.createObjectURL(archivo)
    : esImagen && urlActual
    ? urlActual
    : null;

  const tieneArchivo = Boolean(archivo || urlActual);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      alert(`El archivo no puede pesar más de ${MAX_SIZE_MB} MB`);
      return;
    }
    onFileSelected(file);
    e.target.value = "";
  }

  const containerClass = isDisabled
    ? "border-primary/20 cursor-wait opacity-60"
    : tieneArchivo
    ? "border-green-500/40 bg-green-500/5 hover:border-green-500/60 cursor-pointer"
    : "border-primary/30 bg-primary/5 hover:border-primary hover:bg-primary/10 cursor-pointer";

  return (
    <>
      <div
        onClick={() => !isDisabled && inputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-4 transition-all ${containerClass}`}
      >
        <div className="flex items-center gap-4">
          {/* Miniatura / ícono */}
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="Vista previa"
              className="h-20 w-32 object-cover rounded-lg border border-border shrink-0"
            />
          ) : tieneArchivo ? (
            <div className="h-20 w-32 rounded-lg bg-green-100 border border-green-300 flex flex-col items-center justify-center shrink-0 gap-1">
              <FileText className="h-7 w-7 text-green-700" />
              <span className="text-[10px] text-green-700 font-medium">PDF</span>
            </div>
          ) : (
            <div className="h-20 w-32 rounded-lg bg-muted flex items-center justify-center shrink-0">
              <Award className="h-8 w-8 text-muted-foreground" />
            </div>
          )}

          {/* Info + acción */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-medium text-card-foreground text-sm">
                Imagen o PDF del certificado
              </p>
              {tieneArchivo && !uploading && (
                <FileCheck className="h-4 w-4 text-green-600 shrink-0" />
              )}
            </div>

            {archivo ? (
              <p className="text-xs text-muted-foreground mt-0.5 truncate">
                {archivo.name}
              </p>
            ) : (
              <p className="text-xs text-muted-foreground mt-0.5">
                JPG, PNG o PDF · máx. {MAX_SIZE_MB} MB
              </p>
            )}

            <p className="text-xs text-primary mt-1 flex items-center gap-1">
              {uploading ? (
                <>
                  <Loader2 className="h-3 w-3 animate-spin" /> Subiendo...
                </>
              ) : (
                <>
                  <Upload className="h-3 w-3" />
                  {tieneArchivo ? "Cambiar archivo" : "Seleccionar archivo"}
                </>
              )}
            </p>
          </div>
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/jpg,application/pdf"
        className="hidden"
        onChange={handleChange}
        disabled={isDisabled}
      />
    </>
  );
}
