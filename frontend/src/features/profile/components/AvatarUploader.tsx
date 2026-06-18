import { useRef } from "react";
import { Camera, Loader2, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Props {
  src?: string | null;
  fallback: string;
  uploading: boolean;
  onFileSelected: (file: File) => void;
  size?: number;
}

const MAX_SIZE_MB = 5;

export function AvatarUploader({
  src,
  fallback,
  uploading,
  onFileSelected,
  size = 96,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      alert(`La imagen no puede pesar más de ${MAX_SIZE_MB} MB`);
      return;
    }
    onFileSelected(file);
    // Reset para poder volver a subir la misma imagen
    e.target.value = "";
  }

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <Avatar className="border-2 border-primary/30" style={{ width: size, height: size }}>
        <AvatarImage src={src ?? undefined} alt="Foto de perfil" />
        <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
          {fallback || <User className="h-10 w-10" />}
        </AvatarFallback>
      </Avatar>

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center border-2 border-card shadow-soft hover:scale-110 transition-transform disabled:opacity-50 disabled:cursor-wait"
        aria-label="Cambiar foto de perfil"
      >
        {uploading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Camera className="h-4 w-4" />
        )}
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleChange}
      />
    </div>
  );
}